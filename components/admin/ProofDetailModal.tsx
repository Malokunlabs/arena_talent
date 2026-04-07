"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { AdminProof, adminService } from "@/services/adminService";
import { useAdminStore } from "@/store/useAdminStore";

interface ProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: AdminProof;
  onActionComplete: (
    type: "approved" | "rejected" | "featured" | "verified",
    proof: AdminProof,
  ) => void;
}

export default function ProofDetailModal({
  isOpen,
  onClose,
  proof,
  onActionComplete,
}: ProofDetailModalProps) {
  const { approveProof, rejectProof, featureProof } = useAdminStore();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoadingAction("approve");
    await approveProof(proof.id);
    setLoadingAction(null);
    onActionComplete("approved", proof);
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    // Hardcoded reason for now, could be a prompt
    await rejectProof(proof.id, "Content does not meet guidelines");
    setLoadingAction(null);
    onActionComplete("rejected", proof);
  };

  const handleFeature = async () => {
    setLoadingAction("feature");
    await featureProof(proof.id, !proof.isFeatured);
    setLoadingAction(null);
    onActionComplete("featured", proof);
  };

  const handleVerify = async () => {
    setLoadingAction("verify");
    // Verify usually just means approve? Or is it separate?
    // Based on UI, Verify is a button. "Proof verified" state exists.
    // Assuming Verify = Approve + Verify Talent or maybe just a visual state in this context?
    // Let's assume it maps to Approve for now or a separate verify endpoint if exists.
    // Wait, the image shows "Proof verified" as a state in the dropdown.
    // Let's implement it as a specialized approve or just allow it as "Verify".
    // Since we don't have a specific "Verify" endpoint in dummy.txt, I'll map it to Approve for now but using the Verified tag logic.
    await approveProof(proof.id);
    setLoadingAction(null);
    onActionComplete("verified", proof);
  };

  const timeAgo = (dateStr: string) => {
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
                    proof.talent?.avatar ||
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

        <div className="relative aspect-[4/3] w-full bg-gray-100">
          {proof.mediaUrl && (
            <Image
              src={proof.mediaUrl}
              alt={proof.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {proof.tags?.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-purple-50 text-purple-700 hover:bg-purple-50"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900">{proof.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {proof.caption}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-purple-50 text-purple-700 px-3 py-1"
            >
              {proof.salutesCount} Salutes
            </Badge>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleVerify}
              disabled={!!loadingAction}
              className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl"
            >
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={!!loadingAction}
              variant="outline"
              className="flex-1 border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl"
            >
              Reject
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 font-bold rounded-xl"
            >
              Verify
            </Button>
            <Button
              onClick={handleFeature}
              disabled={!!loadingAction}
              variant="outline"
              className="border-gray-200 font-bold rounded-xl"
            >
              Feature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
