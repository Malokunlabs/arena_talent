"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Edit, MoreVertical, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateProofModal from "@/components/modals/CreateProofModal";
import ProofDetailModal from "@/components/modals/ProofDetailModal";
import { useProofStore } from "@/store/useProofStore";
import { useUserStore } from "@/store/useUserStore";
import { Proof } from "@/services/proofService";

function timeAgo(dateString?: string) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditProofModal({
  proof,
  onClose,
}: {
  proof: Proof;
  onClose: () => void;
}) {
  const { updateProof } = useProofStore();
  const [title, setTitle] = useState(proof.title);
  const [category, setCategory] = useState(proof.category);
  const [caption, setCaption] = useState(proof.caption || "");
  const [tagsInput, setTagsInput] = useState((proof.tags || []).join(", "));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const ok = await updateProof(proof.id, { title, category, caption, tags });
    setIsSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Proof</DialogTitle>
          <DialogDescription>
            Update the details of your proof below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proof title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Design, Dev, Music"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-caption">Caption</Label>
            <Textarea
              id="edit-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell us about this proof..."
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tags">Tags</Label>
            <Input
              id="edit-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="design, ui, frontend (comma-separated)"
            />
            <p className="text-xs text-gray-400">Separate tags with commas</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-[#7300E5] hover:bg-[#5f00bd] text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteProofDialog({
  proof,
  onClose,
}: {
  proof: Proof;
  onClose: () => void;
}) {
  const { deleteProof } = useProofStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const ok = await deleteProof(proof.id);
    setIsDeleting(false);
    if (ok) onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Delete Proof</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-900">
              &quot;{proof.title}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Proof"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function MyPostsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);
  const [editingProof, setEditingProof] = useState<Proof | null>(null);
  const [deletingProof, setDeletingProof] = useState<Proof | null>(null);

  const { userProofs, fetchUserProofs, isLoading, saluteProof } =
    useProofStore();
  const { user } = useUserStore();

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : "there";

  useEffect(() => {
    fetchUserProofs();
  }, [fetchUserProofs]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Proofs</h1>
          <p className="text-gray-500 mt-1">
            View, edit, and manage all your content posts.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Proof
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <FeedSkeleton key={index} />
          ))
        ) : userProofs.length > 0 ? (
          userProofs.map((post) => (
            <div key={post.id}>
              <FeedCard
                avatar={
                  post.talent?.avatarUrl ||
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                }
                name={`${post.talent?.firstName || "Me"} ${post.talent?.lastName || ""}`}
                location={post.talent?.location || "Lagos"}
                timeAgo={timeAgo(post.createdAt)}
                badge="Win"
                image={post.mediaUrl}
                tags={post.tags || []}
                title={post.title}
                description={post.caption}
                salutes={post.salutesCount || 0}
                onSalute={() => saluteProof(post.id)}
                onShare={() => setSelectedProof(post)}
                onClick={() => setSelectedProof(post)}
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full p-0 hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="text-gray-700 cursor-pointer"
                        onClick={() => setEditingProof(post)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        onClick={() => setDeletingProof(post)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">
              You haven&apos;t shared any proofs yet.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
              className="border-[#7300E5] text-[#7300E5]"
            >
              Share your first proof
            </Button>
          </div>
        )}
      </div>

      <CreateProofModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

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
                username:
                  selectedProof.talent?.username ||
                  user?.username ||
                  "anonymous",
                proofboardLink: selectedProof.talent?.username
                  ? `/talent/${selectedProof.talent.username}`
                  : user?.username
                    ? `/talent/${user.username}`
                    : "/talent",
                id: selectedProof.id,
              }
            : null
        }
      />

      {editingProof && (
        <EditProofModal
          proof={editingProof}
          onClose={() => setEditingProof(null)}
        />
      )}

      {deletingProof && (
        <DeleteProofDialog
          proof={deletingProof}
          onClose={() => setDeletingProof(null)}
        />
      )}
    </div>
  );
}
