/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Hierarchy: superadmin > admin > teacher > student
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Role hierarchy check - higher roles can access lower role routes
export const authorizeHierarchy = (requiredLevel) => {
  const roleHierarchy = {
    superadmin: 4,
    admin: 3,
    teacher: 2,
    student: 1
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userLevel = roleHierarchy[req.user.role];
    const requiredLevelNum = roleHierarchy[requiredLevel];

    if (!userLevel || !requiredLevelNum) {
      return res.status(500).json({
        success: false,
        message: 'Invalid role configuration.'
      });
    }

    if (userLevel < requiredLevelNum) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${requiredLevel} or higher role required.`
      });
    }

    next();
  };
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const rolePermissions = {
      superadmin: [
        'manage_all', 'manage_users', 'manage_courses', 'manage_content',
        'manage_assignments', 'view_analytics', 'manage_settings'
      ],
      admin: [
        'manage_users', 'manage_courses', 'manage_content',
        'manage_assignments', 'view_analytics'
      ],
      teacher: [
        'manage_assigned_courses', 'manage_content', 'create_assignments',
        'view_assigned_students'
      ],
      student: [
        'view_courses', 'view_content', 'submit_assignments', 'track_progress'
      ]
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    
    // Superadmin has all permissions
    if (req.user.role === 'superadmin' || userPermissions.includes(permission) || userPermissions.includes('manage_all')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Permission denied. Required: ${permission}`
    });
  };
};

// Ownership check - for resources owned by the user
export const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Superadmin and admin can access any resource
    if (['superadmin', 'admin'].includes(req.user.role)) {
      return next();
    }

    // For other roles, check ownership
    const resourceUserId = req.resource?.[resourceField]?.toString();
    const requestUserId = req.user._id.toString();

    if (resourceUserId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource.'
      });
    }

    next();
  };
};

