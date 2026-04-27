export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="shimmer aspect-square" />
      <div className="p-3 space-y-2">
        <div className="shimmer h-3 w-1/3 rounded" />
        <div className="shimmer h-4 rounded" />
        <div className="shimmer h-4 w-4/5 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="shimmer h-5 w-1/3 rounded" />
          <div className="shimmer w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
