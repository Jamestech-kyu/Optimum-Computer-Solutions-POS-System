export default function StatCard({ title, value, icon, color = 'primary', trend, trendValue, highlight }) {
  const colorStyles = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    accent: 'bg-accent-50 border-accent-200 text-accent-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  const borderStyles = {
    primary: 'border-l-4 border-primary-700',
    blue: 'border-l-4 border-blue-600',
    accent: 'border-l-4 border-accent-500',
    green: 'border-l-4 border-green-600',
    red: 'border-l-4 border-red-600',
  };

  return (
    <div className={`bg-white rounded-lg p-5 shadow-sm border border-gray-100 ${borderStyles[color]} ${highlight ? 'ring-2 ring-accent-300' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend === 'up' ? 'text-green-600' : 'text-accent-600'}`}>
              {trend === 'up' ? '📈' : '📉'} {trendValue} vs last month
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
