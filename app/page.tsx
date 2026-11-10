"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ArenaShell from "@/components/arena/ArenaShell";
import InlineProofComposer from "@/components/arena/InlineProofComposer";
import ArenaFeedPost from "@/components/arena/ArenaFeedPost";
import { TrophyGraphic, GreenSquiggle } from "@/components/arena/HeroBannerSvg";
import ShareProofModal from "@/components/modals/ShareProofModal";
import { useProofStore } from "@/store/useProofStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Proof } from "@/services/proofService";
import { toast } from "sonner";

const FEED_TABS = [
  { label: "All", value: "all" },
  { label: "Trending", value: "trending" },
  { label: "Nearby", value: "nearby" },
  { label: "My Network", value: "network" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const {
    proofs,
    activeFilter,
    setActiveFilter,
    fetchProofs,
    isLoading,
    toggleLike,
    recordView,
    toggleBookmark,
  } = useProofStore();

  const composerRef = useRef<HTMLDivElement | null>(null);
  const [selectedProofForShare, setSelectedProofForShare] =
    useState<Proof | null>(null);

  useEffect(() => {
    fetchProofs({ filter: activeFilter });
  }, [activeFilter, fetchProofs]);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to interact with proofs on Arena.");
      return;
    }
    action();
  };

  const handleTabChange = (filterValue: string) => {
    if (filterValue === "network" && !isAuthenticated) {
      toast.error("Sign in to view proofs from your network.");
      return;
    }
    setActiveFilter(filterValue);
  };

  const handleFocusComposer = () => {
    if (composerRef.current) {
      composerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const textarea = composerRef.current.querySelector("textarea");
      textarea?.focus();
    }
  };

  const handleShareClick = (proof: Proof) => {
    setSelectedProofForShare(proof);
  };

  return (
    <ArenaShell onShareProofClick={handleFocusComposer}>
      <div className="space-y-7">
        {/* Top Hero Banner (Unauthenticated) OR Inline Composer (Authenticated) */}
        {isAuthenticated ? (
          <InlineProofComposer composerRef={composerRef} />
        ) : (
          <div className="relative overflow-hidden rounded-[22px] bg-[#7E00EE] px-7 py-8 sm:px-9 sm:py-9 text-white min-h-[210px] flex items-center justify-between">
            <div className="relative z-10 max-w-[330px]">
              <h1 className="text-[36px] sm:text-[42px] font-bold leading-[1.06] tracking-[-0.03em] text-white">
                Share your work, level up.
              </h1>
              <GreenSquiggle className="w-[180px] h-4 mt-1.5" />

              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 h-10 rounded-xl bg-[#18181B] hover:bg-black text-white text-[13px] font-semibold transition-transform active:scale-95 shadow-md"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Right Trophy Illustration */}
            <div className="pointer-events-none absolute -right-4 -bottom-6 w-[250px] sm:w-[295px] h-[230px] sm:h-[255px]">
              <TrophyGraphic className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Feed Section */}
        <div>
          <h2 className="text-[18px] font-bold text-black tracking-[-0.02em]">
            Feed
          </h2>

          {/* Filter Tabs */}
          <div className="mt-3 flex items-center gap-6 border-b border-[#EFEFF3]">
            {FEED_TABS.map((tab) => {
              const active = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={`pb-2.5 text-[13px] relative transition-colors cursor-pointer ${
                    active
                      ? "text-[#7E00EE] font-semibold"
                      : "text-[#747682] hover:text-black font-medium"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7E00EE] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Posts List */}
          <div>
            {isLoading ? (
              <div className="divide-y divide-[#EFEFF3]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="py-5 space-y-3 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-gray-100 rounded" />
                          <div className="w-24 h-2.5 bg-gray-100 rounded" />
                        </div>
                      </div>
                      <div className="w-36 h-5 bg-gray-100 rounded-full" />
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded" />
                    <div className="w-5/6 h-3.5 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : proofs.length > 0 ? (
              <div>
                {proofs.map((proof, index) => (
                  <ArenaFeedPost
                    key={proof.id}
                    proof={proof}
                    index={index}
                    onLike={(id) => requireAuth(() => toggleLike(id))}
                    onView={recordView}
                    onBookmark={(id) => requireAuth(() => toggleBookmark(id))}
                    onShare={handleShareClick}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-[15px] font-semibold text-black">
                  No proofs found in this feed yet
                </p>
                <p className="text-[13px] text-[#747682] mt-1">
                  Share proof of your completed gigs to get featured on Arena.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Proof Modal */}
      <ShareProofModal
        isOpen={Boolean(selectedProofForShare)}
        onClose={() => setSelectedProofForShare(null)}
        proof={selectedProofForShare}
      />
    </ArenaShell>
  );
}
