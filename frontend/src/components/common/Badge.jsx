export default function Badge({ children, variant = 'gray' }) {
  const variants = {
    gray:    'bg-gray-100 text-gray-700',
    green:   'bg-green-100 text-green-700',
    red:     'bg-accent-100 text-accent-700',
    yellow:  'bg-yellow-100 text-yellow-700',
    blue:    'bg-primary-100 text-primary-700',
    primary: 'bg-primary-100 text-primary-700',
    accent:  'bg-accent-100 text-accent-700',
    orange:  'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5
      rounded-full text-xs font-medium
      ${variants[variant]}
    `}>
      {children}
    </span>
  );
}