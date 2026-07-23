"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Camera, Video, PenLine, Palette, Layout, Film, Share2, Mic2, Sparkles, BarChart3,
  X, Star, ChevronDown, ChevronUp, AlertTriangle, Circle, CheckCircle2, type LucideIcon,
} from "lucide-react";
import { type AdminBadgeApplication } from "@/services/adminBadgeService";
import UserAvatar from "@/components/UserAvatar";

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
  onUphold?: () => void;
  onApproveAppeal?: () => void;
}

export default function BadgeRequestModal({
  application,
  onClose,
  onApprove,
  onReject,
  mode = "review",
  onRevoke,
  onUphold,
  onApproveAppeal,
}: BadgeRequestModalProps) {
  const { user, badge, appliedForTier, currentTier, assessmentScore, createdAt, submissionData, status, reviewNote, rejectedReason } = application as any;
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
  };

  // Extract portfolio images from submission data (array of URL strings)
  const portfolioUrls: string[] = Array.isArray(submissionData?.portfolio_upload)
    ? submissionData.portfolio_upload.map((f: any) => typeof f === "string" ? f : f.url).filter(Boolean)
    : [];

  // Get all form schema fields (excludes portfolio_upload and sample_brief which are rendered separately)
  const formSchema: Array<{ id: string; label: string; type: string }> = badge.formSchema ?? [];
  const textFields = formSchema.filter(
    (f) => f.type !== "file_upload" && f.id !== "sample_brief" && f.id !== "portfolio_upload"
  );

  const briefText =
    (submissionData?.sample_brief as string) ??
    (submissionData?.description as string) ??
    "";

  const briefPreview = briefText.length > 300 ? briefText.slice(0, 300) + " ..." : briefText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="font-bold text-gray-900 text-[20px]">
            {status === "REJECTED" ? "Rejected Badge Details" : "Badge Requests Details"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-0">
          {/* Appeal Banner */}
          {status === "APPEALED" && (
            <div className="mb-5 bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-purple-900">Talent has submitted an appeal</p>
                <p className="text-[12px] text-purple-700">Review the appeal and decide whether to overturn the rejection</p>
              </div>
            </div>
          )}

          {/* Talent */}
          <div className="flex items-center gap-4 py-5 border-b border-gray-200">
            <UserAvatar
              name={`${user.firstName} ${user.lastName}`}
              src={user.avatarUrl}
              size={56}
            />
            <div>
              <p className="font-bold text-gray-900 text-[16px]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[13px] text-gray-400">
                @{user.username}{user.location ? ` - ${user.location}` : ""}
              </p>
            </div>
          </div>

          {/* Fields */}
          {[
            {
              label: "Badge Requested",
              content: (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4ECFF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#7300E5]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900">{badge.name}</p>
                    <p className="text-[13px] text-gray-400">
                      {TIER_LABEL[appliedForTier]} Tier
                    </p>
                  </div>
                </div>
              ),
            },
            {
              label: "Current Tier",
              content: (
                <span className="text-sm font-semibold text-[#7300E5] bg-[#F4ECFF] px-2 py-0.5 rounded-full">
                  {currentTier ? TIER_LABEL[currentTier] : "Beginner"}
                </span>
              ),
            },
            assessmentScore != null && {
              label: "Assessment Score",
              content: (
                <span className="flex items-center w-fit gap-1.5 text-[14px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
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
                <span className="text-[14px] text-gray-700">
                  {user.totalGigs} gigs completed
                  {user.onTimePercent != null ? (
                    <span className="ml-4">{user.onTimePercent}% completion rate</span>
                  ) : null}
                </span>
              ),
            },
          ]
            .filter(Boolean)
            .map((row, i) => {
              const r = row as { label: string; content: React.ReactNode };
              return (
                <div key={i} className="flex items-start gap-4 py-4 border-b border-gray-200">
                  <p className="w-40 shrink-0 text-[13px] font-semibold text-gray-500">{r.label}</p>
                  <div className="flex-1">{r.content}</div>
                </div>
              );
            })}

          {/* Portfolio */}
          {portfolioUrls.length > 0 && (
            <div className="flex items-start gap-4 py-4 border-b border-gray-200">
              <p className="w-40 shrink-0 text-[13px] font-semibold text-gray-500 mt-1">Portfolio</p>
              <div className="flex flex-wrap gap-2">
                {portfolioUrls.slice(0, 4).map((url, i) => (
                  <div
                    key={i}
                    className={`w-24 h-24 rounded-xl bg-gray-100 overflow-hidden relative cursor-pointer group ${
                      i === 3 && portfolioUrls.length > 4 ? "ring-2 ring-[#7300E5]" : ""
                    }`}
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image src={url} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                    {i === 3 && portfolioUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[13px] font-bold">
                        +{portfolioUrls.length - 4} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brief Response */}
          {briefText && (
            <div className="flex items-start gap-4 py-4 border-b border-gray-200">
              <p className="w-40 shrink-0 text-[13px] font-semibold text-gray-500">Brief Response</p>
              <div className="flex-1">
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {briefExpanded ? briefText : briefPreview}
                </p>
                {briefText.length > 300 && (
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => setBriefExpanded((e) => !e)}
                      className="text-[13px] text-gray-500 font-semibold hover:text-gray-700"
                    >
                      {briefExpanded ? "View Less" : "View More"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic other text/short fields from formSchema */}
          {textFields.map((field) => {
            const val = submissionData?.[field.id] as string | undefined;
            if (!val) return null;
            return (
              <div key={field.id} className="flex items-start gap-4 py-4 border-b border-gray-200">
                <p className="w-40 shrink-0 text-[13px] font-semibold text-gray-500">{field.label}</p>
                <p className="flex-1 text-[14px] text-gray-700 break-words">{val}</p>
              </div>
            );
          })}

          {/* Appeal Sections */}
          {status === "APPEALED" && (
            <div className="space-y-4 pt-4">
              <div>
                <p className="text-[12px] font-semibold text-gray-400 mb-2">Original Rejection</p>
                <div className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-600">
                  {rejectedReason || reviewNote || "Assessment score below passing threshold"}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-gray-400 mb-2">Appeal Statement</p>
                <div className="w-full border border-purple-100 bg-[#F4ECFF] rounded-xl p-3 text-[13px] text-gray-700">
                  {application.appealNote || "I would like to appeal my score..."}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-gray-400 mb-2">Admin Decision Note</p>
                <textarea
                  disabled
                  placeholder="The admin decision note will be entered here..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-700 bg-gray-50 resize-none h-24"
                />
              </div>
            </div>
          )}

          {/* Rejected Details Sections */}
          {status === "REJECTED" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 py-3.5 border-b border-gray-50">
                <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Rejected on</p>
                <span className="text-sm text-gray-600">{formatDate(application.updatedAt ?? createdAt)} – {relativeTime(application.updatedAt ?? createdAt)}</span>
              </div>
              <div className="flex items-start gap-4 py-3.5 border-b border-gray-50">
                <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Rejected Reason</p>
                <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                  {rejectedReason || "Assessment score below passing threshold"}
                </span>
              </div>
              <div className="flex items-start gap-4 py-3.5 border-b border-gray-50">
                <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Feedback</p>
                <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-[13px] text-red-600">{reviewNote || rejectedReason}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 py-3.5">
                <p className="w-32 shrink-0 text-[12px] font-semibold text-gray-400">Rejection History</p>
                <div className="flex-1 relative pl-5 space-y-6 before:absolute before:inset-y-2 before:left-[7px] before:w-px before:bg-gray-200">
                  <div className="relative">
                    <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 border-red-500 bg-white" />
                    <p className="text-[13px] font-bold text-gray-800">Rejected - Score below threshold</p>
                    <p className="text-[11px] text-gray-400">{formatDate(application.updatedAt ?? createdAt)}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white" />
                    <p className="text-[13px] font-bold text-gray-800">Assessment submitted</p>
                    <p className="text-[11px] text-gray-400">{formatDate(createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 pt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          {mode === "review" && status !== "APPEALED" && status !== "REJECTED" && (
            <>
              <button
                onClick={onReject}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold bg-[#F04438] text-white hover:bg-[#D92D20] transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-5 py-2.5 rounded-xl text-[14px] font-bold bg-[#12B76A] text-white hover:bg-[#0E9F5D] transition-colors"
              >
                Approve Badge
              </button>
            </>
          )}
          {status === "APPEALED" && onUphold && onApproveAppeal && (
            <>
              <button
                onClick={onUphold}
                className="px-5 py-2 rounded-xl text-sm font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
              >
                Uphold Rejection
              </button>
              <button
                onClick={onApproveAppeal}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#7300E5] text-white hover:bg-[#5c00b8] transition-colors"
              >
                Approve Appeal
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
      {/* Lightbox Preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setSelectedImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImage} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
