import express from 'express';
import { body, param, query } from 'express-validator';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate, mongoIdValidation, paginationValidation } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @desc    Get student enrollments (my courses)
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
router.get(
  '/my-courses',
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find({ student: req.user._id })
        .populate('course', 'title thumbnail description instructor duration modules')
        .sort({ enrolledAt: -1 });

      // Add progress calculation if not present
      const enrichedEnrollments = enrollments.map(enrollment => {
        const totalLessons = enrollment.course?.modules?.reduce(
          (acc, m) => acc + (m.lessons?.length || 0), 0
        ) || 0;
        const completedLessons = enrollment.progress?.completedLessons?.length || 0;
        const percentage = totalLessons > 0 
          ? Math.round((completedLessons / totalLessons) * 100) 
          : 0;

        return {
          ...enrollment.toObject(),
          progress: {
            ...enrollment.progress?.toObject(),
            percentage,
            completedLessons,
            totalLessons
          }
        };
      });

      res.json({
        success: true,
        data: enrichedEnrollments
      });
    } catch (error) {
      console.error('Get my enrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching enrollments',
        error: error.message
      });
    }
  }
);

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findById(req.params.id)
        .populate('course', 'title thumbnail description modules')
        .populate('student', 'firstName lastName email');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Check access
      const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
      const isOwner = enrollment.student._id.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('Get enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching enrollment',
        error: error.message
      });
    }
  }
);

// @desc    Get course progress
// @route   GET /api/enrollments/:courseId/progress
// @access  Private
router.get(
  '/:courseId/progress',
  mongoIdValidation,
  validate,
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findOne({
        course: req.params.courseId,
        student: req.user._id
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      const course = await Course.findById(req.params.courseId);
      const totalLessons = course?.modules?.reduce(
        (acc, m) => acc + (m.lessons?.length || 0), 0
      ) || 0;
      const completedLessons = enrollment.progress?.completedLessons?.length || 0;
      const percentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      res.json({
        success: true,
        data: {
          enrollmentId: enrollment._id,
          courseId: req.params.courseId,
          percentage,
          completedLessons,
          totalLessons,
          completedLessonIds: enrollment.progress?.completedLessons || [],
          lastAccessedAt: enrollment.lastAccessedAt,
          status: enrollment.status
        }
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching progress',
        error: error.message
      });
    }
  }
);

// @desc    Update enrollment progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private
router.put(
  '/:courseId/progress',
  mongoIdValidation,
  validate,
  async (req, res) => {
    try {
      const { completedLessons, status } = req.body;

      const enrollment = await Enrollment.findOne({
        course: req.params.courseId,
        student: req.user._id
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (completedLessons !== undefined) {
        enrollment.progress.completedLessons = completedLessons;
      }

      if (status) {
        enrollment.status = status;
      }

      enrollment.lastAccessedAt = new Date();
      await enrollment.save();

      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: enrollment
      });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: error.message
      });
    }
  }
);

// @desc    Mark lesson as complete
// @route   POST /api/enrollments/:courseId/lessons/:lessonId/complete
// @access  Private
router.post(
  '/:courseId/lessons/:lessonId/complete',
  mongoIdValidation,
  validate,
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;

      const enrollment = await Enrollment.findOne({
        course: courseId,
        student: req.user._id
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Add lesson to completed if not already
      const completedLessons = enrollment.progress.completedLessons || [];
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        enrollment.progress.completedLessons = completedLessons;
      }

      enrollment.lastAccessedAt = new Date();
      await enrollment.save();

      // Check if course is complete
      const course = await Course.findById(courseId);
      const totalLessons = course?.modules?.reduce(
        (acc, m) => acc + (m.lessons?.length || 0), 0
      ) || 0;
      const percentage = totalLessons > 0 
        ? Math.round((completedLessons.length / totalLessons) * 100) 
        : 0;

      if (percentage === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        await enrollment.save();
      }

      res.json({
        success: true,
        message: 'Lesson marked as complete',
        data: {
          lessonId,
          completedLessons: enrollment.progress.completedLessons,
          percentage,
          isComplete: percentage === 100
        }
      });
    } catch (error) {
      console.error('Mark lesson complete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking lesson as complete',
        error: error.message
      });
    }
  }
);

// @desc    Get all enrollments (Admin/Teacher)
// @route   GET /api/enrollments
// @access  Private (Admin, Teacher)
router.get(
  '/',
  authorize('superadmin', 'admin', 'teacher'),
  paginationValidation,
  async (req, res) => {
    try {
      const { courseId, status, studentId } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const query = {};

      if (courseId) query.course = courseId;
      if (status) query.status = status;
      if (studentId) query.student = studentId;

      // Teachers can only see enrollments for their courses
      if (req.user.role === 'teacher') {
        const courses = await Course.find({ instructor: req.user._id }).select('_id');
        query.course = { $in: courses.map(c => c._id) };
      }

      const enrollments = await Enrollment.find(query)
        .populate('student', 'firstName lastName email avatar')
        .populate('course', 'title thumbnail')
        .sort({ enrolledAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Enrollment.countDocuments(query);

      res.json({
        success: true,
        data: enrollments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching enrollments',
        error: error.message
      });
    }
  }
);

// @desc    Create enrollment (manual)
// @route   POST /api/enrollments
// @access  Private (Admin)
router.post(
  '/',
  authorize('superadmin', 'admin'),
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('courseId').notEmpty().withMessage('Course ID is required')
  ],
  validate,
  async (req, res) => {
    try {
      const { studentId, courseId } = req.body;

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if already enrolled
      const existing = await Enrollment.findOne({
        student: studentId,
        course: courseId
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Student is already enrolled in this course'
        });
      }

      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        enrolledBy: req.user._id,
        status: 'active'
      });

      const populatedEnrollment = await Enrollment.findById(enrollment._id)
        .populate('student', 'firstName lastName email')
        .populate('course', 'title thumbnail');

      res.status(201).json({
        success: true,
        message: 'Enrollment created successfully',
        data: populatedEnrollment
      });
    } catch (error) {
      console.error('Create enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating enrollment',
        error: error.message
      });
    }
  }
);

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private (Admin)
router.delete(
  '/:id',
  authorize('superadmin', 'admin'),
  mongoIdValidation,
  validate,
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findById(req.params.id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      await Enrollment.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Enrollment deleted successfully'
      });
    } catch (error) {
      console.error('Delete enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting enrollment',
        error: error.message
      });
    }
  }
);

export default router;

