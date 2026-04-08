import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Features:
 * - Persistent authentication state
 * - Automatic token refresh
 * - Session timeout handling
 * - Role-based permissions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Check token expiry
          const tokenData = parseJwt(token);
          if (tokenData?.exp) {
            const expiry = new Date(tokenData.exp * 1000);
            setSessionExpiry(expiry);
          }
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Token refresh interval
  useEffect(() => {
    if (!sessionExpiry) return;

    const refreshInterval = setInterval(async () => {
      const now = new Date();
      const timeUntilExpiry = sessionExpiry - now;

      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await authAPI.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Update expiry
            const newTokenData = parseJwt(accessToken);
            if (newTokenData?.exp) {
              setSessionExpiry(new Date(newTokenData.exp * 1000));
            }
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Logout on refresh failure
          await logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [sessionExpiry]);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      
      // Set session expiry
      const tokenData = parseJwt(accessToken);
      if (tokenData?.exp) {
        setSessionExpiry(new Date(tokenData.exp * 1000));
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { user: newUser, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(newUser);
      
      // Set session expiry
      const tokenData = parseJwt(accessToken);
      if (tokenData?.exp) {
        setSessionExpiry(new Date(tokenData.exp * 1000));
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      // Attempt to logout on server (ignore errors)
      await authAPI.logout().catch(() => {});
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setSessionExpiry(null);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.getProfile();
      const updatedUser = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  }, [user]);

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    const permissions = {
      superadmin: ['manage_all', 'manage_users', 'manage_courses', 'manage_content', 'view_analytics'],
      admin: ['manage_users', 'manage_courses', 'view_analytics'],
      teacher: ['manage_assigned_courses', 'manage_content'],
      student: ['view_courses', 'view_content']
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission) || user.role === 'superadmin';
  }, [user]);

  // Get session time remaining
  const getSessionTimeRemaining = useCallback(() => {
    if (!sessionExpiry) return null;
    const now = new Date();
    return sessionExpiry - now;
  }, [sessionExpiry]);

  // Check if session is expiring soon (within 5 minutes)
  const isSessionExpiringSoon = useCallback(() => {
    const timeRemaining = getSessionTimeRemaining();
    return timeRemaining !== null && timeRemaining < 5 * 60 * 1000 && timeRemaining > 0;
  }, [getSessionTimeRemaining]);

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await authAPI.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        const tokenData = parseJwt(accessToken);
        if (tokenData?.exp) {
          setSessionExpiry(new Date(tokenData.exp * 1000));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    sessionExpiry,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasPermission,
    isAuthenticated: !!user,
    getSessionTimeRemaining,
    isSessionExpiringSoon,
    extendSession,
  }), [user, loading, error, sessionExpiry, login, register, logout, updateProfile, hasRole, hasPermission, getSessionTimeRemaining, isSessionExpiringSoon, extendSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default AuthContext;

