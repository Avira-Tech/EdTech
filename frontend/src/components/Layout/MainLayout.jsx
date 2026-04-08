import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';

/**
 * Main Layout Component
 * Features:
 * - Collapsible sidebar
 * - Responsive header
 * - Breadcrumb navigation
 * - Page transitions
 */
export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Handle mouse enter/leave for sidebar tooltip
  const handleSidebarHover = useCallback((hovering) => {
    setSidebarHover(hovering);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        onHover={handleSidebarHover}
      />
      
      {/* Header */}
      <Header isCollapsed={isCollapsed} />
      
      {/* Main Content */}
      <main 
        className={`pt-14 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-6">
          <Breadcrumb />
          
          {/* Page Content with Transition */}
          <div className="page-transition">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Page Transition Wrapper Component
 * Adds smooth transitions between pages
 */
export function PageTransition({ children, effect = 'fade' }) {
  const effects = {
    fade: 'page-transition-fade',
    slide: 'page-transition-slide',
    scale: 'page-transition-scale',
  };

  return (
    <div className={`page-transition-wrapper ${effects[effect] || effects.fade}`}>
      {children}
    </div>
  );
}

/**
 * Loading Overlay Component
 * Shows a loading spinner over content
 */
export function LoadingOverlay({ loading, message = 'Loading...' }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="spinner w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * Error Boundary Fallback Component
 */
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-100 mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-100 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-sm mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

