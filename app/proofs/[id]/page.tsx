"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import ArenaShell from "@/components/arena/ArenaShell";
import ArenaFeedPost from "@/components/arena/ArenaFeedPost";
import ShareProofModal from "@/components/modals/ShareProofModal";
import { proofService, Proof } from "@/services/proofService";
import { useProofStore } from "@/store/useProofStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function SharedProofPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { isAuthenticated } = useAuthStore();
  const { toggleLike, toggleBookmark, recordView } = useProofStore();

  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    proofService
      .getProofById(id)
      .then((res) => {
        if (!cancelled) {
          setProof(res);
          recordView(res.id);
        }
      })
      .catch(() => {
        if (!cancelled) setProof(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, recordView]);

  const handleLike = async (proofId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like this proof.");
      return;
    }
    setProof((prev) =>
      prev
        ? {
            ...prev,
            hasLiked: !prev.hasLiked,
            likesCount: Math.max(
              (prev.likesCount || 0) + (prev.hasLiked ? -1 : 1),
              0,
            ),
          }
        : prev,
    );
    await toggleLike(proofId);
  };

  const handleBookmark = async (proofId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark this proof.");
      return;
    }
    setProof((prev) =>
      prev
        ? {
            ...prev,
            isBookmarked: !prev.isBookmarked,
          }
        : prev,
    );
    await toggleBookmark(proofId);
  };

  return (
    <ArenaShell>
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#747682] hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#7E00EE]" />
          </div>
        ) : proof ? (
          <ArenaFeedPost
            proof={proof}
            onLike={handleLike}
            onView={recordView}
            onBookmark={handleBookmark}
            onShare={() => setShareOpen(true)}
          />
        ) : (
          <div className="py-20 text-center space-y-2">
            <h1 className="text-[18px] font-bold text-black">
              Proof not found
            </h1>
            <p className="text-[13px] text-[#747682]">
              This proof may have been deleted or is no longer available.
            </p>
          </div>
        )}
      </div>

      <ShareProofModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        proof={proof}
      />
    </ArenaShell>
  );
}
