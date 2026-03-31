"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Clock, AlertCircle, Award, Share2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import { useUserStore } from "@/store/useUserStore";
import { proofService, Proof } from "@/services/proofService";
import { talentService, TalentStats } from "@/services/talentService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePiStore } from "@/store/usePiStore";
import PIProgressBar from "@/components/pi/PIProgressBar";
import LevelUpModal from "@/components/pi/LevelUpModal";
import ProofDetailModal from "@/components/modals/ProofDetailModal";

export default function DashboardHome() {
  const { user, fetchUser } = useUserStore();
  const { fetchPiStatus } = usePiStore();

  const [proofs, setProofs] = useState<Proof[]>([]);
  const [stats, setStats] = useState<TalentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  useEffect(() => {
    fetchUser();
    fetchPiStatus();
  }, [fetchUser, fetchPiStatus]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [proofsRes] = await Promise.all([
          proofService.getMyProofs({ limit: 6 }),
        ]);
        setProofs(proofsRes?.data || []);
      } catch {
        // errors are handled by the apiClient toasts
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch talent stats once we have a username
  useEffect(() => {
    if (!user?.username) return;

    talentService
      .getTalentByUsername(user.username)
      .then((profile) => {
        setStats(profile.stats);
      })
      .catch(() => {
        // errors shown via toast
      });
  }, [user]);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : "there";

  const handleShareProfile = () => {
    if (!user?.username) {
      toast({
        title: "Username missing",
        description: "Please set your username in settings first.",
        variant: "destructive",
      });
      return;
    }

    const url = `${window.location.origin}/profile?username=${user.username}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Your profile link is ready to share.",
    });
  };

  const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG")}`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {displayName}! Here&apos;s what&apos;s happening.
          </p>
        </div>
        <Button
          onClick={handleShareProfile}
          className="rounded-xl bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-bold px-6 shadow-sm flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Profile
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={stats ? formatCurrency(0) : "—"}
          icon={Wallet}
        />
        <StatCard
          title="Pending Requests"
          value={stats ? String(stats.totalGigs ?? 0) : "—"}
          icon={Clock}
        />
        <StatCard
          title="Completed Jobs"
          value={stats ? String(stats.totalGigs ?? 0) : "—"}
          icon={Award}
        />
        <StatCard
          title="Total Proofs"
          value={stats ? String(stats.totalProofs ?? 0) : "—"}
          icon={AlertCircle}
        />
      </div>

      {/* Progress Index Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-sm">
        <PIProgressBar />
      </div>

      {/* Recent Posts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Recent Proofs</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeedSkeleton key={i} />
            ))}
          </div>
        ) : !proofs || proofs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">No proofs yet.</p>
            <p className="text-sm">Start sharing your work to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(proofs || []).map((proof) => (
              <FeedCard
                key={proof.id}
                avatar={proof.talent?.avatarUrl || "/placeholder-avatar.png"}
                name={
                  proof.talent
                    ? `${proof.talent.firstName} ${proof.talent.lastName}`
                    : displayName
                }
                location={proof.talent?.location || "—"}
                timeAgo={
                  proof.createdAt
                    ? new Date(proof.createdAt).toLocaleDateString()
                    : ""
                }
                badge={
                  (proof.category as
                    | "Win"
                    | "Hustle"
                    | "Unicorn"
                    | "Learning") || "Win"
                }
                image={proof.mediaUrl}
                tags={proof.tags}
                title={proof.title}
                description={proof.caption}
                salutes={proof.salutesCount ?? 0}
                onShare={() => setSelectedProof(proof)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Level-up modal - driven by usePiStore */}
      <LevelUpModal />

      <ProofDetailModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        proof={
          selectedProof
            ? {
                image: selectedProof.mediaUrl,
                rank: 1,
                name: selectedProof.talent
                  ? `${selectedProof.talent.firstName} ${selectedProof.talent.lastName}`
                  : displayName,
                avatar:
                  selectedProof.talent?.avatarUrl ||
                  user?.avatarUrl ||
                  "/placeholder-avatar.png",
                proofboardLink: selectedProof.talent?.username
                  ? `arena.com/${selectedProof.talent.username}`
                  : user?.username
                  ? `arena.com/${user.username}`
                  : "arena.com",
                id: selectedProof.id,
              }
            : null
        }
      />
    </div>
  );
}
