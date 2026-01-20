"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Flame,
  Zap,
  Search,
  Crown,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import RequestHireModal from "@/components/modals/RequestHireModal";
import CollaborateModal from "@/components/modals/CollaborateModal";
import { cn } from "@/lib/utils";

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

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"hire" | "collaborate" | null>(
    null,
  );

  // Simulated Lazy Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const feedItems: FeedItem[] = [
    {
      id: 101,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      name: "Ebibere Rinebai",
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
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      name: "Ebibere Rinebai",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Learning",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
    {
      id: 103,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      name: "Ebibere Rinebai",
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
      id: 104,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
      name: "Ebibere Rinebai",
      location: "Lagos",
      timeAgo: "3hrs ago",
      badge: "Learning",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
      tags: ["UGC", "win", "unicorn"],
      title: "Collaborated with a Unicorn Startup!",
      description:
        "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
      salutes: 87,
    },
  ];

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Left Sidebar - User Info */}
          <aside className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-8 lg:sticky lg:top-28">
            {/* Header */}
            <div className="space-y-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                  alt="Ebibere Rinebai"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Ebibere Rinebai
                </h1>
                <p className="text-gray-500 font-medium">@ebibere</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900">Bio</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Mystery shopper and field reporter. Eyes everywhere
              </p>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Location
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Date joined
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Joined Jun 2024</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>7-Day Active</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Top Hustler</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>Street Analyst</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Legend</span>
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Top Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {["DCAS", "Field Ops", "Mystery Shop"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Index */}
            <div className="space-y-2 pt-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Progress Index
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#7300E5]">189</span>
                  <span className="text-xs text-gray-400 ml-1 block -mt-1">
                    Level 6
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#F3E8FF] rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-[#7300E5] rounded-full" />
              </div>
              <p className="text-xs text-[#7300E5] font-medium">
                11 Pt to{" "}
                <span className="underline cursor-pointer">Level 7</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setActiveModal("hire")}
                className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl h-10 shadow-lg shadow-purple-100"
              >
                Hire me
              </Button>
              <Button
                onClick={() => setActiveModal("collaborate")}
                variant="outline"
                className="flex-1 border-[#7300E5] text-[#7300E5] hover:bg-[#F3E8FF] font-bold rounded-xl h-10"
              >
                Let&apos;s collaborate
              </Button>
            </div>
          </aside>

          {/* Right Content - Feed */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#7300E5]">Proofs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
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
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestHireModal
        isOpen={activeModal === "hire"}
        onClose={() => setActiveModal(null)}
        talentName="Ebibere Rinebai"
      />
      <CollaborateModal
        isOpen={activeModal === "collaborate"}
        onClose={() => setActiveModal(null)}
        partnerName="Ebibere Rinebai"
      />
    </main>
  );
}
