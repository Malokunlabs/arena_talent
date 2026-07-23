"use client";

import React, { useState } from "react";
import {
  Camera,
  Video,
  PenLine,
  Palette,
  Layout,
  Film,
  Share2,
  Mic2,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  camera: Camera,
  video: Video,
  pen: PenLine,
  palette: Palette,
  layout: Layout,
  film: Film,
  share: Share2,
  mic: Mic2,
  sparkles: Sparkles,
  chart: BarChart3,
};

const TIER_COLORS: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  BEGINNER: {
    bg: "bg-[#F4ECFF]",
    border: "border-[#7300E5]/30",
    text: "text-[#7300E5]",
    dot: "bg-[#7300E5]",
  },
  INTERMEDIATE: {
    bg: "bg-emerald-50",
    border: "border-emerald-300/50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  PROFESSIONAL: {
    bg: "bg-amber-50",
    border: "border-amber-300/50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
};

interface BadgePillProps {
  name: string;
  iconKey: string;
  tier?: string | null;
  status?: string;
  description?: string;
  tierProgressPercent?: number;
}

export default function SkillBadgePill({
  name,
  iconKey,
  tier,
  status,
  description,
  tierProgressPercent,
}: BadgePillProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[iconKey] ?? Sparkles;
  const tierStyle = TIER_COLORS[tier ?? "BEGINNER"] ?? TIER_COLORS.BEGINNER;

  const isApproved = status === "APPROVED";

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* The Pill */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-pointer transition-all duration-200 ${
          isApproved
            ? `${tierStyle.bg} ${tierStyle.border} hover:shadow-md hover:scale-105`
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {/* Icon circle */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isApproved
              ? "bg-white shadow-sm"
              : "bg-gray-100"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${isApproved ? tierStyle.text : "text-gray-400"}`}
          />
        </div>

        {/* Name + tier dot */}
        <div className="min-w-0">
          <p
            className={`text-[12px] font-bold leading-tight truncate ${
              isApproved ? tierStyle.text : "text-gray-400"
            }`}
          >
            {name}
          </p>
          {tier && isApproved && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
              <span className={`text-[10px] font-semibold ${tierStyle.text} opacity-80`}>
                {tier.charAt(0) + tier.slice(1).toLowerCase()}
              </span>
            </div>
          )}
          {!isApproved && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium">Pending</span>
            </div>
          )}
        </div>

        {/* Verified check */}
        {isApproved && (
          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${tierStyle.text}`} />
        )}
      </div>

      {/* Hover Tooltip */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 pointer-events-none">
          <div className="bg-gray-900 text-white rounded-xl p-3 shadow-xl text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold leading-tight">{name} Badge</p>
                {tier && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    {tier.charAt(0) + tier.slice(1).toLowerCase()} Tier
                  </p>
                )}
              </div>
            </div>
            {description && (
              <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
            {tierProgressPercent !== undefined && !isApproved && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-400">Progress</span>
                  <span className="text-[10px] font-bold text-[#b47aff]">
                    {tierProgressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7300E5] rounded-full"
                    style={{ width: `${tierProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
            {isApproved && (
              <div className="mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Verified Badge
                </span>
              </div>
            )}
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
