import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    ))}
  </>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex gap-4">
      <Skeleton className="h-32 flex-1 rounded-2xl" />
      <Skeleton className="h-32 flex-1 rounded-2xl" />
      <Skeleton className="h-32 flex-1 rounded-2xl" />
      <Skeleton className="h-32 flex-1 rounded-2xl" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-48 rounded-2xl col-span-2" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
    <Skeleton className="h-64 rounded-2xl" />
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5 space-y-3">
    <Skeleton className="h-4 w-1/3 rounded" />
    <Skeleton className="h-8 w-1/2 rounded" />
    <Skeleton className="h-3 w-full rounded" />
    <Skeleton className="h-3 w-2/3 rounded" />
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full rounded-xl" />
    <Skeleton className="h-10 w-full rounded-xl" />
    <Skeleton className="h-10 w-full rounded-xl" />
    <Skeleton className="h-10 w-1/2 rounded-xl" />
  </div>
);
