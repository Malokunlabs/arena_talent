"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Copy, Check } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { Proof } from "@/services/proofService";
import { proofService } from "@/services/proofService";
import { useAuthStore } from "@/store/useAuthStore";
import {
  resolveTalentRank,
  formatShortRelativeTime,
} from "@/components/arena/ArenaFeedPost";
import { LevelPill, getLevelColor } from "@/components/arena/LevelBadge";
import { toast } from "sonner";

interface ShareProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: Proof | null;
}

function formatCompletedMonthYear(dateString?: string | null): string {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) return "Completed Nov, 2025";
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const [month, year] = formatted.split(" ");
  return `Completed ${month}, ${year}`;
}

export default function ShareProofModal({
  isOpen,
  onClose,
  proof,
}: ShareProofModalProps) {
  const { isAuthenticated } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !proof) return null;

  const fallbackRank = resolveTalentRank(proof, 0);
  const ringColor = getLevelColor(proof.talent?.level ?? { name: fallbackRank });

  const talentName = proof.talent
    ? `${proof.talent.firstName || ""} ${proof.talent.lastName || ""}`.trim() ||
      "Arena Creator"
    : "Arena Creator";
  const locationText =
    proof.talent?.location || proof.gig?.location || "Ikoyi, Lagos";
  const relTime = formatShortRelativeTime(proof.createdAt);
  const gigRoleTitle =
    proof.gig?.category ||
    proof.category ||
    proof.gig?.title ||
    proof.title ||
    "Field Operations Coordinator";
  const completedText = formatCompletedMonthYear(
    proof.gig?.completedAt || proof.createdAt,
  );

  const previewMediaUrl =
    proof.mediaUrl ||
    (proof.mediaUrls && proof.mediaUrls[0]) ||
    proof.mediaItems?.[0]?.url ||
    null;
  const isVideoPreview =
    proof.mediaItems?.[0]?.type === "video" ||
    Boolean(
      previewMediaUrl &&
        /\.(mp4|mov|webm|m4v)$/i.test(previewMediaUrl.split("?")[0]),
    );

  const handleShare = async (
    platform: "instagram" | "tiktok" | "youtube" | "copy_link",
  ) => {
    const fallbackUrl =
      proof.shareUrl || `${window.location.origin}/proofs/${proof.id}`;

    let resolvedUrl = fallbackUrl;
    if (isAuthenticated) {
      try {
        const res = await proofService.shareProof(proof.id, platform);
        if (res?.shareUrl) {
          resolvedUrl = res.shareUrl;
        }
      } catch {
        // Fallback silently to local URL if backend call fails
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(resolvedUrl);
    }

    if (platform === "copy_link") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Proof link copied to clipboard!");
    } else if (platform === "instagram") {
      toast.success("Link copied — ready to share on Instagram!");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    } else if (platform === "tiktok") {
      toast.success("Link copied — ready to share on TikTok!");
      window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
    } else if (platform === "youtube") {
      toast.success("Link copied — ready to share on YouTube!");
      window.open("https://www.youtube.com/", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
              Share this proof
            </h2>
            <p className="text-[12.5px] text-[#747682] mt-0.5">
              Share or copy this proof beyond Arena
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Author + Gig Row */}
        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ borderColor: ringColor }}
              className="rounded-full p-[1.5px] border-2 shrink-0"
            >
              <UserAvatar
                name={talentName}
                src={proof.talent?.avatarUrl}
                size={34}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13.5px] font-semibold text-black truncate">
                  {talentName}
                </span>
                <LevelPill
                  level={proof.talent?.level}
                  fallbackName={fallbackRank}
                  size="xs"
                />
              </div>
              <p className="text-[11.5px] text-[#747682] mt-0.5 truncate">
                {locationText} &bull; {relTime}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F8] text-[#747682] text-[10.5px] font-medium max-w-[190px]">
              <Image
                src="/icons/briefcase.svg"
                alt=""
                width={12}
                height={12}
                className="shrink-0 opacity-80"
              />
              <span className="truncate">{gigRoleTitle}</span>
            </div>
            <span className="text-[10.5px] text-[#747682] mt-1">
              {completedText}
            </span>
          </div>
        </div>

        {/* Visual Proof Preview Card */}
        <div className="mt-4 rounded-2xl overflow-hidden h-[175px] relative border border-[#ECECF0]">
          {previewMediaUrl ? (
            isVideoPreview ? (
              <video
                src={previewMediaUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewMediaUrl}
                alt={talentName}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <svg
              viewBox="0 0 420 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="420" height="180" fill="#E879F9" />
              <circle cx="310" cy="18" r="78" fill="#F0ABFC" fillOpacity="0.65" />
              <path
                d="M-20 155 C20 60, 120 40, 185 105 C235 155, 290 155, 360 110 C400 84, 435 110, 445 140 L445 195 L-20 195 Z"
                fill="#F5D0FE"
                fillOpacity="0.55"
              />
              <path
                d="M15 180 C45 120, 105 115, 130 180 Z"
                fill="#D946EF"
                fillOpacity="0.55"
              />
              <path
                d="M270 180 C295 125, 365 115, 420 150 L420 180 Z"
                fill="#C084FC"
                fillOpacity="0.55"
              />
            </svg>
          )}
        </div>

        {/* 4 Circular Share Buttons: Instagram, TikTok, YouTube, Copy Link */}
        <div className="mt-5 flex items-center justify-center gap-3.5">
          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleShare("instagram")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FD5949" />
                  <stop offset="50%" stopColor="#D6249F" />
                  <stop offset="100%" stopColor="#285AEB" />
                </linearGradient>
              </defs>
              <rect
                x="2.5"
                y="2.5"
                width="19"
                height="19"
                rx="5.5"
                stroke="url(#igGrad)"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="4.2"
                stroke="url(#igGrad)"
                strokeWidth="2"
              />
              <circle cx="17.5" cy="6.5" r="1.2" fill="url(#igGrad)" />
            </svg>
          </button>

          {/* TikTok */}
          <button
            type="button"
            onClick={() => handleShare("tiktok")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to TikTok"
          >
            <svg width="17" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"
                fill="#111111"
              />
              <path
                d="M15.54 3h-1.1a4.28 4.28 0 0 0 1.06 2.82c1.36 1.57 3.24 1.48 3.24 1.48V6.2c-.9-.08-2.32-.54-3.2-3.2Z"
                fill="#EE1D52"
              />
              <path
                d="M9.86 17.9a2.59 2.59 0 0 1-2.59-2.6c0-1.26.9-2.31 2.1-2.54-.27-.05-.56-.07-.86-.07a2.6 2.6 0 0 0-2.6 2.6c0 1.43 1.17 2.61 2.6 2.61.48 0 .93-.13 1.35-.35Z"
                fill="#69C9D0"
              />
            </svg>
          </button>

          {/* YouTube */}
          <button
            type="button"
            onClick={() => handleShare("youtube")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to YouTube"
          >
            <svg width="20" height="15" viewBox="0 0 24 17" fill="none">
              <path
                d="M23.5 2.66A3.01 3.01 0 0 0 21.38.53C19.51 0 12 0 12 0S4.49 0 2.62.53A3.01 3.01 0 0 0 .5 2.66C0 4.54 0 8.5 0 8.5s0 3.96.5 5.84a3.01 3.01 0 0 0 2.12 2.13C4.49 17 12 17 12 17s7.51 0 9.38-.53a3.01 3.01 0 0 0 2.12-2.13C24 12.46 24 8.5 24 8.5s0-3.96-.5-5.84Z"
                fill="#FF0000"
              />
              <path d="M9.6 12.14 15.84 8.5 9.6 4.86v7.28Z" fill="#FFFFFF" />
            </svg>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={() => handleShare("copy_link")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center text-black transition-colors cursor-pointer"
            title="Copy proof link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#1EB954]" />
            ) : (
              <Copy className="w-4 h-4 text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
