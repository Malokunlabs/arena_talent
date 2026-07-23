"use client";

import React from "react";
import Image from "next/image";
import {
  Camera, Video, PenLine, Palette, Layout, Film, Share2, Mic2, Sparkles, BarChart3,
  MapPin, Calendar, Zap, X, Mail, Phone, GraduationCap, Briefcase, Globe, Clock,
  Award, CheckCircle2, XCircle, Eye,
  type LucideIcon,
} from "lucide-react";
import { type AdminBadgeApplication } from "@/services/adminBadgeService";
import UserAvatar from "@/components/UserAvatar";

const ICON_MAP: Record<string, LucideIcon> = {
  camera: Camera, video: Video, pen: PenLine, palette: Palette,
  layout: Layout, film: Film, share: Share2, mic: Mic2,
  sparkles: Sparkles, chart: BarChart3,
};

const TIER_COLORS: Record<string, string> = {
  BEGINNER: "text-[#7300E5] bg-[#F4ECFF]",
  INTERMEDIATE: "text-amber-600 bg-amber-50",
  PROFESSIONAL: "text-blue-700 bg-blue-50",
};

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-yellow-50 text-yellow-700" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-50 text-blue-700" },
  APPROVED: { label: "Approved", cls: "bg-green-50 text-green-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700" },
  APPEALED: { label: "Under Appeal", cls: "bg-purple-50 text-purple-700" },
  REVOKED: { label: "Revoked", cls: "bg-gray-100 text-gray-500" },
};

interface TalentProfileModalProps {
  application: AdminBadgeApplication;
  onClose: () => void;
  onViewBadgeRequest?: () => void;
}

export default function TalentProfileModal({
  application,
  onClose,
  onViewBadgeRequest,
}: TalentProfileModalProps) {
  const { user, badge, status } = application;

  const getInitials = () =>
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "AT";

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const hasPendingRequest = ["PENDING", "UNDER_REVIEW", "APPEALED"].includes(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Cover + Avatar */}
        <div className="relative">
          <div className="h-28 bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600 rounded-t-2xl flex items-center justify-center">
            <p className="text-white font-bold text-xl opacity-40 tracking-widest">
              keep it simple.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
            <UserAvatar
              name={`${user.firstName} ${user.lastName}`}
              src={user.avatarUrl}
              size={56}
              className="border-4 border-white shadow-md"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </div>

        <div className="px-5 pt-10 pb-6 space-y-5">
          {/* Name + meta */}
          <div className="text-center">
            <p className="font-bold text-gray-900 text-base">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[13px] text-gray-400">@{user.username}</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-[12px] text-gray-500 flex-wrap">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {joinDate}
              </span>
              {user.piScore != null && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> {user.piScore} PI
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button className="flex items-center gap-1.5 bg-[#F4ECFF] text-[#7300E5] px-4 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-[#7300E5] hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" /> Message
              </button>
              <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors">
                <Eye className="w-3.5 h-3.5" /> View Resume
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Badges Owned", value: "4" },
              { label: "Gigs Completed", value: user.totalGigs ?? "—" },
              { label: "Avg Rating", value: user.rating?.toFixed(1) ?? "—" },
              { label: "Completion", value: user.onTimePercent ? `${user.onTimePercent}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="border border-gray-100 rounded-xl p-2.5 text-center">
                <p className="font-bold text-gray-900 text-base">{String(s.value)}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Current Badge */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#7300E5]" /> Badge Applied For
            </p>
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
              {(() => {
                const Icon = ICON_MAP[badge.iconKey] ?? Sparkles;
                return (
                  <div className="w-9 h-9 rounded-lg bg-[#F4ECFF] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#7300E5]" />
                  </div>
                );
              })()}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{badge.name}</p>
                <p className="text-[12px] text-gray-400">
                  {application.appliedForTier.charAt(0) + application.appliedForTier.slice(1).toLowerCase()} Tier
                </p>
              </div>
              <div className="ml-auto">
                {STATUS_CHIP[status] && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_CHIP[status].cls}`}>
                    {STATUS_CHIP[status].label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badge Application History (simplified) */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Badge Application History
            </p>
            <div className="space-y-2">
              {/* Show current application in history */}
              <div className="flex items-start gap-2.5 py-2 border-b border-gray-50">
                {status === "APPROVED" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                ) : status === "REJECTED" ? (
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] text-gray-700 font-medium">
                      {badge.name} — {application.appliedForTier.charAt(0) + application.appliedForTier.slice(1).toLowerCase()} Tier
                    </p>
                    {STATUS_CHIP[status] && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_CHIP[status].cls}`}>
                        {STATUS_CHIP[status].label.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Applied {new Date(application.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {application.rejectedReason && ` · Reason: ${application.rejectedReason}`}
                    {application.reviewedBy && !application.rejectedReason && " · Reviewed by Admin Team"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#7300E5]" /> Personal Details
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Mail, label: "EMAIL", value: user.email },
                { icon: Phone, label: "PHONE", value: user.phone ?? "—" },
                { icon: GraduationCap, label: "EDUCATION", value: user.education ?? "—" },
                { icon: Briefcase, label: "EXPERIENCE", value: user.experience ?? "—" },
                { icon: Globe, label: "LANGUAGES", value: user.languages ?? "—" },
                { icon: Clock, label: "TIMEZONE", value: user.timezone ?? "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[#7300E5]">
                    <Icon className="w-3 h-3" />
                    <p className="text-[9px] font-bold tracking-widest uppercase text-[#7300E5]">{label}</p>
                  </div>
                  <p className="text-[12px] text-gray-700 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {hasPendingRequest && onViewBadgeRequest && (
            <button
              onClick={onViewBadgeRequest}
              className="flex items-center gap-2 bg-[#7300E5] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#5c00b8] transition-colors"
            >
              <Eye className="w-4 h-4" /> View Badge Request
            </button>
          )}
          {!hasPendingRequest && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-400">
                {status === "APPROVED" ? "Badge active" : status === "REVOKED" ? "Badge revoked" : status === "REJECTED" ? "Application rejected" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
