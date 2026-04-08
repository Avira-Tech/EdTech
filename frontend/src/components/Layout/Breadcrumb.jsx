import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight, BookOpen, Users, Settings, FileText } from 'lucide-react';

/**
 * Breadcrumb Component
 * Features:
 * - Auto-generated from current path
 * - Custom items support
 * - Icons for common routes
 * - Truncation for long paths
 */
export default function Breadcrumb({ items: customItems }) {
  const location = useLocation();
  
  // Generate breadcrumb items from current path
  const pathnames = location.pathname.split('/').filter(Boolean);
  
  const generateBreadcrumbs = () => {
    // Use custom items if provided
    if (customItems) {
      return customItems;
    }
    
    const crumbs = [];
    
    // Always add home
    crumbs.push({
      label: 'Home',
      path: '/',
      icon: Home,
      isLast: pathnames.length === 0
    });
    
    let currentPath = '';
    
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip numeric segments (IDs)
      if (!isNaN(segment)) return;
      
      // Skip if it's a role-based path prefix
      if (['admin', 'teacher', 'student'].includes(segment)) {
        const roleLabels = {
          admin: 'Admin Dashboard',
          teacher: 'Teacher Portal',
          student: 'Student Portal'
        };
        crumbs.push({
          label: roleLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          path: null,
          icon: getIconForPath(segment),
          isLast: index === pathnames.length - 1
        });
        return;
      }
      
      // Skip if it's a common word
      const skipWords = ['new', 'edit', 'view', 'delete', 'manage'];
      if (skipWords.includes(segment)) return;
      
      // Format label
      let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Capitalize first letter
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Check if this is the last segment
      const isLast = index === pathnames.length - 1;
      
      crumbs.push({
        label,
        path: isLast ? null : currentPath,
        icon: getIconForPath(segment),
        isLast
      });
    });
    
    return crumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Don't render if only home
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className="flex items-center gap-1 text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-600 mx-1" aria-hidden="true" />
            )}
            
            {item.path && !item.isLast ? (
              <Link
                to={item.path}
                className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors px-2 py-1 rounded hover:bg-gray-800"
              >
                {item.icon && <item.icon className="w-4 h-4" aria-hidden="true" />}
                <span className="truncate max-w-[150px]">{item.label}</span>
              </Link>
            ) : (
              <span 
                className={`flex items-center gap-1 px-2 py-1 ${
                  item.isLast ? 'text-gray-100 font-medium' : 'text-gray-400'
                }`}
                aria-current={item.isLast ? 'page' : undefined}
              >
                {item.icon && <item.icon className="w-4 h-4" aria-hidden="true" />}
                <span className="truncate max-w-[150px]">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Get icon for path segment
 */
function getIconForPath(segment) {
  const iconMap = {
    dashboard: Home,
    courses: BookOpen,
    users: Users,
    settings: Settings,
    assignments: FileText,
    manage: Settings,
    analytics: Home,
  };
  
  return iconMap[segment.toLowerCase()] || null;
}

/**
 * Static Breadcrumb Item Component
 */
export function BreadcrumbItem({ 
  label, 
  path, 
  icon: Icon, 
  isLast = false 
}) {
  if (isLast || !path) {
    return (
      <span className="flex items-center gap-1 text-gray-100 font-medium">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
    );
  }
  
  return (
    <Link
      to={path}
      className="flex items-center gap-1 text-gray-400 hover:text-gray-100 transition-colors"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Link>
  );
}

/**
 * Breadcrumb Separator Component
 */
export function BreadcrumbSeparator() {
  return (
    <ChevronRight className="w-4 h-4 text-gray-600 mx-1" aria-hidden="true" />
  );
}

/**
 * Breadcrumb with custom styles
 */
export function StyledBreadcrumb({ items, className = '' }) {
  return (
    <nav className={`flex items-center gap-2 ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <BreadcrumbSeparator />}
          {item.path ? (
            <Link
              to={item.path}
              className={`
                flex items-center gap-1 px-2 py-1 rounded transition-colors
                ${item.isActive 
                  ? 'text-gray-100 bg-gray-800' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }
              `}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span className="text-sm">{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 text-gray-100">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span className="text-sm font-medium">{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

