"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { RecommendationItem } from "@/services/talentService";
import { getLevelColor } from "@/components/arena/LevelBadge";

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: RecommendationItem[];
}

export default function RecommendationsModal({
  isOpen,
  onClose,
  recommendations,
}: RecommendationsModalProps) {
  if (!isOpen) return null;

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
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Recommendations
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recommendations List */}
        <div className="overflow-y-auto divide-y divide-[#F0F0F4] pr-1">
          {recommendations.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-semibold text-black">
                No recommendations yet
              </p>
              <p className="text-[12.5px] text-[#747682] mt-1">
                Collaborators and project leads can recommend your work on GU2K
                gigs here.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => {
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

                    <div className="flex flex-col items-end shrink-0 text-right">
                      <span className="text-[10.5px] text-[#747682] mb-1">
                        Based On
                      </span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F8] text-[#747682] text-[10.5px] font-medium max-w-[190px]">
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
