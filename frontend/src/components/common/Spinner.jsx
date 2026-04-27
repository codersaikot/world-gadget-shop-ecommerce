export default function Spinner({ size = 'md', center = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const el = (
    <div className={`${sizes[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  );
  return center ? <div className="flex items-center justify-center py-12">{el}</div> : el;
}
