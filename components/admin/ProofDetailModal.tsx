"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import { AdminProof } from "@/services/adminService";
import { ProofMediaItem } from "@/services/proofService";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Star,
  Check,
  X,
  ShieldAlert,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  ImageOff,
} from "lucide-react";
import { AdminFeedbackType } from "./ActionFeedbackModal";

interface ProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: AdminProof;
  onActionComplete: (type: AdminFeedbackType, proof: AdminProof) => void;
  onRequestDelete?: (proof: AdminProof) => void;
}

function isVideoMediaItem(item: ProofMediaItem): boolean {
  if (item.type === "video") return true;
  const cleanUrl = item.url.split("?")[0];
  return /\.(mp4|mov|webm|m4v|avi)$/i.test(cleanUrl);
}

function normalizeProofMedia(proof: AdminProof): ProofMediaItem[] {
  const seen = new Set<string>();
  const items: ProofMediaItem[] = [];

  if (Array.isArray(proof.mediaItems) && proof.mediaItems.length > 0) {
    for (const item of proof.mediaItems) {
      if (item?.url && !seen.has(item.url)) {
        seen.add(item.url);
        items.push({
          ...item,
          type: isVideoMediaItem(item) ? "video" : "image",
        });
      }
    }
  }

  if (Array.isArray(proof.mediaUrls)) {
    for (const url of proof.mediaUrls) {
      if (url && !seen.has(url)) {
        seen.add(url);
        const type = isVideoMediaItem({ url, type: "image" })
          ? "video"
          : "image";
        items.push({ url, type });
      }
    }
  }

  if (proof.mediaUrl && !seen.has(proof.mediaUrl)) {
    seen.add(proof.mediaUrl);
    const type = isVideoMediaItem({ url: proof.mediaUrl, type: "image" })
      ? "video"
      : "image";
    items.push({ url: proof.mediaUrl, type });
  }

  return items;
}

export default function ProofDetailModal({
  isOpen,
  onClose,
  proof,
  onActionComplete,
  onRequestDelete,
}: ProofDetailModalProps) {
  const {
    approveProof,
    rejectProof,
    flagProof,
    toggleFeatureProof,
    toggleShadowLimitProof,
    deleteProof,
  } = useAdminStore();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const mediaList = useMemo(() => normalizeProofMedia(proof), [proof]);
  const safeIndex =
    mediaList.length > 0 ? Math.min(activeIndex, mediaList.length - 1) : 0;
  const activeMedia = mediaList[safeIndex] ?? null;

  const handleApprove = async () => {
    setLoadingAction("approve");
    await approveProof(proof.id);
    setLoadingAction(null);
    onActionComplete("approved", proof);
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    await rejectProof(proof.id, "Content does not meet guidelines");
    setLoadingAction(null);
    onActionComplete("rejected", proof);
  };

  const handleFlag = async () => {
    setLoadingAction("flag");
    await flagProof(proof.id);
    setLoadingAction(null);
    onActionComplete("flagged", proof);
  };

  const handleToggleFeature = async () => {
    const nextFeatured = !proof.isFeatured;
    setLoadingAction("feature");
    await toggleFeatureProof(proof.id, nextFeatured);
    setLoadingAction(null);
    onActionComplete(nextFeatured ? "featured" : "unfeatured", proof);
  };

  const handleToggleShadowLimit = async () => {
    setLoadingAction("shadow");
    await toggleShadowLimitProof(proof.id, !proof.shadowLimited);
    setLoadingAction(null);
    onActionComplete("verified", proof);
  };

  const handleDelete = async () => {
    if (onRequestDelete) {
      onRequestDelete(proof);
      return;
    }
    setLoadingAction("delete");
    await deleteProof(proof.id);
    setLoadingAction(null);
    onActionComplete("deleted", proof);
  };

  const formatCreatedAt = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isGu2kVerifiedGig = Boolean(
    proof.gig?.gu2kGigId && !proof.gig.gu2kGigId.startsWith("custom_"),
  );

  const talentName = proof.talent
    ? `${proof.talent.firstName} ${proof.talent.lastName}`.trim()
    : "Arena User";

  const statusColor =
    proof.status === "APPROVED"
      ? "bg-green-100 text-green-700 border-green-200"
      : proof.status === "REJECTED"
        ? "bg-red-100 text-red-700 border-red-200"
        : proof.status === "FLAGGED"
          ? "bg-orange-100 text-orange-700 border-orange-200"
          : "bg-blue-100 text-blue-700 border-blue-200";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
        <DialogTitle className="sr-only">
          Post Details — {proof.title || "Arena Proof"}
        </DialogTitle>

        {/* Top Author & Status Header */}
        <div className="px-6 pt-5 pb-4 pr-14 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {proof.talent?.id ? (
                <Link
                  href={`/admin/talents/${proof.talent.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <UserAvatar
                    name={talentName}
                    src={proof.talent?.avatarUrl}
                    size={44}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 leading-tight truncate group-hover:text-[#7300E5] transition-colors">
                      {talentName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {proof.talent?.username
                        ? `@${proof.talent.username} • `
                        : ""}
                      {proof.talent?.location || "No location"} •{" "}
                      {formatCreatedAt(proof.createdAt)}
                    </p>
                  </div>
                </Link>
              ) : (
                <>
                  <UserAvatar
                    name={talentName}
                    src={proof.talent?.avatarUrl}
                    size={44}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 leading-tight truncate">
                      {talentName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {formatCreatedAt(proof.createdAt)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px] font-semibold",
                  isGu2kVerifiedGig
                    ? "bg-purple-100 text-[#7300E5]"
                    : "bg-gray-100 text-gray-700",
                )}
              >
                {isGu2kVerifiedGig && (
                  <BadgeCheck className="w-3.5 h-3.5 mr-1 inline" />
                )}
                {isGu2kVerifiedGig ? "Verified GU2K Gig" : "Self-reported"}
              </Badge>

              <Badge
                variant="outline"
                className={cn("text-[11px] font-medium", statusColor)}
              >
                {proof.status.charAt(0) + proof.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Body: Multi-Media Viewer + Details */}
        <div className="flex-1 overflow-y-auto">
          {activeMedia && (
            <div className="bg-zinc-950 border-b border-gray-200">
              <div className="relative w-full min-h-[260px] sm:min-h-[340px] max-h-[440px] flex items-center justify-center overflow-hidden">
                {activeMedia.type === "video" ? (
                  <video
                    key={activeMedia.url}
                    src={activeMedia.url}
                    poster={activeMedia.thumbnailUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[440px] object-contain bg-black"
                  />
                ) : failedUrls[activeMedia.url] ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 gap-2">
                    <ImageOff className="w-8 h-8" />
                    <p className="text-xs">Could not preview image inline.</p>
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 underline"
                    >
                      Open media in new tab
                    </a>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeMedia.url}
                    src={activeMedia.url}
                    alt={proof.title || "Proof media"}
                    onError={() =>
                      setFailedUrls((prev) => ({
                        ...prev,
                        [activeMedia.url]: true,
                      }))
                    }
                    className="max-h-[440px] w-full object-contain"
                  />
                )}

                {/* Navigation arrows for multi-media */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          (safeIndex - 1 + mediaList.length) % mediaList.length,
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Previous media"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((safeIndex + 1) % mediaList.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Next media"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Open original + Counter pills */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <a
                    href={activeMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-black/65 hover:bg-black/85 text-white text-[11px] font-medium px-2.5 py-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open file
                  </a>
                </div>

                {mediaList.length > 1 && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/75 text-white text-[11px] px-2.5 py-0.5 font-semibold">
                    {safeIndex + 1} / {mediaList.length} media
                  </span>
                )}
              </div>

              {/* Thumbnail Strip */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900 overflow-x-auto">
                  {mediaList.map((item, idx) => {
                    const selected = idx === safeIndex;
                    return (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                          "relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-zinc-800",
                          selected
                            ? "border-[#A855F7] ring-2 ring-[#A855F7]/40"
                            : "border-transparent opacity-70 hover:opacity-100",
                        )}
                      >
                        {item.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white">
                            <Play className="w-5 h-5 fill-white" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Post Copy, Tags, Stats */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {(proof.gig?.title || proof.title) && (
                <h2 className="text-lg font-bold text-gray-900 leading-snug">
                  {proof.gig?.title || proof.title}
                </h2>
              )}
              {proof.gig?.companyName && (
                <p className="text-xs font-medium text-[#7300E5]">
                  Company / Brand: {proof.gig.companyName}
                  {proof.gig.location ? ` • ${proof.gig.location}` : ""}
                </p>
              )}
              {proof.caption ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {proof.caption}
                </p>
              ) : (
                <p className="text-xs italic text-gray-400">
                  No written caption added.
                </p>
              )}
            </div>

            {proof.tags && proof.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {proof.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 hover:bg-purple-50 text-[11px]"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <Badge
                variant="secondary"
                className="rounded-full bg-gray-100 text-gray-700 px-3 py-1"
              >
                {proof.likesCount ?? 0} Likes
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-purple-50 text-purple-700 px-3 py-1"
              >
                {proof.salutesCount ?? 0} Salutes
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-gray-100 text-gray-700 px-3 py-1"
              >
                {proof.viewsCount ?? 0} Views
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-gray-100 text-gray-700 px-3 py-1"
              >
                {proof.sharesCount ?? 0} Shares
              </Badge>
              {proof.isFeatured && (
                <Badge className="rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Proof of the Week
                </Badge>
              )}
              {proof.shadowLimited && (
                <Badge className="rounded-full bg-gray-200 text-gray-800 px-3 py-1">
                  Shadow Limited
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0 space-y-2.5">
          <Button
            onClick={handleToggleFeature}
            disabled={!!loadingAction}
            className={cn(
              "w-full font-bold rounded-xl h-10 text-sm gap-2",
              proof.isFeatured
                ? "bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100"
                : "bg-[#7300E5] hover:bg-[#5f00bd] text-white",
            )}
          >
            <Star
              className={cn(
                "w-4 h-4",
                proof.isFeatured && "fill-yellow-500 text-yellow-500",
              )}
            />
            {proof.isFeatured
              ? "Remove Proof of the Week"
              : "Make Proof of the Week"}
          </Button>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button
              onClick={handleApprove}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-green-200 text-green-700 hover:bg-green-50 font-semibold rounded-xl h-9 text-xs gap-1.5 bg-white",
                proof.status === "APPROVED" && "bg-green-50",
              )}
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={!!loadingAction}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl h-9 text-xs gap-1.5 bg-white"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
            <Button
              onClick={handleFlag}
              disabled={!!loadingAction}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl h-9 text-xs gap-1.5 bg-white"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Flag
            </Button>
            <Button
              onClick={handleToggleShadowLimit}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-gray-200 font-semibold rounded-xl h-9 text-xs gap-1.5 bg-white",
                proof.shadowLimited && "bg-gray-100 text-gray-900 border-gray-300",
              )}
            >
              <EyeOff className="w-3.5 h-3.5" />
              {proof.shadowLimited ? "Unshadow" : "Shadow Limit"}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!!loadingAction}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl h-9 text-xs gap-1.5 bg-white col-span-2 sm:col-span-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
