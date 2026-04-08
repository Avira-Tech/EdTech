import Analytics from '../models/Analytics.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Track analytics event
// @route   POST /api/analytics/track
// @access  Private
export const trackEvent = async (req, res) => {
  try {
    const {
      eventType,
      courseId,
      lessonId,
      assignmentId,
      metadata
    } = req.body;

    const event = await Analytics.create({
      eventType,
      user: req.user._id,
      sessionId: req.sessionID,
      course: courseId,
      lesson: lessonId,
      assignment: assignmentId,
      metadata: {
        ...metadata,
        pageUrl: metadata?.pageUrl || req.headers.referer,
        userAgent: req.headers['user-agent']
      }
    });

    // Update course enrollment count if enrollment event
    if (eventType === 'enrollment' && courseId) {
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event tracked'
    });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking event',
      error: error.message
    });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin, Superadmin)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Enrollment trends
    const enrollmentTrends = await Enrollment.aggregate([
      { $match: { enrollmentDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrollmentDate' } },
          count: { $sum: 1 },
          revenue: { $sum: '$payment.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course performance
    const coursePerformance = await Course.aggregate([
      { $match: { status: 'published' } },
      {
        $project: {
          title: 1,
          enrollmentCount: 1,
          rating: 1
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 }
    ]);

    // Event breakdown
    const eventBreakdown = await Analytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Summary stats
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments({ status: 'published' });
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          activeEnrollments
        },
        userGrowth,
        enrollmentTrends,
        coursePerformance,
        eventBreakdown
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// @desc    Get course analytics
// @route   GET /api/analytics/courses/:id
// @access  Private (Admin, Teacher)
export const getCourseAnalytics = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const course = await Course.findById(courseId)
      .populate('instructor', 'firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Enrollment data
    const enrollmentData = await Enrollment.aggregate([
      { $match: { course: course._id, enrollmentDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrollmentDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Progress distribution
    const progressDistribution = await Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$progress.percentage', 25] }, then: '0-25%' },
                { case: { $lte: ['$progress.percentage', 50] }, then: '25-50%' },
                { case: { $lte: ['$progress.percentage', 75] }, then: '50-75%' },
                { case: { $lt: ['$progress.percentage', 100] }, then: '75-99%' }
              ],
              default: '100%'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Completion rate
    const completedCount = await Enrollment.countDocuments({
      course: course._id,
      status: 'completed'
    });
    const totalEnrollments = await Enrollment.countDocuments({ course: course._id });
    const completionRate = totalEnrollments > 0 
      ? (completedCount / totalEnrollments * 100).toFixed(1) 
      : 0;

    // Event data for this course
    const eventData = await Analytics.aggregate([
      { $match: { course: course._id, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          avgDuration: { $avg: '$metadata.duration' }
        }
      }
    ]);

    // Average rating
    const avgRating = course.rating.average;
    const ratingCount = course.rating.count;

    res.json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          instructor: course.instructor,
          enrollmentCount: course.enrollmentCount,
          avgRating,
          ratingCount
        },
        enrollmentData,
        progressDistribution,
        completionRate,
        eventData,
        totalEnrollments,
        completedCount
      }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};

// @desc    Get student analytics
// @route   GET /api/analytics/students/:id
// @access  Private (Admin, Teacher, Student)
export const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check access
    const isOwner = student._id.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin', 'teacher'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Learning activity
    const learningActivity = await Analytics.aggregate([
      {
        $match: {
          user: student._id,
          timestamp: { $gte: startDate },
          eventType: { $in: ['lesson_complete', 'video_complete', 'quiz_complete'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          lessons: {
            $sum: { $cond: [{ $eq: ['$eventType', 'lesson_complete'] }, 1, 0] }
          },
          videos: {
            $sum: { $cond: [{ $eq: ['$eventType', 'video_complete'] }, 1, 0] }
          },
          quizzes: {
            $sum: { $cond: [{ $eq: ['$eventType', 'quiz_complete'] }, 1, 0] }
          },
          totalDuration: { $sum: '$metadata.duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course progress
    const courseProgress = await Enrollment.find({
      student: student._id
    }).populate('course', 'title thumbnail');

    const progressData = courseProgress.map(e => ({
      course: e.course,
      progress: e.progress.percentage,
      status: e.status,
      enrolledAt: e.enrollmentDate,
      completedAt: e.completion.completedAt
    }));

    // Total stats
    const totalLessonsCompleted = await Analytics.countDocuments({
      user: student._id,
      eventType: 'lesson_complete'
    });

    const totalVideosWatched = await Analytics.countDocuments({
      user: student._id,
      eventType: 'video_complete'
    });

    const totalQuizzesTaken = await Analytics.countDocuments({
      user: student._id,
      eventType: 'quiz_complete'
    });

    const totalAssignmentsSubmitted = await Analytics.countDocuments({
      user: student._id,
      eventType: 'assignment_submit'
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`
        },
        learningActivity,
        courseProgress: progressData,
        summary: {
          totalEnrolledCourses: courseProgress.length,
          completedCourses: courseProgress.filter(e => e.status === 'completed').length,
          totalLessonsCompleted,
          totalVideosWatched,
          totalQuizzesTaken,
          totalAssignmentsSubmitted
        }
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student analytics',
      error: error.message
    });
  }
};

// @desc    Get teacher analytics
// @route   GET /api/analytics/teachers/:id
// @access  Private (Admin, Teacher)
export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check access
    const isOwner = teacher._id.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get teacher's courses
    const courses = await Course.find({ instructor: teacher._id });
    const courseIds = courses.map(c => c._id);

    // Overall stats
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds }
    });

    const avgCompletion = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress.percentage' }
        }
      }
    ]);

    // Submissions to review
    // This would require a Submission model - simplified for now
    const pendingReviews = 0;

    // Course-wise stats
    const courseStats = await Promise.all(courses.map(async (course) => {
      const enrollments = await Enrollment.countDocuments({ course: course._id });
      const completed = await Enrollment.countDocuments({ course: course._id, status: 'completed' });
      
      return {
        id: course._id,
        title: course.title,
        enrollmentCount: enrollments,
        completionRate: enrollments > 0 ? (completed / enrollments * 100).toFixed(1) : 0,
        avgRating: course.rating.average
      };
    }));

    // Student engagement over time
    const engagementData = await Analytics.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          events: { $sum: 1 },
          lessonsCompleted: {
            $sum: { $cond: [{ $eq: ['$eventType', 'lesson_complete'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        teacher: {
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`
        },
        summary: {
          totalCourses: courses.length,
          totalStudents,
          avgCompletion: avgCompletion[0]?.avgProgress?.toFixed(1) || 0,
          pendingReviews
        },
        courseStats,
        engagementData
      }
    });
  } catch (error) {
    console.error('Get teacher analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher analytics',
      error: error.message
    });
  }
};

// @desc    Get platform-wide analytics
// @route   GET /api/analytics/platform
// @access  Private (Superadmin)
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User stats by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Course stats
    const coursesByStatus = await Course.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const coursesByCategory = await Course.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Revenue data (if payment tracking is implemented)
    const revenueData = await Enrollment.aggregate([
      { $match: { 'payment.status': 'completed', enrollmentDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrollmentDate' } },
          revenue: { $sum: '$payment.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top performing courses
    const topCourses = await Course.find({ status: 'published' })
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount rating');

    // Top instructors
    const topInstructors = await User.aggregate([
      { $match: { role: 'teacher' } },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructor',
          as: 'courses'
        }
      },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          courseCount: { $size: '$courses' },
          totalEnrollments: { $sum: '$courses.enrollmentCount' }
        }
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: 5 }
    ]);

    // Traffic sources
    const trafficSources = await Analytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$metadata.referrer',
          visits: { $sum: 1 }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        usersByRole,
        coursesByStatus,
        coursesByCategory,
        revenueData,
        topCourses,
        topInstructors,
        trafficSources
      }
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics',
      error: error.message
    });
  }
};

