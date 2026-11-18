"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProofDetailModal from "@/components/admin/ProofDetailModal";
import ActionFeedbackModal, {
  AdminFeedbackType,
} from "@/components/admin/ActionFeedbackModal";
import {
  AdminProof,
  AdminTalentDetailResponse,
  ConnectionRequestStatus,
  adminService,
} from "@/services/adminService";
import { useAdminStore } from "@/store/useAdminStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  ExternalLink,
  Eye,
  FileText,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Play,
  ShieldCheck,
  ShieldX,
  Star,
  ThumbsUp,
  Trash2,
  UserPlus,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

type DetailTab = "proofs" | "connections" | "activities";
type ConnFilter =
  | "ALL"
  | "ACCEPTED"
  | "PENDING"
  | "DECLINED"
  | "SENT"
  | "RECEIVED";

function getConnectionStatusBadge(status: ConnectionRequestStatus) {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-100 text-green-700 border-green-200";
    case "DECLINED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

function getProofStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200";
    case "FLAGGED":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

export default function AdminTalentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id;

  const { verifyTalent, unverifyTalent, deleteTalent, toggleFeatureProof, deleteProof } =
    useAdminStore();

  const [detail, setDetail] = useState<AdminTalentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("proofs");
  const [connFilter, setConnFilter] = useState<ConnFilter>("ALL");

  const [selectedProof, setSelectedProof] = useState<AdminProof | null>(null);
  const [deleteProofTarget, setDeleteProofTarget] = useState<AdminProof | null>(
    null,
  );
  const [isDeletingProof, setIsDeletingProof] = useState(false);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [togglingVerify, setTogglingVerify] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    type: AdminFeedbackType;
    message: string;
    subMessage: string;
  }>({
    isOpen: false,
    type: "approved",
    message: "",
    subMessage: "",
  });

  const loadDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTalentDetail(userId);
      setDetail(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user details",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleToggleVerify = async () => {
    if (!detail) return;
    setTogglingVerify(true);
    try {
      if (detail.user.verificationStatus === "VERIFIED") {
        await unverifyTalent(detail.user.id);
        toast.success("User moved back to pending verification");
      } else {
        await verifyTalent(detail.user.id);
        toast.success("User marked as verified");
      }
      await loadDetail();
    } finally {
      setTogglingVerify(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!detail) return;
    setDeletingUser(true);
    try {
      await deleteTalent(detail.user.id);
      toast.success("User account deleted");
      router.push("/admin/talents");
    } finally {
      setDeletingUser(false);
      setConfirmDeleteUser(false);
    }
  };

  const handleProofActionComplete = (
    type: AdminFeedbackType,
    proof: AdminProof,
  ) => {
    const label = proof.title || "Post";
    let message = "Updated";
    if (type === "featured") message = "Set as Proof of the Week";
    else if (type === "unfeatured") message = "Removed from Proof of the Week";
    else if (type === "approved") message = "Post Approved";
    else if (type === "rejected") message = "Post Rejected";
    else if (type === "flagged") message = "Post Flagged";
    else if (type === "deleted") message = "Post Deleted";
    else if (type === "verified") message = "Visibility Updated";

    setFeedbackState({
      isOpen: true,
      type,
      message,
      subMessage: `${label} was updated successfully.`,
    });
    setSelectedProof(null);
    loadDetail();
  };

  const handleConfirmDeleteProof = async () => {
    if (!deleteProofTarget) return;
    setIsDeletingProof(true);
    await deleteProof(deleteProofTarget.id);
    setIsDeletingProof(false);
    const removed = deleteProofTarget;
    setDeleteProofTarget(null);
    handleProofActionComplete("deleted", removed);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#7300E5]" />
        <span className="text-sm">Loading user profile...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-sm text-red-600 font-medium">
          {error || "User not found."}
        </p>
        <Link href="/admin/talents">
          <Button variant="outline" className="gap-2 rounded-full">
            <ArrowLeft className="h-4 w-4" />
            Back to Users &amp; Connections
          </Button>
        </Link>
      </div>
    );
  }

  const { user, stats, proofs, connections, userGigs, activities } = detail;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const filteredConnections = connections.data.filter((conn) => {
    if (connFilter === "ALL") return true;
    if (connFilter === "SENT") return conn.requesterId === user.id;
    if (connFilter === "RECEIVED") return conn.recipientId === user.id;
    return conn.status === connFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/admin/talents"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users &amp; Connections
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {user.username && (
            <Link
              href={`/profile?username=${encodeURIComponent(user.username)}`}
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Public Profile
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={togglingVerify}
            onClick={handleToggleVerify}
            className={cn(
              "rounded-full gap-1.5 text-xs",
              user.verificationStatus === "VERIFIED"
                ? "border-yellow-300 text-yellow-800 hover:bg-yellow-50"
                : "border-green-300 text-green-700 hover:bg-green-50",
            )}
          >
            {user.verificationStatus === "VERIFIED" ? (
              <>
                <ShieldX className="h-3.5 w-3.5" />
                Unverify User
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify User
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDeleteUser(true)}
            className="rounded-full gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete User
          </Button>
        </div>
      </div>

      {/* User Identity Card */}
      <Card className="overflow-hidden border-gray-200 shadow-2xs">
        {user.coverUrl && (
          <div className="h-32 sm:h-40 w-full bg-purple-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.coverUrl}
              alt={`${fullName} cover`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0">
              <UserAvatar name={fullName} src={user.avatarUrl} size={68} />
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {fullName}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-xs",
                      user.verificationStatus === "VERIFIED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200",
                    )}
                  >
                    {user.verificationStatus === "VERIFIED" && (
                      <BadgeCheck className="h-3.5 w-3.5 mr-1 inline" />
                    )}
                    {user.verificationStatus.charAt(0) +
                      user.verificationStatus.slice(1).toLowerCase()}
                  </Badge>
                  {user.gu2kId && (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-purple-100 text-[#7300E5] text-xs"
                    >
                      GU2K Verified Account
                    </Badge>
                  )}
                  {user.levelProgress?.currentLevel && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-semibold"
                    >
                      Rank: {user.levelProgress.currentLevel.name}
                    </Badge>
                  )}
                </div>

                {user.username && (
                  <p className="text-sm text-gray-500">@{user.username}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {user.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-sm text-gray-700 leading-relaxed max-w-2xl pt-1">
                    {user.bio}
                  </p>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 text-xs font-normal"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {user.cvUrl && (
              <a
                href={user.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Uploaded CV
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total Posts",
            value: stats.totalProofs,
            sub: `${stats.approvedProofs} approved`,
          },
          {
            label: "Proofs of the Week",
            value: stats.featuredProofs,
            sub: "Admin featured",
          },
          {
            label: "Engagement",
            value: stats.totalLikesReceived + stats.totalSalutesReceived,
            sub: `${stats.totalLikesReceived} likes • ${stats.totalViewsReceived} views`,
          },
          {
            label: "Connected",
            value: stats.acceptedConnections,
            sub: `${stats.followersCount} followers`,
          },
          {
            label: "Connection Requests",
            value: stats.totalConnectionRequests,
            sub: `${stats.pendingConnectionsSent} sent • ${stats.pendingConnectionsReceived} recv pending`,
          },
          {
            label: "GU2K Gigs",
            value: stats.completedGigsCount,
            sub: `${stats.recommendationsCount} recommendations`,
          },
        ].map((metric) => (
          <Card key={metric.label} className="border-gray-200 shadow-2xs">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metric.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {metric.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {[
          {
            key: "proofs" as DetailTab,
            label: `Posts & Proofs (${proofs.length})`,
            icon: FileText,
          },
          {
            key: "connections" as DetailTab,
            label: `Connections & Requests (${connections.summary.total})`,
            icon: Link2,
          },
          {
            key: "activities" as DetailTab,
            label: `Activities & Gigs (${activities.length})`,
            icon: Activity,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer",
                active
                  ? "bg-[#7300E5] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Posts & Proofs */}
      {activeTab === "proofs" && (
        <div className="space-y-3">
          {proofs.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-12 text-center text-sm text-gray-500">
                This user hasn&apos;t posted any proofs yet.
              </CardContent>
            </Card>
          ) : (
            proofs.map((proof) => {
              const firstUrl =
                proof.mediaItems?.[0]?.url ||
                proof.mediaUrls?.[0] ||
                proof.mediaUrl;
              const isFirstVideo =
                proof.mediaItems?.[0]?.type === "video" ||
                Boolean(
                  firstUrl && /\.(mp4|mov|webm|m4v)(\?|$)/i.test(firstUrl),
                );
              const mediaCount =
                proof.mediaItems?.length ||
                proof.mediaUrls?.length ||
                (proof.mediaUrl ? 1 : 0);
              const isGu2k = Boolean(
                proof.gig?.gu2kGigId &&
                  !proof.gig.gu2kGigId.startsWith("custom_"),
              );

              return (
                <Card
                  key={proof.id}
                  className="border-gray-200 shadow-2xs overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Preview Thumb */}
                        {firstUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedProof(proof)}
                            className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-gray-200 cursor-pointer group"
                          >
                            {isFirstVideo ? (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <Play className="w-6 h-6 fill-white" />
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={firstUrl}
                                alt={proof.title || "Proof media"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            {mediaCount > 1 && (
                              <span className="absolute bottom-1 right-1 rounded bg-black/75 text-white text-[10px] px-1.5 py-0.5 font-semibold">
                                +{mediaCount - 1}
                              </span>
                            )}
                          </button>
                        )}

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900 truncate">
                              {proof.gig?.title ||
                                proof.title ||
                                "Untitled Post"}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[11px]",
                                isGu2k
                                  ? "bg-purple-100 text-[#7300E5]"
                                  : "bg-gray-100 text-gray-600",
                              )}
                            >
                              {isGu2k ? "Verified GU2K Gig" : "Self-reported"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px]",
                                getProofStatusBadge(proof.status),
                              )}
                            >
                              {proof.status.charAt(0) +
                                proof.status.slice(1).toLowerCase()}
                            </Badge>
                            {proof.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-[11px]">
                                <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                Proof of the Week
                              </Badge>
                            )}
                          </div>

                          {proof.caption && (
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                              {proof.caption}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {proof.likesCount} likes
                            </span>
                            <span>• {proof.salutesCount} salutes</span>
                            <span>• {proof.viewsCount ?? 0} views</span>
                            <span>
                              •{" "}
                              {proof.createdAt
                                ? new Date(proof.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "Recent"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleFeatureProof(
                              proof.id,
                              !proof.isFeatured,
                            ).then(() =>
                              handleProofActionComplete(
                                !proof.isFeatured ? "featured" : "unfeatured",
                                proof,
                              ),
                            )
                          }
                          className={cn(
                            "rounded-full h-8 text-xs font-semibold gap-1.5",
                            proof.isFeatured
                              ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                              : "border-gray-200 text-gray-700",
                          )}
                        >
                          <Star
                            className={cn(
                              "w-3.5 h-3.5",
                              proof.isFeatured &&
                                "fill-yellow-500 text-yellow-500",
                            )}
                          />
                          {proof.isFeatured
                            ? "Remove Proof of the Week"
                            : "Make Proof of the Week"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProof(proof)}
                          className="rounded-full h-8 text-xs font-semibold gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Connections & Requests */}
      {activeTab === "connections" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "ALL", label: `All (${connections.summary.total})` },
                {
                  key: "ACCEPTED",
                  label: `Accepted (${connections.summary.accepted})`,
                },
                {
                  key: "PENDING",
                  label: `Pending (${connections.summary.pending})`,
                },
                {
                  key: "DECLINED",
                  label: `Declined (${connections.summary.declined})`,
                },
                { key: "SENT", label: `Sent (${connections.summary.sent})` },
                {
                  key: "RECEIVED",
                  label: `Received (${connections.summary.received})`,
                },
              ] as { key: ConnFilter; label: string }[]
            ).map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setConnFilter(pill.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                  connFilter === pill.key
                    ? "bg-[#7300E5] text-white border-[#7300E5]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <Card className="border-gray-200 shadow-2xs">
            <CardContent className="p-0">
              {filteredConnections.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  No connection requests match this filter.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConnections.map((req) => {
                    const isSent = req.requesterId === user.id;
                    const peer = isSent ? req.recipient : req.requester;
                    const peerName = `${peer.firstName} ${peer.lastName}`.trim();

                    return (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <Link
                          href={`/admin/talents/${peer.id}`}
                          className="flex items-center gap-3 min-w-0 group"
                        >
                          <UserAvatar
                            name={peerName}
                            src={peer.avatarUrl}
                            size={38}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#7300E5]">
                              {peerName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {peer.username ? `@${peer.username}` : peer.email}
                              {peer.location ? ` • ${peer.location}` : ""}
                            </p>
                          </div>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                              isSent
                                ? "bg-purple-50 text-[#7300E5]"
                                : "bg-blue-50 text-blue-700",
                            )}
                          >
                            {isSent ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3" />
                            )}
                            {isSent ? "Sent" : "Received"}
                          </span>

                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                              getConnectionStatusBadge(req.status),
                            )}
                          >
                            {req.status.charAt(0) +
                              req.status.slice(1).toLowerCase()}
                          </Badge>

                          <span className="text-xs text-gray-400">
                            {new Date(req.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Activities & Gigs */}
      {activeTab === "activities" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Timeline */}
          <Card className="lg:col-span-7 border-gray-200 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No recorded activities yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((item) => {
                    const icon =
                      item.type === "PROOF_POSTED" ? (
                        <FileText className="h-4 w-4 text-[#7300E5]" />
                      ) : item.type === "CONNECTION" ? (
                        <UserPlus className="h-4 w-4 text-emerald-600" />
                      ) : item.type === "ENGAGEMENT" ? (
                        <ThumbsUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <BadgeCheck className="h-4 w-4 text-purple-600" />
                      );

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.title}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {new Date(item.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Synced / Linked Gigs */}
          <Card className="lg:col-span-5 border-gray-200 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#7300E5]" />
                Linked &amp; Completed Gigs ({userGigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userGigs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No synced GU2K gigs or linked gigs yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {userGigs.map((ug) => {
                    const isCustom = ug.gig.gu2kGigId.startsWith("custom_");
                    return (
                      <div
                        key={ug.id}
                        className="rounded-xl border border-gray-100 p-3 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {ug.gig.title}
                          </p>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] shrink-0",
                              isCustom
                                ? "bg-gray-100 text-gray-600"
                                : "bg-purple-100 text-[#7300E5]",
                            )}
                          >
                            {isCustom ? "Self-reported" : ug.source}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {[
                            ug.gig.companyName,
                            ug.gig.location,
                            ug.gig.category,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "Arena Gig"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Post Inspection Modal */}
      {selectedProof && (
        <ProofDetailModal
          key={selectedProof.id}
          isOpen={!!selectedProof}
          onClose={() => setSelectedProof(null)}
          proof={selectedProof}
          onActionComplete={handleProofActionComplete}
          onRequestDelete={(p) => {
            setSelectedProof(null);
            setDeleteProofTarget(p);
          }}
        />
      )}

      {/* Confirm Delete Proof */}
      <Dialog
        open={!!deleteProofTarget}
        onOpenChange={(open) => !open && setDeleteProofTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this post? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteProofTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteProof}
              disabled={isDeletingProof}
            >
              {isDeletingProof ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete User */}
      <Dialog open={confirmDeleteUser} onOpenChange={setConfirmDeleteUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900">{fullName}</span>
              {"'s"} account and all of their posts? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteUser(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deletingUser}
            >
              {deletingUser ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {feedbackState.isOpen && (
        <ActionFeedbackModal
          isOpen={feedbackState.isOpen}
          onClose={() =>
            setFeedbackState((prev) => ({ ...prev, isOpen: false }))
          }
          type={feedbackState.type}
          message={feedbackState.message}
          subMessage={feedbackState.subMessage}
        />
      )}
    </div>
  );
}
