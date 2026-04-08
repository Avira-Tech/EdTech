/**
 * Skeleton Loading Components
 * Features:
 * - Multiple skeleton types
 * - Animated shimmer effect
 * - Customizable shapes
 */

// Skeleton animation keyframes
const skeletonKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Base skeleton style with shimmer effect
const skeletonBase = `
  background: linear-gradient(
    90deg,
    #374151 0%,
    #4b5563 50%,
    #374151 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
`;

/**
 * Base Skeleton Component
 */
export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  circle = false,
  style = {}
}) {
  const baseStyles = {
    ...style,
    width,
    height,
    borderRadius: circle ? '50%' : undefined,
  };

  const variantClasses = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    subtitle: 'h-5 rounded',
    button: 'h-10 rounded-lg',
    avatar: 'rounded-full',
    card: 'rounded-lg',
    input: 'h-10 rounded-lg',
  };

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={baseStyles}
      role="status"
      aria-label="Loading..."
    >
      <style>{skeletonKeyframes}</style>
    </div>
  );
}

/**
 * Text Skeleton
 */
export function SkeletonText({ 
  lines = 3, 
  className = '',
  lastLineWidth = '60%' 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines - 1)].map((_, i) => (
        <Skeleton key={i} variant="text" />
      ))}
      <Skeleton variant="text" width={lastLineWidth} />
    </div>
  );
}

/**
 * Title Skeleton
 */
export function SkeletonTitle({ className = '', width = '40%' }) {
  return (
    <div className={className}>
      <Skeleton variant="title" width={width} />
    </div>
  );
}

/**
 * Avatar Skeleton
 */
export function SkeletonAvatar({ size = 40, className = '' }) {
  return (
    <Skeleton 
      className={className}
      width={size} 
      height={size} 
      circle={true} 
    />
  );
}

/**
 * Button Skeleton
 */
export function SkeletonButton({ width = 100, className = '' }) {
  return (
    <Skeleton 
      className={className}
      variant="button" 
      width={width} 
    />
  );
}

/**
 * Card Skeleton
 */
export function SkeletonCard({ 
  showImage = true,
  showHeader = true,
  showContent = true,
  showFooter = true,
  className = '' 
}) {
  return (
    <div className={`panel p-4 space-y-4 ${className}`}>
      {showImage && (
        <Skeleton height={160} variant="card" />
      )}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton width="60%" variant="title" />
          <Skeleton width="40%" variant="text" />
        </div>
      )}
      {showContent && (
        <div className="space-y-2">
          <SkeletonText lines={3} />
        </div>
      )}
      {showFooter && (
        <div className="flex gap-2">
          <SkeletonButton width={80} />
          <SkeletonButton width={80} />
        </div>
      )}
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function SkeletonTableRow({ 
  columns = 5,
  showActions = true,
  className = '' 
}) {
  return (
    <tr className={className}>
      <td className="px-4 py-3">
        <Skeleton width={30} height={30} circle={true} />
      </td>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton width={`${100 / columns}%`} />
        </td>
      ))}
      {showActions && (
        <td className="px-4 py-3">
          <Skeleton width={60} height={30} />
        </td>
      )}
    </tr>
  );
}

/**
 * Table Skeleton
 */
export function SkeletonTable({ 
  rows = 5,
  columns = 5,
  showHeader = true,
  showActions = true,
  className = '' 
}) {
  return (
    <div className={`panel overflow-hidden ${className}`}>
      {showHeader && (
        <div className="h-10 bg-gray-800 border-b border-gray-700 px-4 flex items-center">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} width={`${100 / columns}%`} />
          ))}
          {showActions && <Skeleton width={60} />}
        </div>
      )}
      <div className="divide-y divide-gray-800">
        {[...Array(rows)].map((_, i) => (
          <SkeletonTableRow 
            key={i} 
            columns={columns} 
            showActions={showActions} 
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
export function SkeletonStatsCard({ className = '' }) {
  return (
    <div className={`panel p-4 space-y-3 ${className}`}>
      <Skeleton width={80} height={20} />
      <Skeleton width={60} height={32} />
      <Skeleton width={100} height={16} />
    </div>
  );
}

/**
 * Form Skeleton
 */
export function SkeletonForm({ fields = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <Skeleton width={80} height={16} className="mb-2" />
          <Skeleton variant="input" />
        </div>
      ))}
    </div>
  );
}

/**
 * Profile Skeleton
 */
export function SkeletonProfile({ className = '' }) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <SkeletonAvatar size={80} className="mx-auto" />
      <Skeleton width="50%" variant="title" className="mx-auto" />
      <Skeleton width="70%" variant="text" className="mx-auto" />
      <div className="flex justify-center gap-4 mt-4">
        <Skeleton width={80} height={30} />
        <Skeleton width={80} height={30} />
      </div>
    </div>
  );
}

/**
 * List Skeleton
 */
export function SkeletonList({ 
  items = 5,
  showAvatar = true,
  showDescription = true,
  className = '' 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && <SkeletonAvatar size={40} />}
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            {showDescription && <Skeleton width="70%" variant="text" />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function SkeletonChart({ className = '' }) {
  return (
    <div className={`panel p-4 space-y-4 ${className}`}>
      <Skeleton width={120} height={24} />
      <div className="h-48 flex items-end gap-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            width={`${100 / 12 - 2}%`} 
            height={`${30 + Math.random() * 50}%`} 
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Notification Skeleton
 */
export function SkeletonNotification({ className = '' }) {
  return (
    <div className={`flex items-start gap-3 p-4 ${className}`}>
      <SkeletonAvatar size={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="30%" />
        <Skeleton width="80%" variant="text" />
        <Skeleton width={80} height={20} />
      </div>
    </div>
  );
}

/**
 * Meeting Card Skeleton
 */
export function SkeletonMeetingCard({ className = '' }) {
  return (
    <div className={`panel p-4 space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonAvatar size={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" variant="title" />
          <Skeleton width="50%" />
        </div>
      </div>
      <Skeleton height={60} variant="card" />
      <div className="flex justify-between">
        <Skeleton width={100} height={30} />
        <Skeleton width={80} height={30} />
      </div>
    </div>
  );
}

export default Skeleton;

