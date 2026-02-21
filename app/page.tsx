/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DailyPulse from "@/components/DailyPulse";
import ProofCard from "@/components/ProofCard";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import { Briefcase } from "lucide-react";

// Modals
import ProofDetailModal from "@/components/modals/ProofDetailModal";
import CreateProofModal from "@/components/modals/CreateProofModal";
import DailyPulseModal from "@/components/modals/DailyPulseModal";
import { useProofStore } from "@/store/useProofStore";
import { Proof } from "@/services/proofService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

// Helper to calculate time ago
function timeAgo(dateString?: string) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const [activeModal, setActiveModal] = useState<
    "detail" | "create" | "pulse" | null
  >(null);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  const { proofs, fetchProofs, isLoading, saluteProof } = useProofStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  // Check auth helper
  const checkAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform this action.",
        variant: "destructive",
      });
      return;
    }
    action();
  };

  // Map proofs for the "Proofs of the week" section
  const topProofs = proofs.slice(0, 3).map((p, index) => ({
    ...p,
    rank: index + 1,
    image: p.mediaUrl,
    avatar:
      p.talent?.avatar ||
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
    name: `${p.talent?.firstName || "Anonymous"} ${p.talent?.lastName || ""}`,
    description: p.title,
  }));

  const categories = ["All", "Trending", "Nearby", "My network"];

  const handleProofClick = (proof: any) => {
    setSelectedProof(proof);
    setActiveModal("detail");
  };

  const closeModals = () => {
    setActiveModal(null);
    setSelectedProof(null);
  };

  return (
    <main className="min-h-screen pt-24 pb-12 bg-white">
      <div className="container mx-auto px-4 md:px-6 space-y-12">
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Arena</h1>
              <p className="text-muted-foreground">
                Explore what people are doing today
              </p>
            </div>
            {/* Daily Pulse Trigger */}
            <div
              onClick={() => checkAuth(() => setActiveModal("pulse"))}
              className="cursor-pointer transition-transform active:scale-95"
            >
              <DailyPulse />
            </div>
          </div>

          {!isLoading && proofs.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">
                  Proofs of the week
                </h2>
                <Button
                  onClick={() => checkAuth(() => setActiveModal("create"))}
                  className="rounded-full bg-primary hover:bg-primary/90 font-bold px-6"
                >
                  Share proof (+10 Pt)
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProofs.map((proof) => (
                  <ProofCard
                    key={proof.id}
                    rank={proof.rank}
                    image={proof.image}
                    avatar={proof.avatar}
                    name={proof.name}
                    description={proof.description}
                    onClick={() => handleProofClick(proof)}
                  />
                ))}
              </div>
            </div>
          ) : !isLoading && proofs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                  Join the arena
                </h2>
                <p className="text-muted-foreground text-lg">
                  These creators set the pace. Now it’s your move.
                </p>
              </div>
              <Button
                onClick={() => checkAuth(() => setActiveModal("create"))}
                className="rounded-full bg-primary hover:bg-primary/90 font-bold px-8 py-6 text-base shadow-lg shadow-primary/20"
              >
                Share proof (+10 Pt)
              </Button>
            </div>
          ) : null}
        </section>

        {/* Filter Section */}
        <section className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full text-base font-semibold whitespace-nowrap transition-colors ${
                  index === 0
                    ? "bg-[#F7EFFD] text-primary"
                    : "bg-[#F7EFFD] text-gray-600 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => checkAuth(() => setActiveModal("pulse"))}
            className="text-primary font-bold hover:bg-primary/5"
          >
            Answer Daily pulse
          </Button>
        </section>

        {/* Feed Section with Skeleton Loading */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <FeedSkeleton key={index} />
              ))
            : proofs.map((proof) => (
                <FeedCard
                  key={proof.id}
                  avatar={
                    proof.talent?.avatar ||
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                  } // Fallback avatar
                  name={`${proof.talent?.firstName || "Anonymous"} ${proof.talent?.lastName || ""}`}
                  location={proof.talent?.location || "Global"}
                  timeAgo={timeAgo(proof.createdAt)}
                  badge="Win"
                  image={proof.mediaUrl}
                  tags={proof.tags || []}
                  title={proof.title}
                  description={proof.caption || ""}
                  salutes={proof.salutesCount || 0}
                  onSalute={() => checkAuth(() => saluteProof(proof.id))}
                  onClick={() => handleProofClick(proof)}
                />
              ))}
        </section>
      </div>

      {/* Modals */}
      <ProofDetailModal
        isOpen={activeModal === "detail"}
        onClose={closeModals}
        proof={selectedProof}
      />
      <CreateProofModal
        isOpen={activeModal === "create"}
        onClose={closeModals}
      />
      <DailyPulseModal isOpen={activeModal === "pulse"} onClose={closeModals} />
    </main>
  );
}
