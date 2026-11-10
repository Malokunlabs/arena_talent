"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Search,
  Share2,
  UserPlus,
} from "lucide-react";
import ArenaShell from "@/components/arena/ArenaShell";
import ArenaFeedPost from "@/components/arena/ArenaFeedPost";
import ShareProofModal from "@/components/modals/ShareProofModal";
import RecommendationsModal from "@/components/modals/RecommendationsModal";
import CvModal from "@/components/modals/CvModal";
import { LevelPill, getLevelColor } from "@/components/arena/LevelBadge";
import UserAvatar from "@/components/UserAvatar";
import { useTalentStore } from "@/store/useTalentStore";
import { useProofStore } from "@/store/useProofStore";
import { connectionService } from "@/services/connectionService";
import { Proof } from "@/services/proofService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

function ProfileContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const { selectedTalentProfile, fetchTalentByUsername, isLoading } =
    useTalentStore();
  const { toggleLike, recordView, toggleBookmark } = useProofStore();
  const { isAuthenticated, user } = useAuthStore();

  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionState, setConnectionState] = useState<
    "idle" | "sending" | "pending" | "connected"
  >("idle");

  useEffect(() => {
    if (username) {
      fetchTalentByUsername(username);
    }
  }, [username, fetchTalentByUsername]);

  // Check if user is already connected when authenticated
  useEffect(() => {
    if (!isAuthenticated || !selectedTalentProfile?.talent?.id) return;
    let cancelled = false;
    connectionService
      .getConnections()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        const alreadyConnected = list.some(
          (c) => c.id === selectedTalentProfile.talent.id,
        );
        if (alreadyConnected) setConnectionState("connected");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedTalentProfile?.talent?.id]);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to perform this action.");
      return;
    }
    action();
  };

  const handleConnect = async () => {
    if (!selectedTalentProfile?.talent?.id) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to connect with talents on Arena.");
      return;
    }
    if (connectionState !== "idle") return;

    setConnectionState("sending");
    try {
      const res = await connectionService.sendRequest(
        selectedTalentProfile.talent.id,
      );
      setConnectionState(
        res?.status === "ACCEPTED" ? "connected" : "pending",
      );
      toast.success(
        res?.status === "ACCEPTED"
          ? "Connected!"
          : "Connection request sent!",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send connection request";
      if (/already connected/i.test(message)) {
        setConnectionState("connected");
      } else if (/pending/i.test(message)) {
        setConnectionState("pending");
      } else {
        setConnectionState("idle");
        toast.error(message);
      }
    }
  };

  if (isLoading && !selectedTalentProfile) {
    return (
      <ArenaShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-[156px] w-full rounded-2xl bg-gray-100" />
          <div className="flex items-end justify-between -mt-12 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white" />
            <div className="flex gap-2">
              <div className="h-9 w-24 rounded-xl bg-gray-100" />
              <div className="h-9 w-24 rounded-xl bg-gray-100" />
            </div>
          </div>
          <div className="h-7 w-52 bg-gray-100 rounded-lg" />
          <div className="h-20 w-full bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3.5">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </ArenaShell>
    );
  }

  if (!selectedTalentProfile) {
    return (
      <ArenaShell>
        <div className="py-20 text-center space-y-2">
          <h2 className="text-[18px] font-bold text-black">
            Profile not found
          </h2>
          <p className="text-[13px] text-[#747682]">
            Please check the username or search Arena.
          </p>
        </div>
      </ArenaShell>
    );
  }

  const { talent, proofs, stats, levelProgress, recommendations = [] } =
    selectedTalentProfile;
  const fullName = `${talent.firstName} ${talent.lastName}`.trim();
  const avatarSrc = talent.avatarUrl || talent.avatar || undefined;
  const coverSrc = talent.coverUrl || null;
  const isOwnProfile = user?.id === talent.id;
  const currentLevel = levelProgress?.currentLevel ?? talent.level ?? null;
  const ringColor = getLevelColor(currentLevel);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProofs = normalizedQuery
    ? proofs.filter(
        (p) =>
          p.caption?.toLowerCase().includes(normalizedQuery) ||
          p.title?.toLowerCase().includes(normalizedQuery) ||
          p.gig?.title?.toLowerCase().includes(normalizedQuery) ||
          p.gig?.category?.toLowerCase().includes(normalizedQuery),
      )
    : proofs;

  return (
    <ArenaShell>
      <div className="pb-12">
        {/* Cover Banner */}
        <div className="relative h-[140px] sm:h-[168px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#F3E8FF] via-[#EDE9FE] to-[#DBEAFE] border border-[#EFEFF3]">
          {coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverSrc}
              alt={`${fullName} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(126,0,238,0.16), transparent 55%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.18), transparent 50%)",
              }}
            />
          )}
        </div>

        {/* Avatar + Action Buttons */}
        <div className="relative z-10 flex items-end justify-between gap-4 px-2 sm:px-4 -mt-12 sm:-mt-14">
          <div
            style={{ borderColor: ringColor }}
            className="w-[96px] h-[96px] sm:w-[106px] sm:h-[106px] rounded-full bg-white p-[3px] border-[3px] shadow-sm shrink-0 flex items-center justify-center"
          >
            <UserAvatar
              name={fullName}
              src={avatarSrc}
              size={96}
              className="!w-full !h-full"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2 pb-1">
            <button
              type="button"
              onClick={() => setCvModalOpen(true)}
              className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-[13px] font-medium text-black transition-colors cursor-pointer"
            >
              View CV
            </button>

            {isOwnProfile ? (
              <Link
                href="/dashboard/profile"
                className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-[13px] font-medium text-black transition-colors inline-flex items-center"
              >
                Manage Profile
              </Link>
            ) : (
              <button
                type="button"
                disabled={
                  connectionState === "sending" ||
                  connectionState === "pending" ||
                  connectionState === "connected"
                }
                onClick={handleConnect}
                className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                  connectionState === "connected" ||
                  connectionState === "pending"
                    ? "border border-[#E5E7EB] bg-[#F5F5F7] text-[#52525B]"
                    : "bg-[#7E00EE] hover:bg-[#6A00CC] text-white cursor-pointer"
                }`}
              >
                {connectionState === "sending" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : connectionState === "connected" ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Connected
                  </>
                ) : connectionState === "pending" ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Pending
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" /> Connect
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const url = window.location.href;
                if (navigator.clipboard) navigator.clipboard.writeText(url);
                toast.success("Profile link copied!");
              }}
              className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4 text-[#747682]" />
            </button>
          </div>
        </div>

        {/* Name + Dynamic Rank Level */}
        <div className="mt-4 flex items-center flex-wrap gap-2.5">
          <h1 className="text-[22px] sm:text-[24px] font-bold text-black tracking-[-0.02em]">
            {fullName}
          </h1>
          {currentLevel && <LevelPill level={currentLevel} />}
          {talent.location && (
            <span className="inline-flex items-center gap-1 text-[12.5px] text-[#747682] ml-1">
              <MapPin className="w-3.5 h-3.5" />
              {talent.location}
            </span>
          )}
        </div>

        {/* Soft Blue Bio Card */}
        <div className="mt-3.5 rounded-2xl bg-[#EFF6FF] px-5 py-4">
          <p className="text-[13.5px] leading-[1.6] text-[#4B5563]">
            {talent.bio || "Sharing verified proof of work on Arena."}
          </p>
        </div>

        {/* 3 Pastel Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          <div className="rounded-2xl bg-[#FEF9C3] px-5 py-4">
            <p className="text-[24px] font-bold text-black tracking-[-0.02em]">
              {stats?.totalProofs ?? proofs.length}
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#52525B]">
              Proofs Shared
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRecommendationsOpen(true)}
            className="group relative rounded-2xl bg-[#F5E1FF] hover:bg-[#EED2FE] transition-colors px-5 py-4 text-left cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#52525B] group-hover:text-black group-hover:translate-x-0.5 transition-all absolute top-4 right-4" />
            <p className="text-[24px] font-bold text-black tracking-[-0.02em]">
              {stats?.recommendationsCount ?? recommendations.length}
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#52525B]">
              Recommendations
            </p>
          </button>

          <div className="rounded-2xl bg-[#C8FAD6] px-5 py-4">
            <p className="text-[24px] font-bold text-black tracking-[-0.02em]">
              {stats?.totalSalutes ?? 0}
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#52525B]">
              Salutes Received
            </p>
          </div>
        </div>

        {/* Proofs List */}
        <section className="mt-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFEFF3]">
            <h2 className="text-[18px] font-bold text-black tracking-[-0.01em]">
              Proofs
            </h2>
            <div className="relative w-full sm:w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#747682] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Arena"
                className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-[#E6E6EC] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] transition-colors"
              />
            </div>
          </div>

          {filteredProofs.length > 0 ? (
            <div>
              {filteredProofs.map((item, idx) => (
                <ArenaFeedPost
                  key={item.id}
                  proof={{
                    ...item,
                    talent: item.talent ?? {
                      id: talent.id,
                      firstName: talent.firstName,
                      lastName: talent.lastName,
                      username: talent.username,
                      avatarUrl: avatarSrc,
                      location: talent.location,
                      level: currentLevel ?? undefined,
                    },
                  }}
                  index={idx}
                  onLike={(id) => requireAuth(() => toggleLike(id))}
                  onView={recordView}
                  onBookmark={(id) => requireAuth(() => toggleBookmark(id))}
                  onShare={(p) => setSelectedProof(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-[13px] text-[#747682]">
              {searchQuery.trim()
                ? "No matching proofs found."
                : "No proofs shared yet."}
            </div>
          )}
        </section>
      </div>

      <RecommendationsModal
        isOpen={recommendationsOpen}
        onClose={() => setRecommendationsOpen(false)}
        recommendations={recommendations}
      />

      <CvModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        talent={talent}
        canEdit={false}
      />

      <ShareProofModal
        isOpen={Boolean(selectedProof)}
        onClose={() => setSelectedProof(null)}
        proof={selectedProof}
      />
    </ArenaShell>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <ArenaShell>
          <div className="py-20 text-center text-[14px] text-[#747682]">
            Loading profile...
          </div>
        </ArenaShell>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
