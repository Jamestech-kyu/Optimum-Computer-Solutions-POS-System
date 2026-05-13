import Spinner from './Spinner';

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  onClick,
  disabled  = false,
  loading   = false,
  type      = 'button',
  className = '',
}) {
  const base = `
    inline-flex items-center justify-center
    font-medium rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary:   'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
    danger:    'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500',
    success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}