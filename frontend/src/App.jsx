import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminManage from './pages/admin/Manage';
import Courses from './pages/admin/Courses';
import CourseForm from './pages/admin/CourseForm';
import Users from './pages/admin/Users';
import Assignments from './pages/admin/Assignments';
import Assets from './pages/admin/Assets';
import Library from './pages/admin/Library';
import QuestionBank from './pages/admin/QuestionBank';
import Leads from './pages/admin/Leads';
import Analytics from './pages/admin/Analytics';
import AdminMeetings from './pages/admin/Meetings';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherManage from './pages/teacher/Manage';
import TeacherMyCourses from './pages/teacher/MyCourses';
import TeacherStudentProgress from './pages/teacher/StudentProgress';
import GradeSubmissions from './pages/teacher/GradeSubmissions';
import TeacherMeetings from './pages/teacher/Meetings';
import StudentDashboard from './pages/student/Dashboard';
import StudentMyCourses from './pages/student/MyCourses';
import StudentAssignments from './pages/student/Assignments';
import StudentCourseViewer from './pages/student/CourseViewer';
import StudentRecordings from './pages/student/Recordings';
import StudentLiveClasses from './pages/student/LiveClasses';
import BrowseCourses from './pages/student/BrowseCourses';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

// Role-based Dashboard Redirect
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  const dashboardPaths = {
    superadmin: '/admin/dashboard',
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
  };

  return <Navigate to={dashboardPaths[user.role] || '/login'} replace />;
}

// Auth Route (already logged in shouldn't access)
function AuthRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    const dashboardPaths = {
      superadmin: '/admin/dashboard',
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role]} replace />;
  }

  return children;
}

// Root Route
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    const dashboardPaths = {
      superadmin: '/admin/dashboard',
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role]} replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ToastProvider>
      <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />

      {/* Root Redirect */}
      <Route path="/" element={<RootRoute />} />

      {/* Admin Routes (Superadmin & Admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage" element={<AdminManage />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/new" element={<CourseForm />} />
        <Route path="courses/:id/edit" element={<CourseForm />} />
        <Route path="users" element={<Users />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assets" element={<Assets />} />
        <Route path="library" element={<Library />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="leads" element={<Leads />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="meetings" element={<AdminMeetings />} />
      </Route>

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="manage" element={<TeacherManage />} />
        <Route path="courses" element={<TeacherMyCourses />} />
        <Route path="courses/new" element={<CourseForm />} />
        <Route path="courses/:id/edit" element={<CourseForm />} />
        <Route path="student-progress" element={<TeacherStudentProgress />} />
        <Route path="assignments" element={<GradeSubmissions />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="meetings" element={<TeacherMeetings />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentMyCourses />} />
        <Route path="courses/:courseId" element={<StudentCourseViewer />} />
        <Route path="courses/:courseId/:lessonId" element={<StudentCourseViewer />} />
        <Route path="live-classes" element={<StudentLiveClasses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="recordings" element={<StudentRecordings />} />
      </Route>

      {/* Course browsing for all authenticated users */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher', 'student']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BrowseCourses />} />
        <Route path=":id" element={<div className="text-gray-100">Course Details</div>} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800">404</h1>
              <p className="text-gray-400 mt-4">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
    </ToastProvider>
  );
}

export default App;
