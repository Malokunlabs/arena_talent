"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Camera, Video, PenLine, Palette, Layout, Film, Share2, Mic2, Sparkles, BarChart3,
  X, Star, ChevronDown, ChevronUp, type LucideIcon,
} from "lucide-react";
import { type AdminBadgeApplication } from "@/services/adminBadgeService";

const ICON_MAP: Record<string, LucideIcon> = {
  camera: Camera, video: Video, pen: PenLine, palette: Palette,
  layout: Layout, film: Film, share: Share2, mic: Mic2, sparkles: Sparkles, chart: BarChart3,
};

const TIER_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  PROFESSIONAL: "Professional",
};

interface BadgeRequestModalProps {
  application: AdminBadgeApplication;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  /** For approved tab — show revoke instead */
  mode?: "review" | "approved";
  onRevoke?: () => void;
}

export default function BadgeRequestModal({
  application,
  onClose,
  onApprove,
  onReject,
  mode = "review",
  onRevoke,
}: BadgeRequestModalProps) {
  const { user, badge, appliedForTier, currentTier, assessmentScore, createdAt, submissionData } = application;
  const [briefExpanded, setBriefExpanded] = useState(false);

  const Icon = ICON_MAP[badge.iconKey] ?? Sparkles;

  const getInitials = () =>
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "AT";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  const relativeTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // Extract portfolio images from submission data
  const portfolioFiles = (submissionData?.portfolio_upload as { url?: string; file?: { name: string } }[]) ?? [];

  const briefText =
    (submissionData?.sample_brief as string) ??
    (submissionData?.description as string) ??
    "";

  const briefPreview = briefText.length > 300 ? briefText.slice(0, 300) + " ..." : briefText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">Badge Requests Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-0">
          {/* Talent */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-[#F4ECFF] flex items-center justify-center font-bold text-[#7300E5] text-sm shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="" width={40} height={40} className="object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[12px] text-gray-400">
                @{user.username}
                {user.location ? ` · ${user.location}` : ""}
              </p>
            </div>
          </div>

          {/* Fields */}
          {[
            {
              label: "Badge Requested",
              content: (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F4ECFF] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#7300E5]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{badge.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {TIER_LABEL[appliedForTier]} Tier
                    </p>
                  </div>
                </div>
              ),
            },
            {
              label: "Current Tier",
              content: (
                <span className="text-sm font-semibold text-[#7300E5]">
                  {currentTier ? TIER_LABEL[currentTier] : "No Badge"}
                </span>
              ),
            },
            assessmentScore != null && {
              label: "Assessment Score",
              content: (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {assessmentScore}% (Pass: 80%)
                </span>
              ),
            },
            {
              label: "Submitted",
              content: (
                <span className="text-sm text-gray-600">
                  {formatDate(createdAt)} – {relativeTime(createdAt)}
                </span>
              ),
            },
            user.totalGigs != null && {
              label: "Gigs in Category",
              content: (
                <span className="text-sm text-gray-600">
                  {user.totalGigs} gigs completed &nbsp;·&nbsp;
                  {user.onTimePercent != null ? `${user.onTimePercent}% completion rate` : ""}
                </span>
              ),
            },
          ]
            .filter(Boolean)
            .map((row, i) => {
              const r = row as { label: string; content: React.ReactNode };
              return (
                <div key={i} className="flex items-start gap-4 py-3.5 border-b border-gray-50">
                  <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">{r.label}</p>
                  <div className="flex-1">{r.content}</div>
                </div>
              );
            })}

          {/* Portfolio */}
          {portfolioFiles.length > 0 && (
            <div className="flex items-start gap-4 py-3.5 border-b border-gray-50">
              <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Portfolio</p>
              <div className="flex flex-wrap gap-2">
                {portfolioFiles.slice(0, 4).map((f, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden relative"
                  >
                    {f.url ? (
                      <Image src={f.url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        {f.file?.name?.slice(0, 6) ?? "File"}
                      </div>
                    )}
                    {i === 3 && portfolioFiles.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[11px] font-bold">
                        +{portfolioFiles.length - 4} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brief Response */}
          {briefText && (
            <div className="flex items-start gap-4 py-3.5">
              <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Brief Response</p>
              <div className="flex-1">
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  {briefExpanded ? briefText : briefPreview}
                </p>
                {briefText.length > 300 && (
                  <button
                    onClick={() => setBriefExpanded((e) => !e)}
                    className="flex items-center gap-1 text-[12px] text-[#7300E5] font-semibold mt-1 hover:underline"
                  >
                    {briefExpanded ? (
                      <><ChevronUp className="w-3 h-3" /> View Less</>
                    ) : (
                      <><ChevronDown className="w-3 h-3" /> View More</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {mode === "review" && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#7300E5] text-white hover:bg-[#5c00b8] transition-colors"
              >
                Approve Badge
              </button>
            </>
          )}
          {mode === "approved" && onRevoke && (
            <button
              onClick={onRevoke}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              🔄 Revoke Badge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
