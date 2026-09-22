"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden flex flex-col lg:flex-row">
      {/* Banner foto — tinggi ringkas seperti kartu hero yang sebenarnya */}
      <Skeleton className="w-full h-44 sm:h-56 lg:h-auto lg:w-[40%] lg:min-h-[300px] shrink-0" />
      <div className="flex-1 p-4 sm:p-5 lg:p-6 space-y-4">
        <Skeleton className="hidden lg:block h-6 w-2/3" />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Skeleton className="h-14 flex-1 min-w-[140px] rounded-xl" />
          <Skeleton className="h-14 flex-1 min-w-[140px] rounded-xl" />
        </div>
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RingTimerSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 flex flex-col items-center">
      <Skeleton className="w-24 h-7 rounded-full mb-6" />
      <Skeleton className="w-48 h-48 sm:w-56 sm:h-56 rounded-full mb-6" />
      <Skeleton className="w-28 h-4" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
