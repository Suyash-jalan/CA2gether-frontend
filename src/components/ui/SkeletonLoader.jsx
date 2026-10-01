export default function SkeletonLoader({ className = '', count = 1, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return items.map((_, i) => (
      <div
        key={i}
        className={`bg-surface rounded-[20px] border border-border p-6 space-y-4 ${className}`}
      >
        <div className="skeleton-shimmer h-48 rounded-[16px]" />
        <div className="skeleton-shimmer h-5 w-3/4 rounded-[999px]" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-[999px]" />
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-7 w-20 rounded-[999px]" />
          <div className="skeleton-shimmer h-7 w-16 rounded-[999px]" />
        </div>
      </div>
    ));
  }

  if (type === 'chat') {
    return items.map((_, i) => (
      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'} ${className}`}>
        <div className="skeleton-shimmer w-8 h-8 rounded-full shrink-0" />
        <div className="skeleton-shimmer h-12 w-48 rounded-[16px]" />
      </div>
    ));
  }

  if (type === 'line') {
    return items.map((_, i) => (
      <div key={i} className={`skeleton-shimmer h-4 rounded-[999px] ${className}`}
        style={{ width: `${60 + ((i * 17) % 40)}%` }}
      />
    ));
  }

  if (type === 'profile') {
    return (
      <div className={`bg-surface rounded-[20px] border border-border p-6 space-y-4 ${className}`}>
        <div className="skeleton-shimmer w-24 h-24 rounded-full mx-auto" />
        <div className="skeleton-shimmer h-6 w-1/2 mx-auto rounded-[999px]" />
        <div className="skeleton-shimmer h-4 w-1/3 mx-auto rounded-[999px]" />
        <div className="space-y-2 mt-4">
          <div className="skeleton-shimmer h-4 w-full rounded-[999px]" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-[999px]" />
        </div>
      </div>
    );
  }

  return null;
}
