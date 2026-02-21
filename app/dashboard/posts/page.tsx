"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Edit, Archive, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedCard from "@/components/FeedCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateProofModal from "@/components/modals/CreateProofModal";
import { useProofStore } from "@/store/useProofStore";

// Helper to calculate time ago (duplicated for now, could move to utils)
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

export default function MyPostsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { userProofs, fetchUserProofs, isLoading, saluteProof } =
    useProofStore();

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
            <div key={post.id} className="relative group">
              <FeedCard
                avatar={
                  post.talent?.avatar ||
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
              />

              {/* Overlay Actions */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="h-8 w-8 rounded-full p-0 shadow-md"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-gray-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-700">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
    </div>
  );
}
