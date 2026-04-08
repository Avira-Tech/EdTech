import Question from '../models/Question.js';
import Course from '../models/Course.js';

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
export const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      course,
      type,
      difficulty,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (course) query.course = course;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Teachers can only see questions for their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user._id });
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const questions = await Question.find(query)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private (Admin, Teacher)
export const createQuestion = async (req, res) => {
  try {
    const {
      question,
      type,
      course,
      module,
      lesson,
      assignment,
      options,
      correctAnswer,
      explanation,
      points,
      difficulty,
      tags
    } = req.body;

    // Verify course exists and user has access
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = courseDoc.instructor.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // For multiple choice questions, validate options
    if (type === 'multiple-choice') {
      if (!options || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have at least 2 options'
        });
      }
      
      // Ensure at least one option is marked as correct
      const hasCorrectOption = options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        return res.status(400).json({
          success: false,
          message: 'At least one option must be marked as correct'
        });
      }
    }

    const questionDoc = await Question.create({
      question,
      type,
      course,
      module,
      lesson,
      assignment,
      options: options || [],
      correctAnswer,
      explanation,
      points: points || 1,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      createdBy: req.user._id
    });

    const populatedQuestion = await Question.findById(questionDoc._id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: populatedQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// @desc    Create multiple questions (bulk)
// @route   POST /api/questions/bulk
// @access  Private (Admin, Teacher)
export const createBulkQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    // Verify course access for all questions
    const courseIds = [...new Set(questions.map(q => q.course))];
    const courses = await Course.find({ _id: { $in: courseIds } });
    const courseMap = new Map(courses.map(c => [c._id.toString(), c]));

    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    
    for (const q of questions) {
      const course = courseMap.get(q.course);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course not found for question: ${q.question?.substring(0, 50)}...`
        });
      }
      
      if (!isAdmin && course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied for one or more courses'
        });
      }
    }

    // Prepare questions with createdBy
    const questionsWithCreator = questions.map(q => ({
      ...q,
      createdBy: req.user._id
    }));

    const createdQuestions = await Question.insertMany(questionsWithCreator);

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      data: createdQuestions
    });
  } catch (error) {
    console.error('Create bulk questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating questions',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin, Teacher - owner only)
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = question.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedFields = [
      'question', 'type', 'module', 'lesson', 'assignment',
      'options', 'correctAnswer', 'explanation', 'points',
      'difficulty', 'tags', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();

    const updatedQuestion = await Question.findById(question._id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin, Teacher - owner only)
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = question.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// @desc    Delete multiple questions
// @route   POST /api/questions/delete-bulk
// @access  Private (Admin, Teacher)
export const deleteBulkQuestions = async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question IDs array is required'
      });
    }

    // Check permissions for all questions
    const questions = await Question.find({ _id: { $in: questionIds } });
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    for (const q of questions) {
      if (!isAdmin && q.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied for one or more questions'
        });
      }
    }

    const result = await Question.deleteMany({ _id: { $in: questionIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} questions deleted successfully`
    });
  } catch (error) {
    console.error('Delete bulk questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting questions',
      error: error.message
    });
  }
};

// @desc    Get question statistics
// @route   GET /api/questions/stats
// @access  Private (Admin, Teacher)
export const getQuestionStats = async (req, res) => {
  try {
    const query = {};

    // Teachers can only see stats for their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user._id });
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    const totalQuestions = await Question.countDocuments(query);

    const byType = await Question.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const byDifficulty = await Question.aggregate([
      { $match: query },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const byCourse = await Question.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $group: {
          _id: '$courseInfo.title',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const unusedQuestions = await Question.countDocuments({
      ...query,
      timesUsed: 0
    });

    res.json({
      success: true,
      data: {
        totalQuestions,
        byType,
        byDifficulty,
        byCourse,
        unusedQuestions
      }
    });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question statistics',
      error: error.message
    });
  }
};

// @desc    Get question categories/tags
// @route   GET /api/questions/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const query = {};

    // Teachers can only see categories for their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user._id });
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    const tags = await Question.distinct('tags', query);

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

