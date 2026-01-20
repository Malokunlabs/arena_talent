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

interface Proof {
  id: number;
  rank: number;
  image: string;
  avatar: string;
  name: string;
  description: string;
  proofboardLink: string;
}

interface FeedItem {
  id: number;
  avatar: string;
  name: string;
  location: string;
  timeAgo: string;
  badge: "Win" | "Hustle" | "Unicorn" | "Learning";
  image: string;
  tags: string[];
  title: string;
  description: string;
  salutes: number;
}

export default function Home() {
  const [activeModal, setActiveModal] = useState<
    "detail" | "create" | "pulse" | null
  >(null);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Lazy Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show skeleton for 2 seconds
    return () => clearTimeout(timer);
  }, []);

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

  const feedItems: FeedItem[] = [
    {
      id: 101,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
      name: "Kponane Abam",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Win",
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 102,
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2574&auto=format&fit=crop",
      name: "Wariso Tuma",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Hustle",
      image:
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=2626&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 103,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
      name: "Nnamdi Nwanze",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Learning",
      image:
        "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?q=80&w=2574&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 104,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop",
      name: "Abubakar Gambo",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Win",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 105,
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=2680&auto=format&fit=crop",
      name: "Sade Oyeleke",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Win",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 106,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop",
      name: "Boma Kalio",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Win",
      image:
        "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=2658&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
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

        {/* Feed Section with Skeleton Loading */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <FeedSkeleton key={index} />
              ))
            : feedItems.map((item) => (
                <FeedCard
                  key={item.id}
                  avatar={item.avatar}
                  name={item.name}
                  location={item.location}
                  timeAgo={item.timeAgo}
                  badge={item.badge}
                  image={item.image}
                  tags={item.tags}
                  title={item.title}
                  description={item.description}
                  salutes={item.salutes}
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
