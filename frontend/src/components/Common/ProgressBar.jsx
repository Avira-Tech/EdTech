import { useEffect, useRef, useState } from 'react';

/**
 * ProgressBar Component
 * Features:
 * - Smooth animations
 * - Multiple sizes
 * - Multiple colors
 * - Animated progress
 */
export default function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = true,
  size = 'md',
  color = 'primary',
  className = '',
  animated = true,
  showValue = false
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Animate progress
  useEffect(() => {
    if (animated) {
      const duration = 500; // Animation duration in ms
      const steps = 20;
      const stepDuration = duration / steps;
      const valueStep = (percentage - previousValueRef.current) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newValue = previousValueRef.current + (valueStep * currentStep);
        setDisplayValue(newValue);
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(percentage);
    }
    
    previousValueRef.current = percentage;
  }, [percentage, animated]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-primary-400'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{displayValue.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color] || colorClasses.primary} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${displayValue}%` }}
        >
          {animated && (
            <div className="h-full w-full animate-pulse opacity-30 bg-white/20"></div>
          )}
        </div>
      </div>
      {showValue && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {value} / {max}
        </div>
      )}
    </div>
  );
}

/**
 * Circular Progress Component
 */
export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  label = '',
  animated = true
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const duration = 800;
      const startValue = 0;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (percentage - startValue) * eased;
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const colorClasses = {
    primary: '#1086ff',
    success: '#3cc13b',
    warning: '#f5b400',
    danger: '#e02f44',
    info: '#3b82f6'
  };

  const strokeColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (displayValue / 100) * circumference}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
          style={{
            filter: `drop-shadow(0 0 3px ${strokeColor}40)`
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-100">{displayValue.toFixed(0)}%</span>
          {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Multi Progress Bar (for multiple segments)
 */
export function MultiProgressBar({
  segments = [],
  total = 100,
  size = 'md',
  showLegend = true,
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = [
    'bg-primary-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className={className}>
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden flex ${sizeClasses[size]}`}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${colors[index % colors.length]} transition-all duration-300`}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      {showLegend && segments.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`} />
              <span className="text-xs text-gray-400">{segment.label}</span>
              <span className="text-xs text-gray-500">({segment.value})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

