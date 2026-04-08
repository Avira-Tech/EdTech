import { FileQuestion, Inbox, Search } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action,
  className = '' 
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-100 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
}

