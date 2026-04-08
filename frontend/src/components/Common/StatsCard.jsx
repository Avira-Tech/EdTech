import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType, 
  trend,
  className = '' 
}) {
  return (
    <div className={`panel p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-100">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-400' : 'text-red-400'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </div>
    </div>
  );
}

