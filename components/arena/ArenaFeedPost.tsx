"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, MoreHorizontal, Edit3, Trash2, Clock } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { LevelPill, getLevelColor } from "@/components/arena/LevelBadge";
import { Proof, ProofMediaItem } from "@/services/proofService";
import MediaLightboxModal from "@/components/modals/MediaLightboxModal";

type RankVariant = "Pro" | "Hustler" | "Specialist" | "Lead";

const RANK_STYLES: Record<
  RankVariant,
  { border: string; text: string; ring: string }
> = {
  Pro: {
    border: "border-[#22C55E] text-[#16A34A] bg-[#F0FDF4]",
    text: "Pro",
    ring: "border-[#22C55E]",
  },
  Hustler: {
    border: "border-[#F59E0B] text-[#D97706] bg-[#FFFBEB]",
    text: "Hustler",
    ring: "border-[#F59E0B]",
  },
  Specialist: {
    border: "border-[#06B6D4] text-[#0891B2] bg-[#ECFEFF]",
    text: "Specialist",
    ring: "border-[#06B6D4]",
  },
  Lead: {
    border: "border-[#A855F7] text-[#7E00EE] bg-[#FAF5FF]",
    text: "Lead",
    ring: "border-[#A855F7]",
  },
};

export function resolveTalentRank(proof: Proof, _index = 0): RankVariant {
  const levelName = proof.talent?.level?.name;
  if (levelName === "Lead" || levelName === "Pro" || levelName === "Specialist" || levelName === "Hustler") {
    return levelName;
  }
  const badges = proof.talent?.badges || [];
  if (badges.some((b) => /lead/i.test(b))) return "Lead";
  if (badges.some((b) => /pro/i.test(b))) return "Pro";
  if (badges.some((b) => /specialist/i.test(b))) return "Specialist";
  return "Hustler";
}

export function formatShortRelativeTime(dateString?: string): string {
  if (!dateString) return "2h";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "2h";
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function formatCompletedMonthYear(dateString?: string | null): string {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) return "Completed Dec, 2025";
  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const [month, year] = formatted.split(" ");
  return `Completed ${month}, ${year}`;
}

function formatDurationBadge(seconds?: number): string {
  const sec = seconds && seconds > 0 ? Math.round(seconds) : 49;
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

function getNormalizedMediaItems(proof: Proof): ProofMediaItem[] {
  if (Array.isArray(proof.mediaItems) && proof.mediaItems.length > 0) {
    return proof.mediaItems;
  }
  if (Array.isArray(proof.mediaUrls) && proof.mediaUrls.length > 0) {
    return proof.mediaUrls.map((url) => ({
      url,
      type: /\.(mp4|mov|webm|m4v)$/i.test(url.split("?")[0])
        ? "video"
        : "image",
    }));
  }
  if (proof.mediaUrl) {
    return [
      {
        url: proof.mediaUrl,
        type: /\.(mp4|mov|webm|m4v)$/i.test(proof.mediaUrl.split("?")[0])
          ? "video"
          : "image",
      },
    ];
  }
  return [];
}

function MediaCell({
  item,
  className = "",
  onClick,
  extraCountOverlay = 0,
}: {
  item: ProofMediaItem;
  className?: string;
  onClick?: () => void;
  extraCountOverlay?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden bg-gray-100 select-none text-left ${
        item.type === "video" ? "cursor-pointer" : "cursor-zoom-in"
      } ${className}`}
      aria-label={item.type === "video" ? "Open video in large view" : "Open image to zoom"}
    >
      {item.type === "video" ? (
        <>
          <video
            src={item.url}
            poster={item.thumbnailUrl}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-xs border border-white/25 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt="Proof media"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      )}

      {item.type === "video" && (
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <Play className="w-2.5 h-2.5 fill-white" />
          <span>{formatDurationBadge(item.duration)}</span>
        </div>
      )}

      {extraCountOverlay > 0 && (
        <div className="pointer-events-none absolute inset-0 bg-black/55 flex items-center justify-center">
          <span className="text-white text-[20px] font-bold tracking-tight">
            +{extraCountOverlay}
          </span>
        </div>
      )}
    </button>
  );
}

interface ArenaFeedPostProps {
  proof: Proof;
  index?: number;
  onLike: (id: string) => void;
  onView?: (id: string) => void;
  onSalute?: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (proof: Proof) => void;
  canManage?: boolean;
  onEdit?: (proof: Proof) => void;
  onDelete?: (proof: Proof) => void;
}

const TEN_MINUTES_MS = 10 * 60 * 1000;

export default function ArenaFeedPost({
  proof,
  index = 0,
  onLike,
  onView,
  onBookmark,
  onShare,
  canManage = false,
  onEdit,
  onDelete,
}: ArenaFeedPostProps) {
  const postRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!canManage) return;
    const interval = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [canManage]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  const createdMs = proof.createdAt ? new Date(proof.createdAt).getTime() : 0;
  const elapsedMs = createdMs > 0 ? nowMs - createdMs : Infinity;
  const canEditWithinWindow = elapsedMs >= 0 && elapsedMs <= TEN_MINUTES_MS;
  const minsRemaining = canEditWithinWindow
    ? Math.max(1, Math.ceil((TEN_MINUTES_MS - elapsedMs) / 60000))
    : 0;

  useEffect(() => {
    if (!onView || !postRef.current) return;
    const el = postRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onView(proof.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [proof.id, onView]);
  const fallbackRank = resolveTalentRank(proof, index);
  const ringColor = getLevelColor(proof.talent?.level ?? { name: fallbackRank });

  const talentName = proof.talent
    ? `${proof.talent.firstName || ""} ${proof.talent.lastName || ""}`.trim() ||
      "Arena Creator"
    : "Arena Creator";

  const locationText =
    proof.talent?.location || proof.gig?.location || "Lekki, Lagos";
  const relTime = formatShortRelativeTime(proof.createdAt);
  const gigRoleTitle =
    proof.gig?.category ||
    proof.category ||
    proof.gig?.title ||
    proof.title ||
    "Market Analysis Facilitator";

  const completedDateText = formatCompletedMonthYear(
    proof.gig?.completedAt || proof.createdAt,
  );

  const captionText =
    proof.caption ||
    proof.title ||
    "Completed retail evaluations and documented insights with photographic and video evidence.";

  const mediaItems = getNormalizedMediaItems(proof);

  const likesCount = proof.likesCount ?? 0;
  const viewsCount = proof.viewsCount ?? 0;
  const hasLiked = Boolean(proof.hasLiked);
  const isBookmarked = Boolean(proof.isBookmarked);

  const profileHref = proof.talent?.username
    ? `/profile?username=${proof.talent.username}`
    : "#";

  return (
    <article
      ref={postRef}
      className="py-5 border-b border-[#EFEFF3] last:border-b-0"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Avatar + Name + Rank + Location */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href={profileHref} className="shrink-0">
            <div
              style={{ borderColor: ringColor }}
              className="rounded-full p-[2px] border-2"
            >
              <UserAvatar
                name={talentName}
                src={proof.talent?.avatarUrl}
                size={38}
              />
            </div>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={profileHref}
                className="text-[14px] font-semibold text-black hover:underline truncate"
              >
                {talentName}
              </Link>
              <LevelPill
                level={proof.talent?.level}
                fallbackName={fallbackRank}
              />
            </div>
            <p className="text-[12px] text-[#747682] mt-0.5 truncate">
              {locationText} &bull; {relTime}
            </p>
          </div>
        </div>

        {/* Right: Role Pill + Completed Date */}
        <div className="flex flex-col items-end shrink-0 text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F8] text-[#747682] text-[11px] font-medium max-w-[220px]">
            <Image
              src="/icons/briefcase.svg"
              alt=""
              width={13}
              height={13}
              className="shrink-0 opacity-80"
            />
            <span className="truncate">{gigRoleTitle}</span>
          </div>
          <span className="text-[11px] text-[#747682] mt-1">
            {completedDateText}
          </span>
        </div>
      </div>

      {/* Caption Text */}
      <p className="mt-3 text-[13.5px] leading-[1.55] text-[#747682] whitespace-pre-line">
        {captionText}
      </p>

      {/* Media Collage (if any media exists) */}
      {mediaItems.length === 1 && (
        <div className="mt-3.5 rounded-2xl overflow-hidden border border-[#ECECF0] max-h-[380px]">
          <MediaCell
            item={mediaItems[0]}
            className="w-full h-[320px]"
            onClick={() => setLightboxIndex(0)}
          />
        </div>
      )}

      {mediaItems.length === 2 && (
        <div className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden border border-[#ECECF0] h-[280px]">
          <MediaCell
            item={mediaItems[0]}
            className="w-full h-full"
            onClick={() => setLightboxIndex(0)}
          />
          <MediaCell
            item={mediaItems[1]}
            className="w-full h-full"
            onClick={() => setLightboxIndex(1)}
          />
        </div>
      )}

      {mediaItems.length >= 3 && (
        <div className="mt-3.5 grid grid-cols-12 gap-1.5 rounded-2xl overflow-hidden border border-[#ECECF0] h-[310px]">
          <MediaCell
            item={mediaItems[0]}
            className="col-span-7 h-full"
            onClick={() => setLightboxIndex(0)}
          />
          <div className="col-span-5 grid grid-rows-2 gap-1.5 h-full">
            <MediaCell
              item={mediaItems[1]}
              className="w-full h-full"
              onClick={() => setLightboxIndex(1)}
            />
            <MediaCell
              item={mediaItems[2]}
              className="w-full h-full"
              onClick={() => setLightboxIndex(2)}
              extraCountOverlay={
                mediaItems.length > 3 ? mediaItems.length - 3 : 0
              }
            />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Like (Heart) */}
          <button
            type="button"
            onClick={() => onLike(proof.id)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-80 cursor-pointer"
          >
            <Image
              src={
                hasLiked
                  ? "/icons/like-button-active.svg"
                  : "/icons/like-button-inactive.svg"
              }
              alt="Like"
              width={16}
              height={16}
            />
            <span className={hasLiked ? "text-[#7E00EE] font-semibold" : "text-[#747682]"}>
              {likesCount}
            </span>
          </button>

          {/* Views */}
          <div
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#747682]"
            title={`${viewsCount} views`}
          >
            <Image
              src="/icons/views-icon.svg"
              alt="Views"
              width={16}
              height={16}
            />
            <span>{viewsCount}</span>
          </div>
        </div>

        {/* Right: Bookmark + Share */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onBookmark(proof.id)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title={isBookmarked ? "Remove bookmark" : "Bookmark proof"}
          >
            {isBookmarked ? (
              <svg
                width="11"
                height="14"
                viewBox="0 0 11 14"
                fill="#7E00EE"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.75 2.25C0.75 1.85218 0.908035 1.47064 1.18934 1.18934C1.47064 0.908035 1.85218 0.75 2.25 0.75H8.25C8.64782 0.75 9.02936 0.908035 9.31066 1.18934C9.59196 1.47064 9.75 1.85218 9.75 2.25V12.7995C9.74996 12.8673 9.73153 12.9339 9.69666 12.9921C9.6618 13.0503 9.6118 13.0979 9.552 13.1299C9.4922 13.1619 9.42484 13.1771 9.35708 13.1739C9.28933 13.1706 9.22372 13.1491 9.16725 13.1115L5.45775 10.6387C5.3962 10.5978 5.32393 10.5759 5.25 10.5759C5.17607 10.5759 5.1038 10.5978 5.04225 10.6387L1.33275 13.1115C1.27628 13.1491 1.21067 13.1706 1.14292 13.1739C1.07516 13.1771 1.0078 13.1619 0.948 13.1299C0.888199 13.0979 0.838203 13.0503 0.803336 12.9921C0.768468 12.9339 0.750035 12.8673 0.75 12.7995V2.25Z"
                  stroke="#7E00EE"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <Image
                src="/icons/bookmark.svg"
                alt="Bookmark"
                width={11}
                height={14}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => onShare(proof)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="Share proof"
          >
            <Image src="/icons/share.svg" alt="Share" width={16} height={16} />
          </button>

          {canManage && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setNowMs(Date.now());
                  setMenuOpen((v) => !v);
                }}
                className="p-1 rounded-md text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                title="Manage proof"
                aria-label="Proof actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 bottom-8 w-52 rounded-2xl bg-white border border-[#ECECF0] shadow-[0_12px_30px_rgba(0,0,0,0.08)] py-1.5 z-30 divide-y divide-[#F1F1F5] animate-in fade-in duration-100">
                  {onEdit && (
                    <button
                      type="button"
                      disabled={!canEditWithinWindow}
                      onClick={() => {
                        if (!canEditWithinWindow) return;
                        setMenuOpen(false);
                        onEdit(proof);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-[12.5px] transition-colors ${
                        canEditWithinWindow
                          ? "text-black hover:bg-gray-50 font-medium cursor-pointer"
                          : "text-[#A1A1AA] cursor-not-allowed"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit proof
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-[#747682]">
                        <Clock className="w-3 h-3" />
                        {canEditWithinWindow ? `${minsRemaining}m left` : "Expired"}
                      </span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(proof);
                      }}
                      className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 text-[12.5px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete proof
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Lightbox Viewer (Zoom images, large video player, scroll through post items) */}
      <MediaLightboxModal
        isOpen={lightboxIndex !== null}
        items={mediaItems}
        initialIndex={lightboxIndex ?? 0}
        title={talentName}
        subtitle={gigRoleTitle}
        onClose={() => setLightboxIndex(null)}
      />
    </article>
  );
}
