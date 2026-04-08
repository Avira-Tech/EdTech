import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Submission from '../models/Submission.js';

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      course,
      type,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (course) query.course = course;
    if (type) query.type = type;
    if (status) {
      if (status === 'active') query.isActive = true;
      else if (status === 'closed') query.isActive = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Teachers can only see assignments for their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user._id });
      query.course = { $in: teacherCourses.map(c => c._id) };
    }

    // Students can only see published assignments
    if (req.user.role === 'student') {
      query.isActive = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const assignments = await Assignment.find(query)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get submission counts
    const assignmentsWithCounts = await Promise.all(assignments.map(async (a) => {
      const submissionCount = await Submission.countDocuments({ assignment: a._id });
      const data = a.toObject();
      return {
        ...data,
        submissionCount
      };
    }));

    const total = await Assignment.countDocuments(query);

    res.json({
      success: true,
      data: assignmentsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title description')
      .populate('createdBy', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check access for draft assignments
    if (!assignment.isActive) {
      const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
      const isTeacher = assignment.createdBy._id.toString() === req.user._id.toString();
      
      if (!isAdmin && !isTeacher) {
        return res.status(403).json({
          success: false,
          message: 'This assignment is not available'
        });
      }
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Admin, Teacher)
export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      module,
      lesson,
      type,
      instructions,
      dueDate,
      points,
      passingScore,
      attempts,
      timeLimit,
      attachments,
      questions
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

    const assignment = await Assignment.create({
      title,
      description,
      course,
      module,
      lesson,
      type: type || 'assignment',
      instructions,
      dueDate: new Date(dueDate),
      points: points || 100,
      passingScore: passingScore || 60,
      attempts: attempts || 1,
      timeLimit,
      attachments: attachments || [],
      questions: questions || [],
      createdBy: req.user._id
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populatedAssignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Admin, Teacher - owner only)
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedFields = [
      'title', 'description', 'module', 'lesson', 'type',
      'instructions', 'dueDate', 'points', 'passingScore',
      'attempts', 'timeLimit', 'isActive', 'attachments', 'questions'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate') {
          assignment[field] = new Date(req.body[field]);
        } else {
          assignment[field] = req.body[field];
        }
      }
    });

    await assignment.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin, Teacher - owner only)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete related submissions
    await Submission.deleteMany({ assignment: assignment._id });

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private (Admin, Teacher)
export const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check access
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'firstName lastName email avatar')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment is active
    if (!assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This assignment is no longer accepting submissions'
      });
    }

    // Check if due date has passed
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Due date has passed'
      });
    }

    // Check existing submissions
    const existingSubmission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id
    });

    if (existingSubmission && assignment.attempts === 1) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }

    // Create submission
    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      content: req.body.content,
      attachments: req.body.attachments || [],
      attemptNumber: existingSubmission ? existingSubmission.attemptNumber + 1 : 1
    });

    // Track analytics
    // This would be handled by the analytics service

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: populatedSubmission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @access  Private (Admin, Teacher)
export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, status } = req.body;

    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check permissions
    const assignment = await Assignment.findById(req.params.id);
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = status || 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'firstName lastName email')
      .populate('gradedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: populatedSubmission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message
    });
  }
};

// @desc    Get student's submissions
// @route   GET /api/assignments/my-submissions
// @access  Private (Student)
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title dueDate points')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

