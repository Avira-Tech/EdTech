import { forwardRef } from 'react';

/**
 * Button Component
 * Features:
 * - Multiple variants (primary, secondary, danger, success, ghost, link)
 * - Multiple sizes
 * - Loading state with spinner
 * - Icon support
 * - Disabled state
 */
const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500 shadow-lg shadow-primary-600/25',
    secondary: 'bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-500',
    danger: 'bg-danger-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-500/25',
    success: 'bg-success-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-lg shadow-green-500/25',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-100 hover:bg-gray-800 focus:ring-gray-500',
    link: 'bg-transparent text-primary-400 hover:text-primary-300 p-0',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-lg shadow-yellow-500/25',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
  };

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className={`animate-spin ${iconSizeClasses[size]} mr-2`} 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSizeClasses[size]} mr-2`} aria-hidden="true" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSizeClasses[size]} ml-2`} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

/**
 * IconButton Component
 * A button with only an icon
 */
export const IconButton = forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500',
    secondary: 'bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-danger-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-100 hover:bg-gray-800 focus:ring-gray-500',
    success: 'bg-success-500 text-white hover:bg-green-600 focus:ring-green-500',
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={[baseClasses, variantClasses[variant], sizeClasses[size], className].join(' ')}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <svg 
          className={`animate-spin ${iconSizeClasses[size]}`} 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
          />
        </svg>
      ) : (
        <Icon className={iconSizeClasses[size]} />
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';

