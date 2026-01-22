const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
};

const sizes = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const landingButtonClasses = ({ variant = 'default', size = 'default', className = '' } = {}) =>
  `${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`.trim();

export const LandingButton = ({ variant = 'default', size = 'default', className = '', ...props }) => (
  <button className={landingButtonClasses({ variant, size, className })} {...props} />
);
