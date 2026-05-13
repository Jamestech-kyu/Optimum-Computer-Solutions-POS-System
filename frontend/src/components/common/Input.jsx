export default function Input({
  label,
  error,
  prefix,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>

      {/* Show label if provided */}
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Optional prefix like "KES" */}
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
            {prefix}
          </span>
        )}

        <input
          className={`
            w-full border border-gray-300 rounded-lg py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            placeholder:text-gray-300
            ${prefix ? 'pl-12' : 'pl-3'} pr-3
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
          `}
          {...props}
        />
      </div>

      {/* Show validation error if any */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}