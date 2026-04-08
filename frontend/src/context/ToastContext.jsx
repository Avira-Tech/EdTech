import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op toast for when context is not available
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    
    setToasts(prev => [...prev, { 
      id, 
      message, 
      type, 
      duration 
    }]);
    
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      // Store timeout ID for cleanup
      setToasts(prev => prev.map(t => 
        t.id === id ? { ...t, timeoutId } : t
      ));
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    remove: removeToast,
    update: updateToast,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toasts.forEach(toast => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
      });
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={() => onRemove(toast.id)} 
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger exit animation after mount
    const timer = setTimeout(() => {
      setIsExiting(false);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  const typeStyles = {
    success: {
      bg: 'bg-green-900/95 border-green-700',
      icon: '✓',
      iconBg: 'bg-green-600',
    },
    error: {
      bg: 'bg-red-900/95 border-red-700',
      icon: '✕',
      iconBg: 'bg-red-600',
    },
    warning: {
      bg: 'bg-yellow-900/95 border-yellow-700',
      icon: '⚠',
      iconBg: 'bg-yellow-600',
    },
    info: {
      bg: 'bg-blue-900/95 border-blue-700',
      icon: 'ℹ',
      iconBg: 'bg-blue-600',
    },
  };

  const style = typeStyles[toast.type] || typeStyles.info;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200); // Wait for animation
  };

  return (
    <div 
      className={`
        toast flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl
        ${style.bg}
        ${isExiting ? 'fade-out' : 'fade-in slide-in-from-right'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`${style.iconBg} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}>
        {style.icon}
      </div>
      <p className="text-white text-sm flex-1">{toast.message}</p>
      <button
        onClick={handleClose}
        className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Promisified toast for async operations
export const createAsyncToast = (toastFn) => {
  return async (...args) => {
    const id = toastFn(...args);
    try {
      // Wait for async operation to complete
      return { success: true };
    } catch (error) {
      // Can be extended to update toast to error state
      return { success: false, error };
    }
  };
};

export default ToastProvider;

