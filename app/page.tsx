"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import DailyPulse from "@/components/DailyPulse";
import ProofCard from "@/components/ProofCard";
import { Briefcase } from "lucide-react";

// Modals
import ProofDetailModal from "@/components/modals/ProofDetailModal";
import CreateProofModal from "@/components/modals/CreateProofModal";
import DailyPulseModal from "@/components/modals/DailyPulseModal";

interface Proof {
  id: number;
  rank: number;
  image: string;
  avatar: string;
  name: string;
  description: string;
  proofboardLink: string;
}

export default function Home() {
  const [activeModal, setActiveModal] = useState<
    "detail" | "create" | "pulse" | null
  >(null);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  const proofs: Proof[] = [
    {
      id: 1,
      rank: 1,
      image:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      name: "Ebibere Rinebai",
      description: "Reached 100 completed gigs milestone",
      proofboardLink: "/ebibere_rinebai",
    },
    {
      id: 2,
      rank: 2,
      image:
        "https://images.unsplash.com/photo-1551024601-563de87ee505?q=80&w=2602&auto=format&fit=crop",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop",
      name: "Funke Alade",
      description: "Reached 100 completed gigs milestone",
      proofboardLink: "/funke_alade",
    },
    {
      id: 3,
      rank: 3,
      image:
        "https://images.unsplash.com/photo-1513279922550-250c2129b13a?q=80&w=2670&auto=format&fit=crop",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2487&auto=format&fit=crop",
      name: "Idubamo Erekosima",
      description: "Reached 100 completed gigs milestone",
      proofboardLink: "/idubamo_erekosima",
    },
  ];

  const categories = ["All", "Trending", "Nearby", "My network"];

  const handleProofClick = (proof: Proof) => {
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
              onClick={() => setActiveModal("pulse")}
              className="cursor-pointer transition-transform active:scale-95"
            >
              <DailyPulse />
            </div>
          </div>

          {proofs.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">
                  Proofs of the week
                </h2>
                <Button
                  onClick={() => setActiveModal("create")}
                  className="rounded-full bg-primary hover:bg-primary/90 font-bold px-6"
                >
                  Share proof (+10 Pt)
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {proofs.map((proof) => (
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
          ) : (
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
                onClick={() => setActiveModal("create")}
                className="rounded-full bg-primary hover:bg-primary/90 font-bold px-8 py-6 text-base shadow-lg shadow-primary/20"
              >
                Share proof (+10 Pt)
              </Button>
            </div>
          )}
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
            onClick={() => setActiveModal("pulse")}
            className="text-primary font-bold hover:bg-primary/5"
          >
            Answer Daily pulse
          </Button>
        </section>

        {/* Feed Placeholder (for context) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none select-none">
          {/* Placeholders to show layout structure below filters */}
          <div className="aspect-4/5 bg-gray-200 rounded-2xl"></div>
          <div className="aspect-4/5 bg-gray-200 rounded-2xl"></div>
          <div className="aspect-4/5 bg-gray-200 rounded-2xl"></div>
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
