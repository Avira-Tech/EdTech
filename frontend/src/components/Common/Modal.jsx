import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal Component
 * Features:
 * - Focus trap for accessibility
 * - Escape key to close
 * - Click outside to close
 * - Smooth animations
 * - ARIA attributes
 * - Screen reader support
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  showFooter = false,
  footer,
  className = ''
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Handle controlled vs uncontrolled mode
  useEffect(() => {
    if (isOpen !== undefined) {
      if (isOpen) {
        setIsRendered(true);
        // Small delay for animation
        setTimeout(() => setVisible(true), 10);
        // Store the currently focused element
        previousActiveElement.current = document.activeElement;
      } else {
        setVisible(false);
        setTimeout(() => setIsRendered(false), 200);
      }
    } else {
      // Uncontrolled mode - always rendered
      setIsRendered(true);
      setVisible(true);
    }
  }, [isOpen]);

  // Focus trap when modal opens
  useEffect(() => {
    if (visible && modalRef.current) {
      // Focus the modal or first focusable element
      const focusableElements = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements) {
        focusableElements.focus();
      } else {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
    
    // Focus trap
    if (e.key === 'Tab' && visible && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [closeOnEscape, onClose, visible]);

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleKeyDown]);

  // Close on click outside
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Restore focus on close
  useEffect(() => {
    if (!visible && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [visible]);

  if (!isRendered) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full bg-gray-900 border border-gray-800 rounded-lg shadow-2xl
          transform transition-all duration-200
          ${sizeClasses[size]}
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            {title && (
              <h2 
                id="modal-title" 
                className="text-lg font-semibold text-gray-100"
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          {children}
        </div>

        {/* Footer */}
        {showFooter && footer && (
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-850/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Confirmation Modal Component
 * Specialized modal for confirm/cancel actions
 */
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const variantClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="sm"
      showFooter={true}
      footer={
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="btn btn-secondary"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm} 
            className={`btn ${variantClasses[variant]}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-300">{message}</p>
        {variant === 'danger' && (
          <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
            <p className="text-sm text-red-400">
              This action cannot be undone. Please proceed with caution.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Alert Modal Component
 * For displaying important information
 */
export function AlertModal({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  buttonText = 'OK',
  variant = 'info'
}) {
  const variantIcons = {
    info: { icon: 'ℹ', color: 'text-blue-400', bg: 'bg-blue-900/30' },
    warning: { icon: '⚠', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    error: { icon: '✕', color: 'text-red-400', bg: 'bg-red-900/30' },
    success: { icon: '✓', color: 'text-green-400', bg: 'bg-green-900/30' },
  };

  const style = variantIcons[variant] || variantIcons.info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showFooter={true}
      footer={
        <div className="flex justify-center">
          <button onClick={onClose} className="btn btn-primary min-w-[100px]">
            {buttonText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-12 h-12 ${style.bg} ${style.color} rounded-full flex items-center justify-center text-xl mb-4`}>
          {style.icon}
        </div>
        <p className="text-gray-300">{message}</p>
      </div>
    </Modal>
  );
}

