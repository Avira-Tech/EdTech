import { useState, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap,
  FileQuestion,
  ClipboardList,
  Library,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Shield,
  Target,
  FileText,
  Play,
  Award,
  Clock,
  Video,
  FileVideo
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Menu items configuration by role
 */
const menuItems = {
  superadmin: [
    { 
      section: 'Dashboard', 
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/manage', icon: Settings, label: 'Manage' },
      ]
    },
    { 
      section: 'Manage', 
      items: [
        { path: '/admin/assets', icon: FolderOpen, label: 'Assets' },
        { path: '/admin/library', icon: Library, label: 'Library' },
        { path: '/admin/question-bank', icon: FileQuestion, label: 'Question Bank' },
        { path: '/admin/assignments', icon: ClipboardList, label: 'Assignments' },
      ]
    },
    { 
      section: 'Courses', 
      items: [
        { path: '/admin/courses', icon: BookOpen, label: 'All Courses' },
        { path: '/admin/courses/new', icon: BookOpen, label: 'Add Course' },
      ]
    },
    { 
      section: 'Live Sessions', 
      items: [
        { path: '/admin/meetings', icon: Video, label: 'Live Meetings' },
      ]
    },
    { 
      section: 'Users', 
      items: [
        { path: '/admin/users', icon: Users, label: 'All Users' },
        { path: '/admin/leads', icon: Target, label: 'Leads' },
      ]
    },
    { 
      section: 'Analytics', 
      items: [
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
  ],
  admin: [
    { 
      section: 'Dashboard', 
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/manage', icon: Settings, label: 'Manage' },
      ]
    },
    { 
      section: 'Manage', 
      items: [
        { path: '/admin/assets', icon: FolderOpen, label: 'Assets' },
        { path: '/admin/library', icon: Library, label: 'Library' },
        { path: '/admin/question-bank', icon: FileQuestion, label: 'Question Bank' },
        { path: '/admin/assignments', icon: ClipboardList, label: 'Assignments' },
      ]
    },
    { 
      section: 'Courses', 
      items: [
        { path: '/admin/courses', icon: BookOpen, label: 'All Courses' },
        { path: '/admin/courses/new', icon: BookOpen, label: 'Add Course' },
      ]
    },
    { 
      section: 'Live Sessions', 
      items: [
        { path: '/admin/meetings', icon: Video, label: 'Live Meetings' },
      ]
    },
    { 
      section: 'Users', 
      items: [
        { path: '/admin/users', icon: Users, label: 'Users' },
      ]
    },
    { 
      section: 'Analytics', 
      items: [
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
  ],
  teacher: [
    { 
      section: 'Dashboard', 
      items: [
        { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/teacher/manage', icon: Settings, label: 'Manage' },
      ]
    },
    { 
      section: 'Courses', 
      items: [
        { path: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
        { path: '/teacher/courses/new', icon: BookOpen, label: 'Add Course' },
      ]
    },
    { 
      section: 'Live Sessions', 
      items: [
        { path: '/teacher/meetings', icon: Video, label: 'Live Meetings' },
      ]
    },
    { 
      section: 'Content', 
      items: [
        { path: '/teacher/assignments', icon: ClipboardList, label: 'Grade Submissions' },
        { path: '/teacher/question-bank', icon: FileQuestion, label: 'Question Bank' },
      ]
    },
    { 
      section: 'Progress', 
      items: [
        { path: '/teacher/student-progress', icon: Users, label: 'Student Progress' },
      ]
    },
    { 
      section: 'Analytics', 
      items: [
        { path: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
  ],
  student: [
    { 
      section: 'Dashboard', 
      items: [
        { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    { 
      section: 'My Learning', 
      items: [
        { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
        { path: '/student/live-classes', icon: Video, label: 'Live Classes' },
        { path: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
      ]
    },
    { 
      section: 'Recordings', 
      items: [
        { path: '/student/recordings', icon: FileVideo, label: 'Video Recordings' },
      ]
    },
  ],
};

/**
 * Sidebar Component
 * Features:
 * - Role-based menu items
 * - Collapsible
 * - Active state highlighting
 * - Smooth animations
 */
export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get menu items for user role
  const menu = useMemo(() => {
    return menuItems[user?.role] || menuItems.student;
  }, [user?.role]);

  // Check if a path is active (including nested routes)
  const isActive = useMemo(() => {
    return (path) => {
      // Exact match for root paths
      if (location.pathname === path) return true;
      
      // Check if current path starts with the menu path
      // But exclude exact matches of other parent paths
      if (location.pathname.startsWith(path) && 
          location.pathname !== path &&
          !location.pathname.split('/').slice(0, -1).join('/').startsWith(path.replace(/\/[^/]+$/, ''))) {
        return true;
      }
      
      // Handle dynamic segments (like course IDs)
      const pathParts = path.split('/');
      const locationParts = location.pathname.split('/');
      
      // Compare only non-dynamic segments
      for (let i = 0; i < pathParts.length; i++) {
        const pathPart = pathParts[i];
        const locPart = locationParts[i];
        
        // Skip if path part is a dynamic segment (starts with :)
        if (pathPart.startsWith(':')) continue;
        
        if (pathPart !== locPart) return false;
      }
      
      return true;
    };
  }, [location.pathname]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-gray-100 truncate">EduTech</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {menu.map((section) => (
          <div key={section.section} className="mb-4">
            {!isCollapsed && (
              <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.section}
              </div>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: isNavActive }) =>
                    `sidebar-item ${isNavActive ? 'active' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <item.icon 
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive(item.path) ? 'text-primary-400' : ''
                    }`} 
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/**
 * Helper hook to get icon component
 */
export const getIconComponent = (iconName) => {
  const icons = {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    FileQuestion,
    ClipboardList,
    Library,
    FolderOpen,
    Settings,
    BarChart3,
    Target,
    FileText,
    Play,
    Award,
    Clock,
    Video,
    FileVideo
  };
  return icons[iconName] || BookOpen;
};

