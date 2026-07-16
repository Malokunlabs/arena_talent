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
  CheckCircle2,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { type BadgeApplication, type BadgeTier } from "@/services/badgeService";

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

const TIER_ORDER: BadgeTier[] = ["BEGINNER", "INTERMEDIATE", "PROFESSIONAL"];
const TIER_LABELS: Record<BadgeTier, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  PROFESSIONAL: "Professional",
};

interface BadgeDetailViewProps {
  application: BadgeApplication;
  onStartAssessment: () => void;
}

export default function BadgeDetailView({
  application,
  onStartAssessment,
}: BadgeDetailViewProps) {
  const { badge, currentTier, tierProgressPercent, checklist, status } = application;
  const Icon = ICON_MAP[badge.iconKey] ?? Sparkles;

  const currentTierIndex = currentTier ? TIER_ORDER.indexOf(currentTier) : 0;
  const nextTier = TIER_ORDER[currentTierIndex + 1];

  const getStatusTag = () => {
    if (status === "APPROVED")
      return (
        <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <CheckCircle2 className="w-4 h-4" /> Verified
        </span>
      );
    if (status === "PENDING" || status === "UNDER_REVIEW")
      return (
        <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
          <Clock className="w-4 h-4" /> In Progress
        </span>
      );
    return null;
  };

  const assessedDate = application.reviewedAt
    ? new Date(application.reviewedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : application.createdAt
    ? new Date(application.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Badge Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F4ECFF] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-[#7300E5]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-bold text-gray-900 text-lg">
                {badge.name} Badge
              </h2>
              {getStatusTag()}
            </div>
            <p className="text-[13px] text-gray-500 leading-snug line-clamp-2">
              {badge.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {currentTier && (
                <span className="text-[11px] font-semibold bg-[#F4ECFF] text-[#7300E5] px-2.5 py-1 rounded-full">
                  {TIER_LABELS[currentTier]} Tier
                </span>
              )}
              {assessedDate && (
                <span className="text-[11px] text-gray-400">
                  Assessed {assessedDate}
                </span>
              )}
            </div>
          </div>
          {nextTier && tierProgressPercent !== undefined && (
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-[#7300E5]">
                {tierProgressPercent}%
              </p>
              <p className="text-[11px] text-gray-400">
                to {TIER_LABELS[nextTier]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tier Progression */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Tier Progression</h3>
            <p className="text-[12px] text-gray-400">
              Complete all requirements to unlock the next tier
            </p>
          </div>
          <button className="text-[12px] text-[#7300E5] font-medium hover:underline flex items-center gap-1">
            <span>How tiers work</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Visual tier track */}
        <div className="relative flex items-center justify-between">
          {TIER_ORDER.map((tier, idx) => {
            const unlocked = idx <= currentTierIndex;
            const isCurrent = tier === currentTier;
            return (
              <React.Fragment key={tier}>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? "bg-[#7300E5] border-[#7300E5]"
                        : unlocked
                        ? "bg-[#7300E5] border-[#7300E5]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {unlocked ? (
                      idx === currentTierIndex && nextTier ? (
                        <ArrowRight className="w-4 h-4 text-white" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )
                    ) : (
                      <span className="text-gray-300 text-sm">👑</span>
                    )}
                  </div>
                  <p
                    className={`text-[12px] font-semibold ${
                      unlocked ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {TIER_LABELS[tier]}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {isCurrent
                      ? "Current"
                      : nextTier === tier
                      ? `${tierProgressPercent}% complete`
                      : unlocked
                      ? "Completed"
                      : "Locked"}
                  </p>
                </div>
                {idx < TIER_ORDER.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-100 relative mx-1">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#7300E5] transition-all"
                      style={{
                        width:
                          idx < currentTierIndex
                            ? "100%"
                            : idx === currentTierIndex
                            ? `${tierProgressPercent ?? 0}%`
                            : "0%",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Skill Assessment CTA (sticky bottom) */}
      <div className="bg-[#F4ECFF] border border-[#7300E5]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7300E5] rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Skill Assessment Available
            </p>
            <p className="text-[12px] text-gray-500">
              Retake to improve your score and unlock{" "}
              {nextTier ? TIER_LABELS[nextTier] : "higher"} tier faster
            </p>
          </div>
        </div>
        <button
          onClick={onStartAssessment}
          className="flex items-center gap-2 bg-[#7300E5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5c00b8] transition-colors shrink-0"
        >
          ▶ Start Assessment
        </button>
      </div>
    </div>
  );
}
