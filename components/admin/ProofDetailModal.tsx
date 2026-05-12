"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { AdminProof } from "@/services/adminService";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/utils";

interface ProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: AdminProof;
  onActionComplete: (
    type: "approved" | "rejected" | "featured" | "verified" | "flagged",
    proof: AdminProof,
  ) => void;
}

export default function ProofDetailModal({
  isOpen,
  onClose,
  proof,
  onActionComplete,
}: ProofDetailModalProps) {
  const {
    approveProof,
    rejectProof,
    flagProof,
    toggleFeatureProof,
    toggleShadowLimitProof,
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
    setLoadingAction("feature");
    await toggleFeatureProof(proof.id, !proof.isFeatured);
    setLoadingAction(null);
    onActionComplete("featured", proof);
  };

  const handleToggleShadowLimit = async () => {
    setLoadingAction("shadow");
    await toggleShadowLimitProof(proof.id, !proof.shadowLimited);
    setLoadingAction(null);
    // No explicit feedback modal for shadow limit, just refresh the UI
    onActionComplete("verified", proof);
  };

  const handleVerify = async () => {
    setLoadingAction("verify");
    await approveProof(proof.id);
    setLoadingAction(null);
    onActionComplete("verified", proof);
  };

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) return `${diffHrs}hrs ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-sm border-none shadow-2xl rounded-3xl">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage
                  src={
                    proof.talent?.avatarUrl ||
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                  }
                />
                <AvatarFallback>{proof.talent?.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">
                  {proof.talent?.firstName} {proof.talent?.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {proof.talent?.location || "Global"} •{" "}
                  {timeAgo(proof.createdAt)}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 hover:bg-purple-100"
            >
              Learning
            </Badge>
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full bg-gray-100">
          {proof.mediaUrl && (
            <Image
              src={proof.mediaUrl}
              alt={proof.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {proof.tags?.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-purple-50 text-purple-700 hover:bg-purple-50 text-[10px]"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {proof.title}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {proof.caption}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px]"
            >
              {proof.salutesCount} Salutes
            </Badge>
            {proof.isFeatured && (
              <Badge className="rounded-full bg-yellow-100 text-yellow-700 text-[10px]">
                Featured
              </Badge>
            )}
            {proof.shadowLimited && (
              <Badge className="rounded-full bg-gray-100 text-gray-700 text-[10px]">
                Shadow Limited
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={handleApprove}
              disabled={!!loadingAction}
              className="bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl h-10 text-sm"
            >
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={!!loadingAction}
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl h-10 text-sm"
            >
              Reject
            </Button>
            <Button
              onClick={handleFlag}
              disabled={!!loadingAction}
              variant="outline"
              className="border-orange-200 text-orange-500 hover:bg-orange-50 font-bold rounded-xl h-10 text-sm"
            >
              Flag
            </Button>
            <Button
              onClick={handleToggleFeature}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-gray-200 font-bold rounded-xl h-10 text-sm",
                proof.isFeatured && "bg-yellow-50 text-yellow-600 border-yellow-200",
              )}
            >
              {proof.isFeatured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              onClick={handleToggleShadowLimit}
              disabled={!!loadingAction}
              variant="outline"
              className={cn(
                "border-gray-200 font-bold rounded-xl h-10 text-sm",
                proof.shadowLimited && "bg-gray-100 text-gray-900 border-gray-300",
              )}
            >
              {proof.shadowLimited ? "Unshadow" : "Shadow Limit"}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!!loadingAction}
              variant="outline"
              className="border-gray-200 font-bold rounded-xl h-10 text-sm"
            >
              Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
