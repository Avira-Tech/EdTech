import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      level,
      instructor,
      search,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      pricingType
    } = req.query;

    // Build query
    const query = {};

    // Non-admin users can only see published courses
    if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    if (featured === 'true') query.featured = true;
    
    if (pricingType) {
      query['pricing.type'] = pricingType;
      if (minPrice) query['pricing.price'] = { $gte: parseFloat(minPrice) };
      if (maxPrice) {
        query['pricing.price'] = {
          ...query['pricing.price'],
          $lte: parseFloat(maxPrice)
        };
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Teachers can only see their own courses
    if (req.user.role === 'teacher') {
      query.instructor = req.user._id;
    }

    // Build sort
    const sort = {};
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'enrollment') {
      sort.enrollmentCount = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName avatar bio')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check access for draft courses
    if (course.status === 'draft') {
      if (!['superadmin', 'admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'This course is not available'
        });
      }
      // Teachers can only view their own draft courses
      if (req.user.role === 'teacher' && course.instructor._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin, Teacher)
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      subcategory,
      tags,
      pricing,
      duration,
      level,
      language,
      requirements,
      objectives,
      whatYouWillLearn,
      modules
    } = req.body;

    // Create course
    const course = await Course.create({
      title,
      description,
      shortDescription,
      category,
      subcategory,
      tags,
      pricing,
      duration,
      level,
      language,
      requirements,
      objectives,
      whatYouWillLearn,
      modules,
      instructor: req.user.role === 'teacher' ? req.user._id : req.body.instructor || req.user._id,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // If teacher, add to assigned courses
    if (req.user.role === 'teacher') {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { assignedCourses: course._id }
      });
    }

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin, Teacher)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'description', 'shortDescription', 'category', 'subcategory',
      'tags', 'pricing', 'duration', 'level', 'language', 'requirements',
      'objectives', 'whatYouWillLearn', 'modules', 'status', 'featured',
      'thumbnail', 'previewVideo'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    course.updatedBy = req.user._id;

    // Set published date if publishing
    if (req.body.status === 'published' && course.status !== 'published') {
      course.publishedAt = new Date();
    }

    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('instructor', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin, Teacher)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete enrollments
    await Enrollment.deleteMany({ course: course._id });

    // Remove from teacher assigned courses
    await User.updateMany(
      { assignedCourses: course._id },
      { $pull: { assignedCourses: course._id } }
    );

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private (Admin, Teacher)
export const getCourseStats = async (req, res) => {
  try {
    const query = {};
    
    // Teachers see only their courses
    if (req.user.role === 'teacher') {
      query.instructor = req.user._id;
    }

    const stats = await Course.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCourses = await Course.countDocuments(query);
    const publishedCourses = await Course.countDocuments({ ...query, status: 'published' });
    const draftCourses = await Course.countDocuments({ ...query, status: 'draft' });

    const categoryStats = await Course.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalEnrollments: { $sum: '$enrollmentCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        publishedCourses,
        draftCourses,
        byStatus: stats,
        topCategories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
};

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Private (Admin, Teacher)
export const addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    const isOwner = course.instructor.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { title, description, lessons } = req.body;

    course.modules.push({
      title,
      description,
      order: course.modules.length + 1,
      lessons: lessons || []
    });

    await course.save();

    res.json({
      success: true,
      message: 'Module added successfully',
      data: course.modules
    });
  } catch (error) {
    console.error('Add module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message
    });
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
export const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check if course is free
    if (course.pricing.type !== 'free' && course.pricing.price > 0) {
      // In production, process payment here
      return res.status(400).json({
        success: false,
        message: 'Payment required to enroll',
        paymentRequired: true,
        amount: course.pricing.discountedPrice || course.pricing.price
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      status: 'active',
      payment: {
        method: 'free',
        status: 'completed',
        amount: 0
      }
    });

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};

