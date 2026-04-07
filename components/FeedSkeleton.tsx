import React from "react";

export default function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm border border-gray-100">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
      </div>

      {/* Image Skeleton */}
      <div className="aspect-4/5 w-full rounded-2xl bg-gray-200 animate-pulse" />

      {/* Tags Skeleton */}
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-14 rounded-full bg-gray-200 animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-9 w-28 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
