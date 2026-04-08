import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bell, X, Check, CheckCheck, Video, Clock, FileText, Award, AlertCircle } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Icon mapping for different notification types
const NOTIFICATION_ICONS = {
  live_class_started: Video,
  live_class_ended: Clock,
  course_enrolled: Award,
  assignment_due: AlertCircle,
  assignment_submitted: FileText,
  grade_posted: Award,
  recording_available: Video,
  announcement: Bell,
  system: Bell
};

// Color mapping for notification types
const NOTIFICATION_COLORS = {
  live_class_started: 'text-red-400 bg-red-500/20',
  live_class_ended: 'text-gray-400 bg-gray-500/20',
  course_enrolled: 'text-green-400 bg-green-500/20',
  assignment_due: 'text-yellow-400 bg-yellow-500/20',
  assignment_submitted: 'text-blue-400 bg-blue-500/20',
  grade_posted: 'text-purple-400 bg-purple-500/20',
  recording_available: 'text-primary-400 bg-primary-500/20',
  announcement: 'text-cyan-400 bg-cyan-500/20',
  system: 'text-gray-400 bg-gray-500/20'
};

// Date formatting utility
const formatTimeAgo = (date) => {
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
};

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const panelRef = useRef(null);
  const observerRef = useRef(null);
  const { toast } = useToast();

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ 
        page: pageNum, 
        limit: 15 
      });
      
      if (pageNum === 1) {
        setNotifications(response.data.data);
      } else {
        setNotifications(prev => [...prev, ...response.data.data]);
      }
      
      setHasMore(response.data.data.length === 15);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [toast]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Initial fetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, fetchNotifications, fetchUnreadCount]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [toast]);

  // Delete single notification
  const handleDelete = useCallback(async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
    onClose();
  }, [handleMarkAsRead, onClose]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Load more notifications when scrolling
  const loadMoreRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchNotifications(page + 1);
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [hasMore, loading, fetchNotifications, page]);

  // Memoized notification items
  const notificationItems = useMemo(() => {
    return notifications.map((notification) => {
      const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
      const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-gray-400 bg-gray-500/20';
      
      return (
        <div
          key={notification._id}
          onClick={() => handleNotificationClick(notification)}
          className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-150 ${
            !notification.isRead ? 'bg-gray-800/30' : ''
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleNotificationClick(notification);
            }
          }}
        >
          <div className="flex gap-3">
            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-medium text-sm ${!notification.isRead ? 'text-gray-100' : 'text-gray-300'}`}>
                  {notification.title}
                </p>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {notification.formattedTime || formatTimeAgo(notification.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification._id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Delete"
                    aria-label="Delete notification"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [notifications, handleNotificationClick, handleMarkAsRead, handleDelete]);

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-14 w-96 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isInitialLoad && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-800">
              {notificationItems}
            </div>
            
            {/* Load more trigger */}
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className="p-3 text-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="spinner w-5 h-5" />
                    <span className="text-sm text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => fetchNotifications(page + 1)}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasMore && notifications.length > 0 && (
              <div className="p-3 text-center text-xs text-gray-500">
                No more notifications
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with settings link */}
      <div className="p-3 border-t border-gray-800 text-center">
        <button
          className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
          onClick={() => {
            window.location.href = '/notifications';
          }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

