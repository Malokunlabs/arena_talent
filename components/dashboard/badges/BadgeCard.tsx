"use client";

import React from "react";
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
  type LucideIcon,
} from "lucide-react";
import { type SkillBadge } from "@/services/badgeService";

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

interface BadgeCardProps {
  badge: SkillBadge;
  onApply: (badge: SkillBadge) => void;
  applied?: boolean;
  applicationStatus?: string;
}

export default function BadgeCard({
  badge,
  onApply,
  applied,
  applicationStatus,
}: BadgeCardProps) {
  const Icon = ICON_MAP[badge.iconKey] ?? Sparkles;

  const getStatusPill = () => {
    if (!applied || !applicationStatus) return null;
    const statusMap: Record<string, { label: string; cls: string }> = {
      PENDING: {
        label: "Pending",
        cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      UNDER_REVIEW: {
        label: "Under Review",
        cls: "bg-blue-50 text-blue-700 border-blue-200",
      },
      APPROVED: {
        label: "Verified",
        cls: "bg-green-50 text-green-700 border-green-200",
      },
      REJECTED: {
        label: "Rejected",
        cls: "bg-red-50 text-red-700 border-red-200",
      },
      APPEALED: {
        label: "Under Appeal",
        cls: "bg-purple-50 text-purple-700 border-purple-200",
      },
      REVOKED: {
        label: "Revoked",
        cls: "bg-gray-50 text-gray-600 border-gray-200",
      },
    };
    const s = statusMap[applicationStatus];
    if (!s) return null;
    return (
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-[#7300E5]/20 transition-all duration-200 group">
      {/* Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full border-2 border-[#7300E5]/30 flex items-center justify-center bg-[#F4ECFF] group-hover:bg-[#7300E5] transition-colors duration-200">
          <Icon className="w-7 h-7 text-[#7300E5] group-hover:text-white transition-colors duration-200" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 text-base">{badge.name}</h3>
          {getStatusPill()}
        </div>
      </div>

      {/* Scope of Work */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-widest text-[#7300E5] uppercase">
          Scope of Work
        </p>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[13px] text-gray-600 leading-snug line-clamp-3">
            {badge.scopeOfWork}
          </p>
        </div>
      </div>

      {/* Assessment Method */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-widest text-[#7300E5] uppercase">
          Assessment Method
        </p>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[13px] text-gray-600 leading-snug">
            {badge.assessmentMethod}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onApply(badge)}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          applicationStatus === "APPROVED"
            ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
            : applicationStatus === "PENDING" || applicationStatus === "UNDER_REVIEW"
            ? "bg-gray-50 text-gray-500 border border-gray-200 cursor-default"
            : "bg-[#F4ECFF] text-[#7300E5] hover:bg-[#7300E5] hover:text-white"
        }`}
        disabled={
          applicationStatus === "APPROVED" ||
          applicationStatus === "PENDING" ||
          applicationStatus === "UNDER_REVIEW"
        }
      >
        {applicationStatus === "APPROVED"
          ? "✓ Verified"
          : applicationStatus === "PENDING" || applicationStatus === "UNDER_REVIEW"
          ? "Application In Review"
          : applicationStatus === "REJECTED" || applicationStatus === "APPEALED"
          ? "View Application"
          : "Verify Talent Badge"}
      </button>
    </div>
  );
}
