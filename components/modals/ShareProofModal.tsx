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
    proof.talent?.location || proof.gig?.location || "";
  const relTime = formatShortRelativeTime(proof.createdAt);
  const gigRoleTitle =
    proof.gig?.category ||
    proof.category ||
    proof.gig?.title ||
    proof.title ||
    "Arena post";
  const completedText = formatCompletedMonthYear(
    proof.gig?.completedAt || proof.createdAt,
  );
  const isVerifiedGig = Boolean(
    proof.gigId &&
      proof.gig &&
      proof.gig.status !== "CUSTOM" &&
      !proof.gig.gu2kGigId?.startsWith("custom_"),
  );

  const normalizedMedia: { url: string; type: "image" | "video"; thumbnailUrl?: string }[] =
    Array.isArray(proof.mediaItems) && proof.mediaItems.length > 0
      ? proof.mediaItems
      : Array.isArray(proof.mediaUrls) && proof.mediaUrls.length > 0
        ? proof.mediaUrls.map((url) => ({
            url,
            type: /\.(mp4|mov|webm|m4v)$/i.test(url.split("?")[0])
              ? "video"
              : "image",
          }))
        : proof.mediaUrl
          ? [
              {
                url: proof.mediaUrl,
                type: /\.(mp4|mov|webm|m4v)$/i.test(proof.mediaUrl.split("?")[0])
                  ? "video"
                  : "image",
              },
            ]
          : [];

  const previewItem =
    normalizedMedia.find((item) => item.type === "image") ||
    normalizedMedia[0] ||
    null;
  const previewMediaUrl = previewItem?.url || null;
  const isVideoPreview = previewItem?.type === "video";

  const handleShare = async (
    platform: "whatsapp" | "twitter" | "instagram" | "copy_link",
  ) => {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/proofs/${proof.id}`
        : proof.shareUrl || `/proofs/${proof.id}`;

    let resolvedUrl = baseUrl;
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
      try {
        await navigator.clipboard.writeText(resolvedUrl);
      } catch {
        // Ignore clipboard errors if focus was lost before redirect
      }
    }

    const snippet = (
      proof.caption ||
      proof.title ||
      `Check out ${talentName}'s proof on Arena!`
    ).slice(0, 140);
    const shareText = `${snippet} — View on Arena: ${resolvedUrl}`;

    if (platform === "copy_link") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Proof link copied to clipboard!");
    } else if (platform === "whatsapp") {
      toast.success("Link copied — opening WhatsApp!");
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (platform === "twitter") {
      toast.success("Link copied — opening Twitter!");
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(snippet)}&url=${encodeURIComponent(resolvedUrl)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (platform === "instagram") {
      toast.success("Link copied — ready to share on Instagram!");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
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
                {locationText ? <>{locationText} &bull; </> : null}
                {relTime}
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
            <span
              className={`mt-0.5 text-[10.5px] font-semibold ${
                isVerifiedGig ? "text-[#1F8A3B]" : "text-[#747682]"
              }`}
            >
              {isVerifiedGig ? "Verified GU2K gig" : "Self-reported"}
            </span>
          </div>
        </div>

        {/* Visual Proof Preview Card */}
        <div className="mt-4 rounded-2xl overflow-hidden h-[250px] sm:h-[270px] bg-[#F5F5F8] relative border border-[#ECECF0]">
          {previewMediaUrl ? (
            isVideoPreview ? (
              <video
                src={previewMediaUrl}
                poster={previewItem?.thumbnailUrl}
                className="w-full h-full object-cover object-center"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewMediaUrl}
                alt={talentName}
                className="w-full h-full object-cover object-[center_30%]"
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

        {/* 4 Circular Share Buttons: WhatsApp, Twitter, Instagram, Copy Link */}
        <div className="mt-5 flex items-center justify-center gap-3.5">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => handleShare("whatsapp")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to WhatsApp"
            aria-label="Share to WhatsApp"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M12.004 2a9.998 9.998 0 0 0-8.606 15.095L2 22l5.04-1.322A10 10 0 1 0 12.004 2Z"
                fill="#25D366"
              />
              <path
                d="M16.95 14.12c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.57.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.29.23-.64.23-1.18.16-1.29-.07-.11-.25-.18-.52-.32Z"
                fill="#FFFFFF"
              />
            </svg>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={() => handleShare("twitter")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to Twitter / X"
            aria-label="Share to Twitter / X"
          >
            <svg width="17" height="17" viewBox="0 0 25 24" fill="none">
              <path
                d="M14.919 10.392L22.5135 1.5H20.7135L14.121 9.2205L8.85295 1.5H2.77795L10.743 13.176L2.77795 22.5H4.57795L11.541 14.346L17.1045 22.5H23.1795L14.919 10.392ZM12.4545 13.278L11.6475 12.1155L5.22595 2.865H7.99045L13.1715 10.3305L13.9785 11.493L20.715 21.198H17.9505L12.4545 13.278Z"
                fill="#111111"
              />
            </svg>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleShare("instagram")}
            className="w-11 h-11 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Share to Instagram"
            aria-label="Share to Instagram"
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
