"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { AdminProof } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Check,
  X,
  ShieldAlert,
  Star,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  BadgeCheck,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProofDetailModal from "@/components/admin/ProofDetailModal";
import ActionFeedbackModal, {
  AdminFeedbackType,
} from "@/components/admin/ActionFeedbackModal";

type FilterTab =
  | "ALL"
  | "FEATURED"
  | "PENDING"
  | "APPROVED"
  | "FLAGGED"
  | "REJECTED";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All Posts" },
  { key: "FEATURED", label: "Proof of the Week" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "REJECTED", label: "Rejected" },
];

function ProofModerationContent() {
  const searchParams = useSearchParams();
  const initialTab: FilterTab =
    searchParams.get("featured") === "true" ? "FEATURED" : "ALL";

  const {
    proofs,
    proofsMeta,
    fetchProofs,
    approveProof,
    rejectProof,
    flagProof,
    toggleFeatureProof,
    deleteProof,
    isLoading,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [selectedProof, setSelectedProof] = useState<AdminProof | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProof | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const buildFilter = useCallback(
    (page: number) => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      isFeatured: activeTab === "FEATURED" ? true : undefined,
      status:
        activeTab !== "ALL" && activeTab !== "FEATURED" ? activeTab : undefined,
    }),
    [debouncedSearch, activeTab],
  );

  useEffect(() => {
    fetchProofs(buildFilter(1));
  }, [buildFilter, fetchProofs]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= proofsMeta.pageCount) {
      fetchProofs(buildFilter(newPage));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      case "FLAGGED":
        return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    }
  };

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

  const handleActionComplete = (
    type: AdminFeedbackType,
    proof: AdminProof,
  ) => {
    const authorLabel = proof.talent?.username
      ? `@${proof.talent.username}`
      : proof.talent?.firstName || "User";
    let message = "";
    let subMessage = `${authorLabel}'s post `;

    switch (type) {
      case "approved":
        message = "Post Approved";
        subMessage += "has been approved.";
        break;
      case "rejected":
        message = "Post Rejected";
        subMessage += "has been rejected.";
        break;
      case "featured":
        message = "Set as Proof of the Week";
        subMessage += "is now featured as Proof of the Week.";
        break;
      case "unfeatured":
        message = "Removed from Proof of the Week";
        subMessage += "was removed from Proof of the Week.";
        break;
      case "verified":
        message = "Visibility Updated";
        subMessage += "visibility settings were updated.";
        break;
      case "flagged":
        message = "Post Flagged";
        subMessage += "has been flagged for review.";
        break;
      case "deleted":
        message = "Post Deleted";
        subMessage += "has been permanently removed.";
        break;
    }

    setFeedbackState({
      isOpen: true,
      type,
      message,
      subMessage,
    });
    setSelectedProof(null);
    fetchProofs(buildFilter(proofsMeta.page));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteProof(deleteTarget.id);
    setIsDeleting(false);
    const deleted = deleteTarget;
    setDeleteTarget(null);
    handleActionComplete("deleted", deleted);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Posts &amp; Proof of the Week
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect community posts, feature or remove Proofs of the Week, and
          moderate content.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                  active
                    ? tab.key === "FEATURED"
                      ? "bg-yellow-100 text-yellow-900 border-yellow-300"
                      : "bg-[#7300E5] text-white border-[#7300E5]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                {tab.key === "FEATURED" && (
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      active
                        ? "fill-yellow-500 text-yellow-600"
                        : "text-yellow-500",
                    )}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search user, topic, or post text..."
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/60">
              <TableHead>Post &amp; Topic</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof of the Week</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#7300E5]" />
                    <span>Loading posts...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : proofs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-gray-500"
                >
                  No posts match this filter.
                </TableCell>
              </TableRow>
            ) : (
              proofs.map((proof) => {
                const isGu2k = Boolean(
                  proof.gig?.gu2kGigId &&
                    !proof.gig.gu2kGigId.startsWith("custom_"),
                );
                const headline =
                  proof.gig?.title || proof.title || "Untitled Post";
                const talentName = proof.talent
                  ? `${proof.talent.firstName} ${proof.talent.lastName}`.trim()
                  : "Arena User";
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

                return (
                  <TableRow key={proof.id} className="hover:bg-gray-50/50">
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {firstUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedProof(proof)}
                            className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-gray-200 cursor-pointer"
                            title="Preview media"
                          >
                            {isFirstVideo ? (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <Play className="w-4 h-4 fill-white" />
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={firstUrl}
                                alt={headline}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {mediaCount > 1 && (
                              <span className="absolute bottom-0 right-0 rounded-tl bg-black/75 text-white text-[9px] px-1 font-semibold">
                                +{mediaCount - 1}
                              </span>
                            )}
                          </button>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProof(proof)}
                              className="font-semibold text-sm text-gray-900 hover:text-[#7300E5] transition-colors truncate text-left cursor-pointer"
                            >
                              {headline}
                            </button>
                            {isGu2k && (
                              <BadgeCheck
                                className="h-4 w-4 text-[#7300E5] shrink-0"
                                aria-label="Verified GU2K Gig"
                              />
                            )}
                          </div>
                          {proof.caption && (
                            <p className="text-xs text-gray-500 truncate">
                              {proof.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {proof.talent?.id ? (
                        <Link
                          href={`/admin/talents/${proof.talent.id}`}
                          className="flex items-center gap-2.5 group min-w-[150px]"
                        >
                          <UserAvatar
                            name={talentName}
                            src={proof.talent?.avatarUrl}
                            size={32}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 group-hover:text-[#7300E5] transition-colors truncate">
                              {talentName}
                            </p>
                            {proof.talent?.username && (
                              <p className="text-xs text-gray-400 truncate">
                                @{proof.talent.username}
                              </p>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <UserAvatar
                            name={talentName}
                            src={proof.talent?.avatarUrl}
                            size={32}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {talentName}
                            </p>
                          </div>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                      <span>{proof.likesCount} likes</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span>{proof.salutesCount} salutes</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-normal ${getStatusColor(proof.status)}`}
                        >
                          {formatStatus(proof.status)}
                        </Badge>
                        {proof.shadowLimited && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2 py-0.5 text-[11px] bg-gray-100 text-gray-700 border-gray-200"
                          >
                            Shadow Limited
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleFeatureProof(proof.id, !proof.isFeatured).then(
                            () =>
                              handleActionComplete(
                                !proof.isFeatured ? "featured" : "unfeatured",
                                proof,
                              ),
                          )
                        }
                        className={cn(
                          "h-8 rounded-full text-xs font-semibold gap-1.5",
                          proof.isFeatured
                            ? "bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                            : "text-gray-600 border-gray-200 hover:text-yellow-700 hover:border-yellow-300",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            proof.isFeatured &&
                              "fill-yellow-500 text-yellow-500",
                          )}
                        />
                        {proof.isFeatured
                          ? "Remove Proof of the Week"
                          : "Make Proof of the Week"}
                      </Button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-400">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Inspect post"
                          className="h-8 w-8 hover:text-gray-900"
                          onClick={() => setSelectedProof(proof)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Approve post"
                          className={cn(
                            "h-8 w-8 hover:text-green-600",
                            proof.status === "APPROVED" && "text-green-600",
                          )}
                          onClick={() =>
                            approveProof(proof.id).then(() =>
                              handleActionComplete("approved", proof),
                            )
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reject post"
                          className={cn(
                            "h-8 w-8 hover:text-red-600",
                            proof.status === "REJECTED" && "text-red-600",
                          )}
                          onClick={() =>
                            rejectProof(
                              proof.id,
                              "Content does not meet guidelines",
                            ).then(() =>
                              handleActionComplete("rejected", proof),
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Flag post"
                          className={cn(
                            "h-8 w-8 hover:text-orange-600",
                            proof.status === "FLAGGED" && "text-orange-600",
                          )}
                          onClick={() =>
                            flagProof(proof.id).then(() =>
                              handleActionComplete("flagged", proof),
                            )
                          }
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete post"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => setDeleteTarget(proof)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {proofsMeta.pageCount > 1 && (
        <div className="flex items-center justify-between py-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(proofsMeta.page - 1)}
            disabled={proofsMeta.page <= 1}
            className="gap-1 pl-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {Array.from({ length: proofsMeta.pageCount }, (_, i) => (
              <Button
                key={i + 1}
                variant={proofsMeta.page === i + 1 ? "secondary" : "ghost"}
                className={`h-8 w-8 p-0 ${proofsMeta.page === i + 1 ? "bg-purple-100 text-purple-700 font-bold" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => handlePageChange(proofsMeta.page + 1)}
            disabled={proofsMeta.page >= proofsMeta.pageCount}
            className="gap-1 pr-2.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {selectedProof && (
        <ProofDetailModal
          key={selectedProof.id}
          isOpen={!!selectedProof}
          onClose={() => setSelectedProof(null)}
          proof={selectedProof}
          onActionComplete={handleActionComplete}
          onRequestDelete={(p) => {
            setSelectedProof(null);
            setDeleteTarget(p);
          }}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this post
              {deleteTarget?.title ? ` ("${deleteTarget.title}")` : ""}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
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

export default function ProofModerationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#7300E5]" />
          <span>Loading moderation tools...</span>
        </div>
      }
    >
      <ProofModerationContent />
    </Suspense>
  );
}
