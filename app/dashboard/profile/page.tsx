"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import ArenaShell from "@/components/arena/ArenaShell";
import ProfileRightSidebar from "@/components/arena/ProfileRightSidebar";
import ArenaFeedPost from "@/components/arena/ArenaFeedPost";
import UserAvatar from "@/components/UserAvatar";
import { LevelPill, getLevelColor } from "@/components/arena/LevelBadge";
import RecommendationsModal from "@/components/modals/RecommendationsModal";
import CvModal from "@/components/modals/CvModal";
import EditProfileModal from "@/components/modals/EditProfileModal";
import EditProofModal from "@/components/modals/EditProofModal";
import ShareProofModal from "@/components/modals/ShareProofModal";
import { talentService, TalentProfile } from "@/services/talentService";
import { Proof } from "@/services/proofService";
import { useUserStore } from "@/store/useUserStore";
import { useProofStore } from "@/store/useProofStore";
import { toast } from "sonner";

export default function MyProfilePage() {
  const { user, fetchUser } = useUserStore();
  const { toggleLike, toggleBookmark, deleteProof } = useProofStore();

  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingProofs, setSearchingProofs] = useState(false);
  const [requestsCount, setRequestsCount] = useState<number | undefined>(
    undefined,
  );

  // Modals
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingProof, setEditingProof] = useState<Proof | null>(null);
  const [deletingProof, setDeletingProof] = useState<Proof | null>(null);
  const [isDeletingProof, setIsDeletingProof] = useState(false);
  const [shareProof, setShareProof] = useState<Proof | null>(null);

  const loadProfile = useCallback(
    async (search?: string, showMainLoader = false) => {
      if (showMainLoader) setLoading(true);
      else if (search !== undefined) setSearchingProofs(true);

      try {
        const data = await talentService.getMyProfile(search);
        setProfileData(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load profile";
        toast.error(message);
      } finally {
        setLoading(false);
        setSearchingProofs(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadProfile(undefined, true);
  }, [loadProfile]);

  // Debounced proof search in "My Proofs"
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile(searchQuery.trim() || undefined, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadProfile]);

  const handleToggleLike = async (proofId: string) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        proofs: prev.proofs.map((p) => {
          if (p.id !== proofId) return p;
          const nextLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked: nextLiked,
            likesCount: Math.max(0, (p.likesCount || 0) + (nextLiked ? 1 : -1)),
          };
        }),
      };
    });
    await toggleLike(proofId);
  };

  const handleToggleBookmark = async (proofId: string) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        proofs: prev.proofs.map((p) =>
          p.id === proofId ? { ...p, isBookmarked: !p.isBookmarked } : p,
        ),
      };
    });
    await toggleBookmark(proofId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProof) return;
    setIsDeletingProof(true);
    const targetId = deletingProof.id;
    const ok = await deleteProof(targetId);
    setIsDeletingProof(false);

    if (ok) {
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalProofs: Math.max(0, (prev.stats.totalProofs || 1) - 1),
          },
          proofs: prev.proofs.filter((p) => p.id !== targetId),
        };
      });
      setDeletingProof(null);
    }
  };

  const talent = profileData?.talent;
  const stats = profileData?.stats;
  const recommendations = profileData?.recommendations ?? [];
  const activeLevel =
    profileData?.levelProgress?.currentLevel ?? talent?.level ?? null;
  const ringColor = getLevelColor(activeLevel);

  const fullName = talent
    ? `${talent.firstName || ""} ${talent.lastName || ""}`.trim() ||
      "Arena Talent"
    : user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Arena Talent";

  const avatarSrc = talent?.avatarUrl ?? user?.avatarUrl ?? undefined;
  const coverSrc = talent?.coverUrl ?? user?.coverUrl ?? null;

  const proofs = (profileData?.proofs ?? []).map((proof) => ({
    ...proof,
    talent: proof.talent ??
      (talent
        ? {
            id: talent.id,
            firstName: talent.firstName,
            lastName: talent.lastName,
            username: talent.username,
            location: talent.location,
            avatarUrl: talent.avatarUrl,
            level: activeLevel ?? undefined,
          }
        : undefined),
  }));

  return (
    <ArenaShell
      profileBadgeCount={requestsCount}
      customRightSidebar={
        <ProfileRightSidebar
          onRequestsCountChange={setRequestsCount}
          onConnectionAccepted={() => loadProfile(searchQuery.trim() || undefined)}
        />
      }
    >
      {loading && !profileData ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-[156px] w-full rounded-2xl bg-gray-100" />
          <div className="flex items-end justify-between -mt-12 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white" />
            <div className="flex gap-2">
              <div className="h-9 w-24 rounded-xl bg-gray-100" />
              <div className="h-9 w-28 rounded-xl bg-gray-100" />
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
      ) : (
        <div>
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

          {/* Avatar + View CV & Edit Profile Row */}
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

            <div className="flex items-center gap-2 pb-1">
              <button
                type="button"
                onClick={() => setCvModalOpen(true)}
                className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-[13px] font-medium text-black transition-colors cursor-pointer"
              >
                View CV
              </button>
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="h-9 px-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-[13px] font-medium text-black transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Name + Dynamic Rank Badge */}
          <div className="mt-4 flex items-center flex-wrap gap-2.5">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-black tracking-[-0.02em]">
              {fullName}
            </h1>
            {activeLevel && <LevelPill level={activeLevel} />}
          </div>

          {/* Soft Blue Bio Card */}
          <div className="mt-3.5 rounded-2xl bg-[#EFF6FF] px-5 py-4">
            {talent?.bio ? (
              <p className="text-[13.5px] leading-[1.6] text-[#4B5563]">
                {talent.bio}
              </p>
            ) : (
              <p className="text-[13.5px] leading-[1.6] text-[#747682]">
                Tell brands and fellow Arena talents about your work and focus.{" "}
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(true)}
                  className="text-[#7E00EE] font-medium hover:underline cursor-pointer"
                >
                  Add bio
                </button>
              </p>
            )}
          </div>

          {/* 3 Pastel Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
            {/* Proofs Shared */}
            <div className="rounded-2xl bg-[#FEF9C3] px-5 py-4">
              <p className="text-[24px] font-bold text-black tracking-[-0.02em]">
                {stats?.totalProofs ?? proofs.length}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#52525B]">
                Proofs Shared
              </p>
            </div>

            {/* Recommendations (Clickable -> RecommendationsModal) */}
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

            {/* Salutes Received */}
            <div className="rounded-2xl bg-[#C8FAD6] px-5 py-4">
              <p className="text-[24px] font-bold text-black tracking-[-0.02em]">
                {stats?.totalSalutes ?? 0}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#52525B]">
                Salutes Received
              </p>
            </div>
          </div>

          {/* My Proofs Section */}
          <section className="mt-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFEFF3]">
              <h2 className="text-[18px] font-bold text-black tracking-[-0.01em]">
                My Proofs
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
                {searchingProofs && (
                  <Loader2 className="w-3.5 h-3.5 text-[#7E00EE] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {proofs.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#7E00EE] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-[15px] font-semibold text-black">
                  {searchQuery.trim()
                    ? "No matching proofs found"
                    : "You haven't shared any proofs yet"}
                </p>
                <p className="text-[13px] text-[#747682] mt-1 max-w-sm mx-auto">
                  {searchQuery.trim()
                    ? "Try a different keyword or clear the search input."
                    : "Post proof of your completed GU2K gigs on the Feed to grow your Arena rank."}
                </p>
                {!searchQuery.trim() && (
                  <Link
                    href="/?compose=1"
                    className="mt-4 inline-flex items-center justify-center h-9 px-4 rounded-xl bg-[#7E00EE] hover:bg-[#6A00CC] text-white text-[13px] font-medium transition-colors"
                  >
                    Share Proof
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {proofs.map((proof, idx) => (
                  <ArenaFeedPost
                    key={proof.id}
                    proof={proof}
                    index={idx}
                    canManage={true}
                    onLike={handleToggleLike}
                    onBookmark={handleToggleBookmark}
                    onShare={(p) => setShareProof(p)}
                    onEdit={(p) => setEditingProof(p)}
                    onDelete={(p) => setDeletingProof(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Recommendations Modal */}
      <RecommendationsModal
        isOpen={recommendationsOpen}
        onClose={() => setRecommendationsOpen(false)}
        recommendations={recommendations}
      />

      {/* CV Modal */}
      <CvModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        talent={talent ?? user ?? null}
        canEdit={true}
        onUpdated={() => {
          fetchUser();
          loadProfile(searchQuery.trim() || undefined);
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        onSaved={() => {
          fetchUser();
          loadProfile(searchQuery.trim() || undefined);
        }}
      />

      {/* Edit Proof Modal (only within 10 mins) */}
      <EditProofModal
        isOpen={!!editingProof}
        onClose={() => setEditingProof(null)}
        proof={editingProof}
        onUpdated={(updated) => {
          setProfileData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              proofs: prev.proofs.map((p) =>
                p.id === updated.id ? { ...p, ...updated } : p,
              ),
            };
          });
        }}
      />

      {/* Delete Proof Confirmation Modal */}
      {deletingProof && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isDeletingProof && setDeletingProof(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-[400px] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-[18px] font-bold text-black">Delete Proof?</h3>
            <p className="text-[13.5px] text-[#747682] mt-1.5 leading-relaxed">
              This will permanently remove this proof from your Arena profile and
              the public feed. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingProof}
                onClick={() => setDeletingProof(null)}
                className="h-10 px-4 rounded-xl border border-[#E5E7EB] text-[13px] font-medium text-black hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProof}
                onClick={handleConfirmDelete}
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingProof && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Delete Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Proof Modal */}
      <ShareProofModal
        isOpen={!!shareProof}
        onClose={() => setShareProof(null)}
        proof={shareProof}
      />
    </ArenaShell>
  );
}
