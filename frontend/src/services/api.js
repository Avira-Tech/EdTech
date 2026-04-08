import axios from 'axios';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // ms

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Request interceptor to add auth token and handle request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Create a new axios instance to avoid interceptors loop
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

          // Store new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Utility function for retry logic
const withRetry = async (fn, maxAttempts = MAX_RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry on server errors (5xx)
      if (!error.response?.status || error.response.status < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
};

// Helper to format API errors
const formatError = (error) => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors || [],
      status: error.response.status,
    };
  }
  
  if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      errors: [],
      status: 0,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    errors: [],
    status: 0,
  };
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  assignCourses: (id, courseIds) => api.put(`/users/${id}/assign-courses`, { courseIds }),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getStats: () => api.get('/courses/stats'),
  addModule: (id, data) => api.post(`/courses/${id}/modules`, data),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
};

// Assignments API
export const assignmentsAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  getSubmissions: (id) => api.get(`/assignments/${id}/submissions`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  grade: (id, submissionId, data) => api.put(`/assignments/${id}/submissions/${submissionId}/grade`, data),
  getMySubmissions: () => api.get('/assignments/my-submissions'),
};

// Questions API
export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  createBulk: (data) => api.post('/questions/bulk', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  deleteBulk: (ids) => api.post('/questions/delete-bulk', { questionIds: ids }),
  getStats: () => api.get('/questions/stats'),
  getCategories: () => api.get('/questions/categories'),
};

// Assets API
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  upload: (formData) => api.post('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getFolders: () => api.get('/assets/folders'),
  trackDownload: (id) => api.post(`/assets/${id}/download`),
};

// Library API
export const libraryAPI = {
  getAll: (params) => api.get('/library', { params }),
  getById: (id) => api.get(`/library/${id}`),
  create: (data) => api.post('/library', data),
  update: (id, data) => api.put(`/library/${id}`, data),
  delete: (id) => api.delete(`/library/${id}`),
  rate: (id, rating) => api.post(`/library/${id}/rate`, { rating }),
  trackDownload: (id) => api.post(`/library/${id}/download`),
  getCategories: () => api.get('/library/categories'),
};

// Leads API
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  addActivity: (id, data) => api.post(`/leads/${id}/activities`, data),
  updateStatus: (id, status) => api.put(`/leads/${id}/status`, { status }),
  convertToUser: (id, password) => api.post(`/leads/${id}/convert`, { password }),
  getStats: () => api.get('/leads/stats'),
};

// Analytics API
export const analyticsAPI = {
  trackEvent: (data) => api.post('/analytics/track', data),
  getDashboard: (period) => api.get('/analytics/dashboard', { params: { period } }),
  getCourse: (id, period) => api.get(`/analytics/courses/${id}`, { params: { period } }),
  getStudent: (id, period) => api.get(`/analytics/students/${id}`, { params: { period } }),
  getTeacher: (id, period) => api.get(`/analytics/teachers/${id}`, { params: { period } }),
  getPlatform: (period) => api.get('/analytics/platform', { params: { period } }),
};

// Enrollments API
export const enrollmentsAPI = {
  getMyEnrollments: () => api.get('/enrollments/my-courses'),
  getEnrollment: (id) => api.get(`/enrollments/${id}`),
  getProgress: (courseId) => api.get(`/enrollments/${courseId}/progress`),
  updateProgress: (courseId, data) => api.put(`/enrollments/${courseId}/progress`, data),
  markLessonComplete: (courseId, lessonId) => api.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`),
};

// Meetings API
export const meetingsAPI = {
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  getUpcoming: (params) => api.get('/meetings/upcoming', { params }),
  getPast: (params) => api.get('/meetings/past', { params }),
  getRecordings: (id) => api.get(`/meetings/${id}/recordings`),
  join: (id) => api.post(`/meetings/${id}/join`),
  start: (id) => api.post(`/meetings/${id}/start`),
  end: (id) => api.post(`/meetings/${id}/end`),
  publish: (id, publish) => api.put(`/meetings/${id}/publish`, { publish }),
  downloadRecording: (id, recordingId) => api.post(`/meetings/${id}/recordings/${recordingId}/download`),
  storeRecording: (id, recordingId) => api.post(`/meetings/${id}/recordings/${recordingId}/store`),
  getStats: (params) => api.get('/meetings/stats', { params }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
  getEnrolledMeetings: () => api.get('/notifications/meetings/enrolled'),
  sendLiveClassNotification: (data) => api.post('/notifications/send-live-class', data),
};

// Export utility functions
export const apiUtils = {
  withRetry,
  formatError,
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
};

export default api;

