export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-gray-800 ${className}`}>
      <nav className="flex gap-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-100'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-800">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

