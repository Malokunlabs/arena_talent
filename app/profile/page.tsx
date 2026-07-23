"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Calendar, Star } from "lucide-react";
import PIProgressBar from "@/components/pi/PIProgressBar";
import { PiStatus } from "@/services/piService";
import { Button } from "@/components/ui/button";
import FeedCard from "@/components/FeedCard";
import RequestHireModal from "@/components/modals/RequestHireModal";
import CollaborateModal from "@/components/modals/CollaborateModal";
import ProofDetailModal from "@/components/modals/ProofDetailModal";
import SkillBadgePill from "@/components/SkillBadgePill";
import RatingsPanel from "@/components/RatingsPanel";
import UserAvatar from "@/components/UserAvatar";
import { useTalentStore } from "@/store/useTalentStore";
import { useProofStore } from "@/store/useProofStore";
import { Proof } from "@/services/proofService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { BadgeApplication } from "@/services/badgeService";
import { ReviewItem, RatingBreakdown } from "@/services/reviewService";

function ProfileContent() {
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
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

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

  const { talent, proofs } = selectedTalentProfile;
  const fullName = `${talent.firstName} ${talent.lastName}`;
  // avatarUrl may be null/undefined — UserAvatar handles the fallback
  const avatarSrc = talent.avatarUrl || talent.avatar || null;

  // Approved skill badges from backend profile response
  const approvedBadges: BadgeApplication[] =
    (selectedTalentProfile.approvedSkillBadges as BadgeApplication[]) ?? [];

  // Reviews / rating from backend profile response
  const ratingBreakdown =
    (selectedTalentProfile.ratingBreakdown as unknown as RatingBreakdown) ??
    null;
  const recentReviews =
    (selectedTalentProfile.recentReviews as unknown as ReviewItem[]) ?? [];
  const totalReviews = ratingBreakdown?.reviewCount ?? 0;
  const overallRating = ratingBreakdown?.avgOverall ?? talent.rating ?? 0;

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-8 items-start">
          {/* ── Left Sidebar ── */}
          <aside className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-7 lg:sticky lg:top-28">
            {/* Header */}
            <div className="space-y-4">
              <UserAvatar
                name={fullName}
                src={avatarSrc}
                size={80}
                className="border-2 border-white shadow-sm"
              />
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <p className="text-gray-500 font-medium">@{talent.username}</p>

                {/* Inline star rating */}
                {overallRating > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(overallRating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-100 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[12px] font-bold text-gray-700">
                      {overallRating.toFixed(1)}
                    </span>
                    {totalReviews > 0 && (
                      <span className="text-[11px] text-gray-400">
                        ({totalReviews})
                      </span>
                    )}
                  </div>
                )}
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{talent.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  Joined{" "}
                  {talent.createdAt
                    ? new Date(talent.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Unknown"}
                </span>
              </div>
            </div>

            {/* Skill Badges */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Skill Badges
              </h3>
              {approvedBadges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {approvedBadges.map((app) => (
                    <SkillBadgePill
                      key={app.id}
                      name={app.badge.name}
                      iconKey={app.badge.iconKey}
                      tier={app.currentTier}
                      status={app.status}
                      description={app.badge.description}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">
                  No verified badges yet.
                </p>
              )}
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

            {/* Progress Index */}
            {(() => {
              const syntheticPiStatus: PiStatus = {
                piScore: talent.piScore ?? 0,
                progressIndex: talent.progressIndex ?? 0,
                level:
                  (talent.progressIndex ?? 0) > 0 ? talent.progressIndex! : 1,
                piToNextLevel: talent.piToNextLevel ?? 0,
                nextLevelPi: talent.nextLevelPi ?? null,
              };
              return <PIProgressBar piStatus={syntheticPiStatus} />;
            })()}

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

          {/* ── Right Content ── */}
          <div className="space-y-8">
            {/* Ratings & Reviews */}
            <RatingsPanel
              breakdown={ratingBreakdown}
              reviews={recentReviews}
              totalReviews={totalReviews}
            />

            {/* Proofs */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#7300E5]">Proofs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proofs.length > 0 ? (
                  proofs.map((item) => (
                    <FeedCard
                      key={item.id}
                      avatar={avatarSrc ?? ""}
                      name={fullName}
                      location={item.talent?.location || talent.location}
                      timeAgo={new Date(item.createdAt).toLocaleDateString()}
                      badge="Win"
                      image={item.mediaUrl}
                      tags={item.tags || []}
                      title={item.title}
                      description={item.caption}
                      salutes={item.salutesCount || 0}
                      onSalute={() => checkAuth(() => saluteProof(item.id))}
                      onShare={() => setSelectedProof(item)}
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
      </div>

      {/* Modals */}
      <RequestHireModal
        isOpen={activeModal === "hire"}
        onClose={() => setActiveModal(null)}
        talentName={fullName}
        talentId={talent.id}
      />
      <CollaborateModal
        isOpen={activeModal === "collaborate"}
        onClose={() => setActiveModal(null)}
        partnerName={fullName}
        partnerId={talent.id}
      />
      <ProofDetailModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        proof={
          selectedProof
            ? {
                image: selectedProof.mediaUrl,
                rank: 1,
                name: fullName,
                avatar: avatarSrc ?? "",
                username: talent.username,
                proofboardLink: `/talent/${talent.username}`,
                id: selectedProof.id,
              }
            : null
        }
      />
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center py-20">Loading Profile...</div>
          </div>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
