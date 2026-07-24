"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  Clock,
  Edit,
  Share,
  Download,
  Edit2,
  ImageIcon,
  Mail,
  Phone,
  Globe,
  Award,
  Sparkles,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentProfile } from "@/services/talentService";
import { proofService, Proof } from "@/services/proofService";
import { userService } from "@/services/userService";
import PIProgressBar from "@/components/pi/PIProgressBar";
import UserAvatar from "@/components/UserAvatar";
import SkillBadgePill from "@/components/SkillBadgePill";
import { usePiStore } from "@/store/usePiStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BadgeApplication } from "@/services/badgeService";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateUser } = useUserStore();
  const { piStatus, fetchPiStatus } = usePiStore();

  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [featuredProofs, setFeaturedProofs] = useState<Proof[]>([]);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!user?.username) return;
    setLoadingProfile(true);
    try {
      const [profileRes, proofsRes] = await Promise.all([
        talentService.getTalentByUsername(user.username),
        proofService.getMyProofs({ limit: 4 }),
      ]);
      setProfileData(profileRes);
      setFeaturedProofs(proofsRes.data ?? []);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchPiStatus();
    loadProfileData();
  }, [fetchPiStatus, loadProfileData]);

  const stats = profileData?.stats;
  const talent = profileData?.talent || user;

  const joinDate = talent?.createdAt
    ? new Date(talent.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Share profile link helper
  const handleShareProfile = () => {
    const username = talent?.username || user?.username;
    if (!username) return;
    const shareUrl = `${window.location.origin}/profile?username=${username}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Profile Link Copied!",
        description: "Your public profile link has been copied to clipboard.",
      });
    } else {
      toast({
        title: "Public Profile Link",
        description: shareUrl,
      });
    }
  };

  // Toggle availability helper
  const handleToggleAvailability = async () => {
    if (isUpdatingAvailability) return;
    setIsUpdatingAvailability(true);
    const newStatus = !talent?.isAvailable;
    try {
      const success = await updateUser({ isAvailable: newStatus });
      if (success && profileData) {
        setProfileData({
          ...profileData,
          talent: {
            ...profileData.talent,
            isAvailable: newStatus,
          },
        });
      }
      toast({
        title: newStatus ? "Status: Available for Hire" : "Status: Busy",
        description: newStatus
          ? "Brands can now send you hire requests."
          : "You will not receive new hire requests for now.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update availability status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const approvedBadges: BadgeApplication[] =
    (profileData?.approvedSkillBadges as BadgeApplication[]) ?? [];

  const ratingBreakdown = profileData?.ratingBreakdown ?? null;
  const recentReviews = profileData?.recentReviews ?? [];
  const totalReviews =
    ratingBreakdown?.reviewCount ?? recentReviews.length ?? 0;
  const overallRating = ratingBreakdown?.avgOverall ?? talent?.rating ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 mt-4">
      {/* Header Profile Info */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-8 relative shadow-sm">
        <UserAvatar
          name={talent ? `${talent.firstName} ${talent.lastName}` : "User"}
          src={talent?.avatarUrl}
          size={112}
          className="border-[6px] border-white shadow-lg shrink-0"
        />

        <div className="flex-1 w-full">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {talent?.firstName} {talent?.lastName}
                </h1>
                {talent?.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 bg-[#E8F8F0] text-[#16A34A] px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">
                    Busy
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1.5 font-medium">
                @{talent?.username} • profile?username={talent?.username}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={() => router.push("/dashboard/settings")}
                className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl gap-2 font-bold px-6 h-11"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </Button>
              <Button
                onClick={handleShareProfile}
                variant="outline"
                className="bg-[#1A1D21] text-white hover:bg-gray-800 rounded-xl gap-2 font-bold px-6 h-11 border-0"
              >
                <Share className="w-4 h-4" /> Share Profile
              </Button>
              <Button
                onClick={() =>
                  toast({
                    title: "CV Feature",
                    description:
                      "You can manage and update your CV details in Settings.",
                  })
                }
                variant="outline"
                className="rounded-xl gap-2 font-bold px-6 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" /> Download CV
              </Button>
            </div>
          </div>

          <p className="text-gray-600 mt-5 max-w-3xl leading-relaxed text-[15px]">
            {talent?.bio ||
              "No bio added yet. Click 'Edit Profile' to introduce yourself and describe your expertise to potential clients and collaborators."}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm text-gray-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />{" "}
              {talent?.location || "Not specified"}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" /> Joined {joinDate}
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />{" "}
              {stats?.totalGigs ?? talent?.totalGigs ?? 0} Gigs Done
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />{" "}
              {overallRating > 0 ? overallRating.toFixed(1) : "New"} Rating
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" /> Responds in 24h
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Stats Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
          <h3 className="text-3xl font-black text-gray-900">
            {stats?.totalProofs ?? featuredProofs.length}
          </h3>
          <p className="text-gray-500 text-sm font-semibold mt-1">Proofs</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
          <h3 className="text-3xl font-black text-gray-900">
            {stats?.totalGigs ?? talent?.totalGigs ?? 0}
          </h3>
          <p className="text-gray-500 text-sm font-semibold mt-1">Gigs</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
          <h3 className="text-3xl font-black text-gray-900">
            {stats?.totalSalutes ?? 0}
          </h3>
          <p className="text-gray-500 text-sm font-semibold mt-1">Salutes</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
          <h3 className="text-3xl font-black text-gray-900">{totalReviews}</h3>
          <p className="text-gray-500 text-sm font-semibold mt-1">Reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-8 space-y-6">
          {/* About */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {talent?.bio ||
                "No summary provided yet. Tell potential hirers and partners about your background, tools, and project experience in Settings."}
            </p>
          </div>

          {/* Top Skills */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
            <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Top Skills</h2>
            <p className="text-sm text-gray-500 mb-6">
              Skills and capabilities attached to your profile
            </p>

            <div className="flex flex-wrap gap-3">
              {talent?.skills && talent.skills.length > 0 ? (
                talent.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2 rounded-full border border-purple-400 bg-[#F4ECFF] text-[#7300E5] text-sm font-bold"
                  >
                    {skill}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 py-2">
                  No skills listed yet. Add skills in your profile settings.
                </div>
              )}
            </div>
          </div>

          {/* Featured Proofs */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">
                Featured Proofs
              </h2>
              <Link href="/dashboard/proofs">
                <button className="px-4 py-1.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-100">
                  View All
                </button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Your recent work and proofs board
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProofs.length > 0 ? (
                featuredProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                      {proof.mediaUrl ? (
                        <Image
                          src={proof.mediaUrl}
                          alt={proof.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-semibold">
                            Media File
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white">
                      <h4 className="font-bold text-gray-900 text-[15px] mb-2.5 truncate">
                        {proof.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />{" "}
                          {proof.status || "Completed"}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                          🙌 {proof.salutesCount || 0} Salutes
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-gray-500 text-sm font-medium">
                    No proofs posted yet.
                  </p>
                  <Link href="/dashboard/proofs">
                    <Button className="mt-3 bg-[#7300E5] hover:bg-[#6000c0] text-white text-xs font-bold rounded-xl">
                      Upload Proof
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Client Reviews */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">
                Client Reviews
              </h2>
              <span className="text-2xl font-black text-[#7300E5]">
                {overallRating > 0 ? overallRating.toFixed(1) : "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              Ratings and feedback from verified hirers & collaborators
            </p>

            {recentReviews.length > 0 ? (
              <div className="space-y-6">
                {recentReviews.map((review, idx) => {
                  const revName = review.reviewer
                    ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                    : "Anonymous";
                  const score = review.overallScore ?? 5;
                  return (
                    <div
                      key={review.id || idx}
                      className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar
                          name={revName}
                          src={review.reviewer?.avatarUrl}
                          size={40}
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 text-[15px]">
                            {revName}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : "Recent"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-amber-400 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(score)
                                ? "fill-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 text-[15px] leading-relaxed mb-3">
                        {review.comment || "No comment provided."}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100 text-gray-500 text-sm">
                No client reviews received yet. Complete hire & collaboration
                requests to earn reviews.
              </div>
            )}
          </div>

          {/* Connect / Contact */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
            <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Contact & Connect
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Verified communication details for hire requests
            </p>
            <div className="flex flex-wrap gap-4">
              {talent?.email && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm bg-gray-50/50">
                  <Mail className="w-4 h-4 text-[#7300E5]" /> {talent.email}
                </div>
              )}
              {talent?.phone && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm bg-gray-50/50">
                  <Phone className="w-4 h-4 text-[#7300E5]" /> {talent.phone}
                </div>
              )}
              {talent?.location && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold text-sm bg-gray-50/50">
                  <Globe className="w-4 h-4 text-[#7300E5]" /> {talent.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Level / PI Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="inline-flex items-center gap-2 bg-[#F4ECFF] text-[#7300E5] px-4 py-1.5 rounded-full text-sm font-extrabold mb-6">
              👑 Level {piStatus?.level ?? talent?.progressIndex ?? 1}
            </div>
            <h2 className="text-[56px] leading-none font-black text-[#7300E5] mb-2">
              {piStatus?.piScore ?? talent?.piScore ?? 0}
            </h2>
            <p className="text-sm text-gray-500 font-semibold mb-8">
              Progress Index (PI)
            </p>

            <PIProgressBar
              piStatus={
                piStatus || {
                  piScore: talent?.piScore ?? 0,
                  progressIndex: talent?.progressIndex ?? 0,
                  level:
                    (talent?.progressIndex ?? 0) > 0
                      ? talent!.progressIndex!
                      : 1,
                  piToNextLevel: 0,
                  nextLevelPi: null,
                }
              }
            />
          </div>

          {/* Availability */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Availability
            </h2>

            <div className="bg-[#F4ECFF] border border-purple-100 rounded-2xl p-5 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-3 h-3 rounded-full shadow-sm ${
                    talent?.isAvailable
                      ? "bg-emerald-500 shadow-emerald-400"
                      : "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="text-[#7300E5] font-extrabold text-[15px]">
                    {talent?.isAvailable
                      ? "Available for Hire"
                      : "Currently Unavailable"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium">
                    {talent?.isAvailable
                      ? "Brands can send you hire requests"
                      : "Turn on when ready for work"}
                  </p>
                </div>
              </div>
              {/* Interactive Toggle */}
              <button
                onClick={handleToggleAvailability}
                disabled={isUpdatingAvailability}
                className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                  talent?.isAvailable ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    talent?.isAvailable ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleShareProfile}
                className="w-full h-12 bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl font-bold shadow-sm"
              >
                🔗 Share Public Profile
              </Button>
            </div>
          </div>

          {/* Skill Badges */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Skill Badges</h2>
              <Link href="/dashboard/badges">
                <button className="px-4 py-1.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-100">
                  Manage Badges
                </button>
              </Link>
            </div>

            {approvedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
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
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Award className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-gray-500 font-medium mb-3">
                  No verified skill badges yet.
                </p>
                <Link href="/dashboard/badges">
                  <Button className="bg-[#7300E5] hover:bg-[#6000c0] text-white text-xs font-bold rounded-xl h-9 px-4">
                    Explore & Apply
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* This Month Activity */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              This Month Activity
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#7300E5]" /> Gigs
                  Completed
                </div>
                <span className="font-black text-gray-900 text-lg">
                  {stats?.totalCompletedJobRequests ?? stats?.totalGigs ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                  <ImageIcon className="w-4.5 h-4.5 text-[#7300E5]" /> Proofs
                  Shared
                </div>
                <span className="font-black text-gray-900 text-lg">
                  {stats?.totalProofs ?? featuredProofs.length}
                </span>
              </div>
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                  <span className="text-[#7300E5] text-lg">🙌</span> Salutes
                  Received
                </div>
                <span className="font-black text-gray-900 text-lg">
                  {stats?.totalSalutes ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[15px] font-bold text-[#7300E5]">
                  <Sparkles className="w-4 h-4 text-[#7300E5]" /> PI Score
                </div>
                <span className="font-black text-[#7300E5] text-lg">
                  {piStatus?.piScore ?? talent?.piScore ?? 0} PI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
