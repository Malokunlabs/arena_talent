"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { usePiStore } from "@/store/usePiStore";
import { PiStatus, getBarFillPercent, getPiSubLabel } from "@/services/piService";
import { Skeleton } from "@/components/ui/skeleton";

interface PIProgressBarProps {
  /** Pass a PiStatus directly (e.g. from a talent profile). If omitted, reads from the global usePiStore. */
  piStatus?: PiStatus;
  /** Compact mode for use in the sidebar */
  compact?: boolean;
}

export default function PIProgressBar({ piStatus: propStatus, compact = false }: PIProgressBarProps) {
  const { piStatus: storeStatus, isLoading } = usePiStore();
  const status = propStatus ?? storeStatus;

  if (isLoading && !status) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  if (!status) return null;

  const fillPercent = getBarFillPercent(status);
  const subLabel = getPiSubLabel(status);

  if (compact) {
    return (
      <div className="space-y-1.5 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress Index</span>
          <span className="text-sm font-bold text-[#7300E5]">{status.piScore} PI</span>
        </div>
        <Progress value={fillPercent} className="h-1.5 bg-[#F3E8FF] *:data-[slot=progress-indicator]:bg-[#7300E5]" />
        <p className="text-xs text-gray-400">{subLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Progress Index</h3>
        <div className="text-right">
          <span className="text-2xl font-bold text-[#7300E5]">{status.piScore}</span>
          <span className="text-xs text-gray-400 ml-1 block -mt-1">Level {status.level}</span>
        </div>
      </div>
      <Progress value={fillPercent} className="h-2 bg-[#F3E8FF] *:data-[slot=progress-indicator]:bg-[#7300E5]" />
      <p className="text-xs text-[#7300E5] font-medium">{subLabel}</p>
    </div>
  );
}
