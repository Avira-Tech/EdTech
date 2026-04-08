import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import NotificationPanel from '../Common/NotificationPanel';

export default function Header({ isCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // In a real app, you would call an API endpoint for global search
      // For now, we'll simulate some results
      const mockResults = [
        { type: 'course', title: 'Web Development Bootcamp', url: '/courses/1' },
        { type: 'course', title: 'React - The Complete Guide', url: '/courses/2' },
        { type: 'user', title: 'John Smith', url: '/admin/users/1' },
        { type: 'assignment', title: 'Final Project', url: '/assignments/1' },
      ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockResults.slice(0, 5));
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setIsSearching(false);
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  }, [searchQuery, navigate]);

  // Fetch unread notification count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      teacher: 'Teacher',
      student: 'Student',
    };
    return labels[role] || role;
  };

  const handleResultClick = (result) => {
    setShowSearchResults(false);
    navigate(result.url);
  };

  return (
    <header 
      className={`fixed top-0 right-0 h-14 bg-gray-900 border-b border-gray-800 z-30 flex items-center justify-between px-4 transition-all duration-300 ${
        isCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Search */}
      <div className="flex items-center flex-1 max-w-xl" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses, users, assignments..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="spinner w-4 h-4 border-2 border-gray-600 border-t-primary-500 rounded-full" />
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 py-1">Search Results</p>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-200">{result.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-700 p-2">
                <button
                  type="submit"
                  className="w-full text-center text-sm text-primary-400 hover:text-primary-300 py-1"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme toggle (placeholder for future) */}
        <button
          className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
          title="Toggle theme"
        >
          <Moon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-100">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500">{getRoleLabel(user?.role)}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="dropdown">
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="text-sm font-medium text-gray-100">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
                <div className="mt-1">
                  <span className="badge badge-primary">{getRoleLabel(user?.role)}</span>
                </div>
              </div>
              
              <Link
                to="/profile"
                className="dropdown-item flex items-center gap-2"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              
              <Link
                to="/settings"
                className="dropdown-item flex items-center gap-2"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              
              <hr className="my-1 border-gray-800" />
              
              <button
                onClick={handleLogout}
                className="dropdown-item flex items-center gap-2 w-full text-left text-danger-500 hover:text-danger-400"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

