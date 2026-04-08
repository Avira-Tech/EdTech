import { forwardRef } from 'react';

/**
 * Card Component
 * Features:
 * - Hover effects
 * - Padding options
 * - Header and footer slots
 * - Loading state
 */
const Card = forwardRef(({
  children,
  className = '',
  hover = false,
  padding = true,
  header,
  footer,
  onClick,
  selected = false,
  loading = false,
  ...props
}, ref) => {
  const baseClasses = [
    'panel',
    'transition-all duration-200',
  ];

  if (hover) {
    baseClasses.push('card-hover');
  }

  if (onClick) {
    baseClasses.push('cursor-pointer');
  }

  if (selected) {
    baseClasses.push('ring-2 ring-primary-500');
  }

  if (className) {
    baseClasses.push(className);
  }

  const handleClick = (e) => {
    if (onClick && !loading) {
      onClick(e);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={baseClasses.join(' ')} ref={ref}>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={baseClasses.join(' ')}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-gray-800">
          {header}
        </div>
      )}
      <div className={padding ? 'p-4' : ''}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-850/50">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', title, action }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
      {children}
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-3 border-t border-gray-800 bg-gray-850/50 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Skeleton Loading Component
 */
export function CardSkeleton({ 
  showHeader = true, 
  showFooter = false,
  headerWidth = '40%',
  lines = 3 
}) {
  return (
    <div className="panel p-4 animate-pulse">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className={`h-6 bg-gray-800 rounded ${headerWidth}`}></div>
          <div className="w-8 h-8 bg-gray-800 rounded"></div>
        </div>
      )}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-800 rounded" style={{ width: i === lines - 1 ? '60%' : '100%' }}></div>
        ))}
      </div>
      {showFooter && (
        <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end gap-2">
          <div className="h-8 w-20 bg-gray-800 rounded"></div>
          <div className="h-8 w-20 bg-gray-800 rounded"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Stats Card Component
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  trend,
  trendValue,
  loading = false,
  onClick
}) {
  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-800 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      hover={!!onClick}
      onClick={onClick}
      className="relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-100">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
              {trend && trendIcons[trend]}
              <span>{change}</span>
            </div>
          )}
          {trendValue && (
            <div className="flex items-center gap-1 mt-1">
              {trendValue > 0 ? (
                <span className="text-green-400 text-sm flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {trendValue}%
                </span>
              ) : (
                <span className="text-red-400 text-sm flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {Math.abs(trendValue)}%
                </span>
              )}
              <span className="text-gray-500 text-xs">vs last week</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </div>
      {/* Gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 opacity-50"></div>
    </Card>
  );
}

/**
 * Info Card Component
 */
export function InfoCard({
  title,
  description,
  icon: Icon,
  action,
  variant = 'default'
}) {
  const variants = {
    default: 'bg-gray-800/50 border-gray-800',
    primary: 'bg-primary-900/20 border-primary-800',
    success: 'bg-green-900/20 border-green-800',
    warning: 'bg-yellow-900/20 border-yellow-800',
    danger: 'bg-red-900/20 border-red-800',
  };

  return (
    <div className={`panel p-4 border ${variants[variant]}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-gray-700/50">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          {title && <h4 className="font-medium text-gray-100">{title}</h4>}
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export default Card;

