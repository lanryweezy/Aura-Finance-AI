import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'h-full w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-white/5 dark:bg-white/5 bg-gray-200 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-48 h-8" />
        <Skeleton variant="text" className="w-64" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
        <Skeleton variant="text" className="w-48 h-8" />
        <div className="flex gap-2">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
        </div>
    </div>
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b border-white/5 flex gap-4">
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      ))}
    </div>
  </div>
);
