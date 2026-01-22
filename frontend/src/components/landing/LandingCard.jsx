export const LandingCard = ({ className = '', ...props }) => (
  <div
    className={`rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm ${className}`.trim()}
    {...props}
  />
);
