"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, Calendar, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedCard from "@/components/FeedCard";
import RequestHireModal from "@/components/modals/RequestHireModal";
import CollaborateModal from "@/components/modals/CollaborateModal";
import { useTalentStore } from "@/store/useTalentStore";
import { useProofStore } from "@/store/useProofStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const { selectedTalentProfile, fetchTalentByUsername, isLoading } =
    useTalentStore();
  const { saluteProof } = useProofStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [activeModal, setActiveModal] = useState<"hire" | "collaborate" | null>(
    null,
  );

  useEffect(() => {
    if (username) {
      fetchTalentByUsername(username);
    }
  }, [username, fetchTalentByUsername]);

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

  if (isLoading) {
    return (
      <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-20">Loading Profile...</div>
        </div>
      </main>
    );
  }

  if (!selectedTalentProfile) {
    return (
      <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <h2 className="text-xl font-bold">Profile not found</h2>
            <p>Please check the username or try searching again.</p>
          </div>
        </div>
      </main>
    );
  }

  const { talent, stats, proofs } = selectedTalentProfile;
  const fullName = `${talent.firstName} ${talent.lastName}`;
  const avatarUrl =
    talent.avatar ||
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop";

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
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-gray-500 font-medium">@{talent.username}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-900">Bio</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {talent.bio || "No bio available."}
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
                  <span>{talent.location}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Date joined
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(
                      talent.createdAt || Date.now(),
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {/* Mock badges for now as they aren't in the API yet, or use what we have */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>7-Day Active</span>
                </div>
                {/* ... other badges ... */}
              </div>
            </div>

            {/* Top Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Top Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Index - Using stats from API */}
            <div className="space-y-2 pt-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Progress Index
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#7300E5]">
                    {stats.totalSalutes}
                  </span>
                  <span className="text-xs text-gray-400 ml-1 block -mt-1">
                    Salutes
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#F3E8FF] rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-[#7300E5] rounded-full" />
              </div>
              <p className="text-xs text-[#7300E5] font-medium">
                {stats.totalGigs} Total Gigs Completed
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => checkAuth(() => setActiveModal("hire"))}
                className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl h-10 shadow-lg shadow-purple-100"
              >
                Hire me
              </Button>
              <Button
                onClick={() => checkAuth(() => setActiveModal("collaborate"))}
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
              {proofs.length > 0 ? (
                proofs.map((item) => (
                  <FeedCard
                    key={item.id}
                    avatar={avatarUrl}
                    name={fullName}
                    location={item.talent?.location || talent.location}
                    timeAgo={new Date(item.createdAt).toLocaleDateString()}
                    badge="Win" // Defaulting since not in proof API explicit
                    image={item.mediaUrl}
                    tags={item.tags || []}
                    title={item.title}
                    description={item.caption}
                    salutes={item.salutesCount || 0}
                    onSalute={() => checkAuth(() => saluteProof(item.id))}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100">
                  No proofs to show.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestHireModal
        isOpen={activeModal === "hire"}
        onClose={() => setActiveModal(null)}
        talentName={fullName}
        talentAvatar={avatarUrl}
        talentId={talent.id}
      />
      <CollaborateModal
        isOpen={activeModal === "collaborate"}
        onClose={() => setActiveModal(null)}
        partnerName={fullName}
      />
    </main>
  );
}
