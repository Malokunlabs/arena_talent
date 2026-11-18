"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import { AdminProof } from "@/services/adminService";
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
} from "lucide-react";
import { AdminFeedbackType } from "./ActionFeedbackModal";

interface ProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: AdminProof;
  onActionComplete: (type: AdminFeedbackType, proof: AdminProof) => void;
  onRequestDelete?: (proof: AdminProof) => void;
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
  const primaryMedia = proof.mediaItems?.[0];
  const primaryUrl = primaryMedia?.url || proof.mediaUrl;
  const isVideo =
    primaryMedia?.type === "video" ||
    Boolean(primaryUrl && /\.(mp4|mov|webm|m4v)(\?|$)/i.test(primaryUrl));

  const talentName = proof.talent
    ? `${proof.talent.firstName} ${proof.talent.lastName}`.trim()
    : "Arena User";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
        <DialogTitle className="sr-only">
          Post Details — {proof.title || "Arena Proof"}
        </DialogTitle>

        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                name={talentName}
                src={proof.talent?.avatarUrl}
                size={40}
              />
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 leading-tight truncate">
                  {talentName}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {proof.talent?.username ? `@${proof.talent.username} • ` : ""}
                  {proof.talent?.location || "No location"} •{" "}
                  {formatCreatedAt(proof.createdAt)}
                </p>
              </div>
            </div>

            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 text-[11px] font-semibold",
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
          </div>
        </div>

        {primaryUrl && (
          <div className="relative aspect-[16/10] w-full bg-black/5">
            {isVideo ? (
              <video
                src={primaryUrl}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <Image
                src={primaryUrl}
                alt={proof.title || "Proof media"}
                fill
                className="object-cover"
              />
            )}
            {(proof.mediaUrls?.length || 0) > 1 && (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-white text-[11px] px-2.5 py-0.5 font-medium">
                1 / {proof.mediaUrls?.length} media
              </span>
            )}
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            {(proof.gig?.title || proof.title) && (
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {proof.gig?.title || proof.title}
              </h2>
            )}
            {proof.caption && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {proof.caption}
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

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant="secondary"
              className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5"
            >
              {proof.likesCount} Likes
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5"
            >
              {proof.salutesCount} Salutes
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5"
            >
              {proof.viewsCount ?? 0} Views
            </Badge>
            {proof.isFeatured && (
              <Badge className="rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-0.5">
                <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                Proof of the Week
              </Badge>
            )}
            {proof.shadowLimited && (
              <Badge className="rounded-full bg-gray-200 text-gray-800 px-2.5 py-0.5">
                Shadow Limited
              </Badge>
            )}
          </div>

          {/* Primary Proof of the Week CTA */}
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

          {/* Moderation Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              onClick={handleApprove}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-green-200 text-green-700 hover:bg-green-50 font-semibold rounded-xl h-9 text-xs gap-1.5",
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
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl h-9 text-xs gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
            <Button
              onClick={handleFlag}
              disabled={!!loadingAction}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl h-9 text-xs gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Flag
            </Button>
            <Button
              onClick={handleToggleShadowLimit}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-gray-200 font-semibold rounded-xl h-9 text-xs gap-1.5 sm:col-span-2",
                proof.shadowLimited && "bg-gray-100 text-gray-900 border-gray-300",
              )}
            >
              <EyeOff className="w-3.5 h-3.5" />
              {proof.shadowLimited ? "Remove Shadow Limit" : "Shadow Limit"}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!!loadingAction}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl h-9 text-xs gap-1.5"
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
