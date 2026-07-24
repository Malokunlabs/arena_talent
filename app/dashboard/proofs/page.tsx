"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Link2,
  Copy,
  Search,
  Share2,
  Plus,
  ImageIcon,
  MoreHorizontal,
  Edit3,
  Trash2,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentProfile } from "@/services/talentService";
import { proofService, Proof } from "@/services/proofService";
import UserAvatar from "@/components/UserAvatar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateProofModal from "@/components/modals/CreateProofModal";
import EditProofModal from "@/components/modals/EditProofModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const filters = ["All Proofs", "Wins", "Hustles", "Learning", "Media", "Text"];

function getRelativeTimeString(dateString?: string) {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return "1 month ago";
  return `${diffInMonths} months ago`;
}

export default function MyProofsPage() {
  const { user } = useUserStore();
  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Proofs");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [salutingIds, setSalutingIds] = useState<Set<string>>(new Set());
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProof, setEditingProof] = useState<Proof | null>(null);

  useEffect(() => {
    if (user?.username) {
      talentService
        .getTalentByUsername(user.username)
        .then(setProfileData)
        .catch(console.error);

      loadProofs();
    }
  }, [user?.username]);

  const loadProofs = async () => {
    setIsLoading(true);
    try {
      const res = await proofService.getMyProofs({ limit: 50 });
      setProofs(res.data ?? []);
    } catch {
      toast.error("Failed to load proofs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalute = async (proofId: string) => {
    if (salutingIds.has(proofId)) return;

    // Optimistic update
    setSalutingIds((prev) => new Set(prev).add(proofId));
    setProofs((prev) =>
      prev.map((p) =>
        p.id === proofId ? { ...p, salutesCount: (p.salutesCount || 0) + 1 } : p,
      ),
    );

    try {
      await proofService.saluteProof(proofId);
    } catch {
      toast.error("Failed to salute proof");
      setProofs((prev) =>
        prev.map((p) =>
          p.id === proofId
            ? { ...p, salutesCount: Math.max((p.salutesCount || 1) - 1, 0) }
            : p,
        ),
      );
    } finally {
      setSalutingIds((prev) => {
        const next = new Set(prev);
        next.delete(proofId);
        return next;
      });
    }
  };

  const handleShare = async (proof: Proof) => {
    const link = `${window.location.origin}/profile?username=${user?.username || ""}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    toast.success("Proof link copied to clipboard!");

    try {
      await proofService.shareProof(proof.id);
    } catch {
      // silent catch if already shared
    }
  };

  const handleDelete = async (proofId: string) => {
    if (!window.confirm("Are you sure you want to delete this proof?")) return;

    try {
      await proofService.deleteProof(proofId);
      setProofs((prev) => prev.filter((p) => p.id !== proofId));
      toast.success("Proof deleted successfully");
    } catch {
      toast.error("Failed to delete proof");
    }
  };

  const handleEdit = (proof: Proof) => {
    setEditingProof(proof);
    setIsEditModalOpen(true);
  };

  const copyProfileLink = () => {
    const username = talent?.username || user?.username || "";
    const link = `${window.location.origin}/profile?username=${username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("Profile link copied to clipboard!");
    } else {
      toast.success(`Profile link: ${link}`);
    }
  };

  const stats = profileData?.stats;
  const talent = profileData?.talent || user;

  const filteredProofs = proofs.filter((proof) => {
    if (
      searchQuery &&
      !proof.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !proof.caption?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (
      activeFilter !== "All Proofs" &&
      !proof.category?.toLowerCase().includes(activeFilter.toLowerCase()) &&
      !proof.tags?.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 mt-4">
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <UserAvatar
            name={talent ? `${talent.firstName} ${talent.lastName}` : "User"}
            src={talent?.avatarUrl}
            size={80}
            className="shrink-0"
          />

          <div>
            <h1 className="text-2xl sm:text-[28px] font-black text-gray-900 capitalize mb-2">
              {talent?.firstName} {talent?.lastName} Proofboard
            </h1>
            <div
              onClick={copyProfileLink}
              className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold hover:text-gray-900 cursor-pointer group transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span>/profile?username={talent?.username}</span>
              <span className="flex items-center gap-1.5 ml-2 text-gray-400 group-hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5 bg-gray-50 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10 mt-4 md:mt-0">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {stats?.totalProofs ?? proofs.length}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">Proofs</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {stats?.totalSalutes ?? 0}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">Salutes</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {stats?.totalGigs ?? 0}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">Gigs</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeFilter === filter
                  ? "bg-[#7300E5] text-white border-transparent"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search proofs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-10 rounded-full border-gray-200 text-sm font-medium shadow-sm"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-full gap-2 px-6 font-bold h-10 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Share Proof
          </Button>
        </div>
      </div>

      {/* Proofs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-pulse bg-white"
            >
              <div className="aspect-[4/3] bg-gray-100"></div>
              <div className="p-6 space-y-4">
                <div className="h-5 bg-gray-100 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                <div className="h-4 bg-gray-100 rounded-md w-5/6"></div>
              </div>
            </div>
          ))
        ) : filteredProofs.length > 0 ? (
          filteredProofs.map((proof) => (
            <div
              key={proof.id}
              className="border border-gray-200/80 rounded-[28px] overflow-hidden shadow-sm bg-white group hover:shadow-md transition-all flex flex-col"
            >
              {/* Media Header Container */}
              <div className="p-3 pb-0 relative">
                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden rounded-[20px] flex items-center justify-center">
                  {proof.mediaUrl ? (
                    <Image
                      src={proof.mediaUrl}
                      alt={proof.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                      <span className="text-sm font-semibold">No Image</span>
                    </div>
                  )}
                </div>

                {/* Actions Dropdown Menu Button */}
                <div className="absolute top-5 right-5 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition-colors focus:outline-none shadow-md">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => handleEdit(proof)}
                        className="gap-2 cursor-pointer font-medium"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" /> Edit Proof
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShare(proof)}
                        className="gap-2 cursor-pointer font-medium"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(proof.id)}
                        className="gap-2 cursor-pointer font-medium text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-extrabold text-gray-900 text-[16px] mb-2 leading-snug line-clamp-1">
                  {proof.title}
                </h3>
                <p className="text-gray-500 text-[13.5px] leading-relaxed line-clamp-2 mb-4 font-medium">
                  {proof.caption || "No description provided."}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {proof.tags && proof.tags.length > 0 ? (
                    proof.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#7300E5] text-white px-3 py-1 rounded-full text-[12px] font-bold tracking-wide"
                      >
                        #{tag.replace(/^#/, "")}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      No tags
                    </span>
                  )}
                </div>

                {/* Bottom Row */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Salutes button */}
                    <button
                      onClick={() => handleSalute(proof.id)}
                      className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 ${
                        salutingIds.has(proof.id) ? "opacity-50 cursor-wait" : ""
                      }`}
                    >
                      <span className="text-[16px]">🙌</span>
                      <span className="text-[13px] font-bold text-[#E11D48]">
                        {proof.salutesCount || 0} Salutes
                      </span>
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleShare(proof)}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-[13px]"
                    >
                      <Share2 className="w-4 h-4 text-gray-400" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Relative Time */}
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {getRelativeTimeString(proof.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No proofs found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't uploaded any proofs matching this criteria.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl font-bold px-6 h-10"
            >
              <Plus className="w-4 h-4 mr-2" /> Upload First Proof
            </Button>
          </div>
        )}
      </div>

      {/* Create Proof Modal */}
      <CreateProofModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          loadProofs();
        }}
      />

      {/* Edit Proof Modal */}
      <EditProofModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProof(null);
        }}
        proof={editingProof}
        onUpdated={(updatedProof) => {
          setProofs((prev) =>
            prev.map((p) => (p.id === updatedProof.id ? updatedProof : p)),
          );
        }}
      />
    </div>
  );
}
