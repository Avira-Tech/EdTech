import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude superadmin from results (for non-superadmin admins)
    if (req.user.role !== 'superadmin') {
      query.role = { $ne: 'superadmin' };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('enrolledCourses', 'title thumbnail status')
      .populate('assignedCourses', 'title thumbnail status');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is requesting own data or is admin
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, bio } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Only superadmin can create admins
    if (role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can create admin users'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      phone,
      bio,
      createdBy: req.user._id
    });

    // Remove sensitive data
    user.password = undefined;
    user.refreshToken = undefined;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, avatar } = req.body;

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only admins can change roles
    if (req.body.role && !isAdmin) {
      delete req.body.role;
    }

    // Prevent lowering admin privileges
    if (user.role === 'superadmin' && req.body.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change superadmin role'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (req.body.role && isAdmin) user.role = req.body.role;
    if (req.body.isActive !== undefined && isAdmin) user.isActive = req.body.isActive;
    
    user.updatedBy = req.user._id;
    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (SuperAdmin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete superadmin user'
      });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalAdmins,
        byRole: stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// @desc    Assign courses to teacher
// @route   PUT /api/users/:id/assign-courses
// @access  Private (Admin)
export const assignCoursesToTeacher = async (req, res) => {
  try {
    const { courseIds } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'User is not a teacher'
      });
    }

    // Verify all courses exist
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length !== courseIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more courses not found'
      });
    }

    user.assignedCourses = [...new Set([...user.assignedCourses, ...courseIds])];
    await user.save();

    res.json({
      success: true,
      message: 'Courses assigned successfully',
      data: user.assignedCourses
    });
  } catch (error) {
    console.error('Assign courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning courses',
      error: error.message
    });
  }
};

