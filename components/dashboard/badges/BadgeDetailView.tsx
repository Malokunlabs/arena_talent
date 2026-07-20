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
  Check,
  ArrowRight,
  Clock,
  Crown,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
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

interface BadgeDetailViewProps {
  application: BadgeApplication;
  onStartAssessment: () => void;
}

export default function BadgeDetailView({
  application,
  onStartAssessment,
}: BadgeDetailViewProps) {
  const { badge, currentTier, tierProgressPercent, status } = application;
  const Icon = ICON_MAP[badge.iconKey] ?? Sparkles;
  const [showHowTiersWork, setShowHowTiersWork] = useState(false);

  const isApproved = status === "APPROVED";
  const isPending = ["PENDING", "UNDER_REVIEW", "APPEALED"].includes(status);

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
    : "Jun 2024";

  return (
    <div className="space-y-6">
      {/* ── Pending Status Banner (if application is under review) ── */}
      {isPending && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  Application Under Review
                </h3>
                <p className="text-[12px] text-amber-700 mt-0.5">
                  Submitted on{" "}
                  {new Date(application.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  . Our team is currently assessing your portfolio & details.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide bg-amber-200/60 text-amber-800 px-3 py-1 rounded-full">
              {status}
            </span>
          </div>

          {/* Stepper for Pending Review */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span className="text-[12px] font-semibold text-amber-900">Submitted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              <span className="text-[12px] font-bold text-amber-900">Admin Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <span className="text-[12px] font-medium text-amber-600">Decision</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Badge Header Card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7300E5] text-white flex items-center justify-center shrink-0 shadow-md">
              <Icon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-gray-900 text-xl">
                  {badge.name} Badge
                </h2>
                {isApproved ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#7300E5] bg-[#F4ECFF] px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#7300E5] bg-[#F4ECFF] px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> In Progress
                  </span>
                )}
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-xl">
                {badge.description}
              </p>

              {/* Sub-tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#F4ECFF] text-[#7300E5] px-3 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5" /> Beginner Tier
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Assessed {assessedDate}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 12 Gigs in Category
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Big Percent */}
          <div className="text-left sm:text-right shrink-0">
            <p className="text-4xl font-black text-[#7300E5] tracking-tight">
              {tierProgressPercent ?? 67}%
            </p>
            <p className="text-[12px] text-gray-400 font-medium">
              to Intermediate
            </p>
          </div>
        </div>
      </div>

      {/* ── Tier Progression Card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Tier Progression</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Complete all requirements to unlock the next tier
            </p>
          </div>
          <button
            onClick={() => setShowHowTiersWork((prev) => !prev)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>How tiers work</span>
          </button>
        </div>

        {/* How Tiers Work Explainer Modal / Dropdown */}
        {showHowTiersWork && (
          <div className="mb-6 p-4 bg-[#F4ECFF] border border-[#7300E5]/20 rounded-xl text-[13px] text-gray-700 space-y-2">
            <p className="font-bold text-[#7300E5]">How Tier Progression Works</p>
            <p>
              Tiers are automatically updated based on your gig completion, client ratings, on-time delivery, and assessment scores. Complete gigs on time to automatically advance to Intermediate and Professional tiers!
            </p>
          </div>
        )}

        {/* Visual Line Stepper */}
        <div className="relative px-6">
          {/* Connecting Track Line */}
          <div className="absolute top-5 left-12 right-12 h-1 bg-gray-200 -z-0">
            <div
              className="h-full bg-[#7300E5] transition-all duration-500"
              style={{ width: "50%" }}
            />
          </div>

          <div className="flex items-center justify-between relative z-10">
            {/* Step 1: Beginner */}
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-full bg-[#7300E5] text-white flex items-center justify-center shadow-md">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="mt-2 text-left">
                <p className="text-[13px] font-bold text-gray-900">Beginner</p>
                <p className="text-[11px] text-gray-400 font-medium">Current</p>
              </div>
            </div>

            {/* Step 2: Intermediate */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#7300E5] bg-white text-[#7300E5] flex items-center justify-center shadow-sm">
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[13px] font-bold text-gray-900">Intermediate</p>
                <p className="text-[11px] text-gray-400 font-medium">67% complete</p>
              </div>
            </div>

            {/* Step 3: Professional */}
            <div className="flex flex-col items-end">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div className="mt-2 text-right">
                <p className="text-[13px] font-bold text-gray-400">Professional</p>
                <p className="text-[11px] text-gray-400 font-medium">Locked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
