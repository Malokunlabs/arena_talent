"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { RecommendationItem } from "@/services/talentService";
import { recommendationService } from "@/services/recommendationService";
import { gigService, Gig } from "@/services/gigService";
import { getLevelColor } from "@/components/arena/LevelBadge";
import { toast } from "sonner";

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: RecommendationItem[];
  recipientId?: string;
  recipientName?: string;
  canWrite?: boolean;
  canDeleteAll?: boolean;
  currentUserId?: string;
  onChanged?: () => void;
}

export default function RecommendationsModal({
  isOpen,
  onClose,
  recommendations,
  recipientId,
  recipientName,
  canWrite = false,
  canDeleteAll = false,
  currentUserId,
  onChanged,
}: RecommendationsModalProps) {
  const [items, setItems] = useState<RecommendationItem[]>(recommendations);
  const [composing, setComposing] = useState(false);
  const [authorRole, setAuthorRole] = useState("");
  const [gigId, setGigId] = useState("");
  const [content, setContent] = useState("");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(recommendations);
  }, [recommendations, isOpen]);

  useEffect(() => {
    if (!isOpen || !composing || gigs.length > 0) return;
    gigService
      .getGigs({ limit: 50 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setGigs(list);
      })
      .catch(() => {});
  }, [isOpen, composing, gigs.length]);

  useEffect(() => {
    if (!isOpen) {
      setComposing(false);
      setAuthorRole("");
      setGigId("");
      setContent("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !content.trim()) return;

    setSubmitting(true);
    try {
      const created = await recommendationService.create({
        recipientId,
        gigId: gigId || undefined,
        authorRole: authorRole.trim() || undefined,
        content: content.trim(),
      });
      setItems((prev) => [created, ...prev]);
      setComposing(false);
      setAuthorRole("");
      setGigId("");
      setContent("");
      toast.success("Recommendation submitted");
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit recommendation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await recommendationService.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Recommendation deleted");
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete recommendation",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0 gap-3">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Recommendations
          </h2>
          <div className="flex items-center gap-2">
            {canWrite && recipientId && !composing && (
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="h-8 px-3 rounded-xl bg-[#7E00EE] hover:bg-[#6A00CC] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Write
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Write Recommendation Form */}
        {composing && recipientId && (
          <form
            onSubmit={handleSubmit}
            className="mb-4 p-4 rounded-2xl bg-[#FAFAFC] border border-[#EFEFF3] space-y-3 shrink-0"
          >
            <p className="text-[13px] font-semibold text-black">
              Recommend {recipientName || "this talent"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Your role (e.g. Project Manager)"
                className="h-9 px-3 rounded-xl border border-[#E6E6EC] bg-white text-[12.5px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE]"
              />
              <select
                value={gigId}
                onChange={(e) => setGigId(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#E6E6EC] bg-white text-[12.5px] text-black outline-none focus:border-[#7E00EE]"
              >
                <option value="">Based on GU2K Gig (optional)</option>
                {gigs.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={3}
              required
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share how they delivered, collaborated, or stood out..."
              className="w-full p-3 rounded-xl border border-[#E6E6EC] bg-white text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setComposing(false)}
                className="h-8 px-3 rounded-xl border border-[#E5E7EB] bg-white text-[12px] font-medium text-black hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="h-8 px-3.5 rounded-xl bg-[#7E00EE] hover:bg-[#6A00CC] text-white text-[12px] font-medium inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        )}

        {/* Recommendations List */}
        <div className="overflow-y-auto divide-y divide-[#F0F0F4] pr-1">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-semibold text-black">
                No recommendations yet
              </p>
              <p className="text-[12.5px] text-[#747682] mt-1">
                Collaborators and project leads can recommend work on GU2K gigs
                here.
              </p>
            </div>
          ) : (
            items.map((rec) => {
              const authorName = rec.author
                ? `${rec.author.firstName || ""} ${rec.author.lastName || ""}`.trim() ||
                  "Arena Member"
                : "Arena Member";
              const gigLabel =
                rec.basedOnGig?.category ||
                rec.basedOnGig?.title ||
                "GU2K Project";
              const ringColor = getLevelColor(rec.author?.level);
              const authorHref = rec.author?.username
                ? `/profile?username=${rec.author.username}`
                : "#";
              const canDeleteItem =
                canDeleteAll ||
                (Boolean(currentUserId) && rec.author?.id === currentUserId);

              return (
                <div key={rec.id} className="py-4 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={authorHref}
                      onClick={onClose}
                      className="flex items-center gap-2.5 min-w-0 group"
                    >
                      <div
                        style={{ borderColor: ringColor }}
                        className="rounded-full p-[1.5px] border-2 shrink-0"
                      >
                        <UserAvatar
                          name={authorName}
                          src={rec.author?.avatarUrl}
                          size={34}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-black group-hover:underline truncate">
                          {authorName}
                        </p>
                        <p className="text-[11.5px] text-[#747682] truncate">
                          {rec.authorRole || "Collaborator"}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-start gap-2 shrink-0">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10.5px] text-[#747682] mb-1">
                          Based On
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F8] text-[#747682] text-[10.5px] font-medium max-w-[175px]">
                          <Image
                            src="/icons/briefcase.svg"
                            alt=""
                            width={12}
                            height={12}
                            className="shrink-0 opacity-80"
                          />
                          <span className="truncate">{gigLabel}</span>
                        </div>
                      </div>

                      {canDeleteItem && (
                        <button
                          type="button"
                          disabled={deletingId === rec.id}
                          onClick={() => handleDelete(rec.id)}
                          title="Delete recommendation"
                          className="mt-1 p-1.5 rounded-lg text-[#747682] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === rec.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-[13px] leading-[1.55] text-[#747682]">
                    {rec.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
