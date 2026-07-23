"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { RatingBreakdown, ReviewItem } from "@/services/reviewService";

interface RatingsPanelProps {
  breakdown: RatingBreakdown | null;
  reviews: ReviewItem[];
  totalReviews: number;
}

function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= value
                ? "fill-amber-200 text-amber-400"
                : "fill-gray-100 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = Math.round((value / 5) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-gray-500 w-28 shrink-0 font-medium">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7300E5] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-700 w-6 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function RatingsPanel({
  breakdown,
  reviews,
  totalReviews,
}: RatingsPanelProps) {
  if (!breakdown && reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-1">Ratings & Reviews</h3>
        <p className="text-[13px] text-gray-400 mb-4">
          No reviews yet. Complete gigs to receive ratings.
        </p>
        <div className="flex items-center justify-center py-6 text-gray-300">
          <Star className="w-10 h-10" />
        </div>
      </div>
    );
  }

  const overall = breakdown?.avgOverall ?? 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-gray-900">Ratings & Reviews</h3>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Based on {totalReviews} verified {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Overall Score */}
      {breakdown && (
        <div className="flex items-start gap-5">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-gray-900 leading-none">
              {overall.toFixed(1)}
            </p>
            <StarRating value={overall} size="md" />
            <p className="text-[10px] text-gray-400 mt-1 font-medium">out of 5</p>
          </div>

          {/* Metric Bars */}
          <div className="flex-1 space-y-2.5 pt-1">
            <MetricBar label="Quality" value={breakdown.avgQuality} />
            <MetricBar label="Professionalism" value={breakdown.avgProfessionalism} />
            <MetricBar label="On-Time" value={breakdown.avgOnTime} />
            <MetricBar label="Collaboration" value={breakdown.avgCollaboration} />
            <MetricBar label="Creativity" value={breakdown.avgCreativity} />
          </div>
        </div>
      )}

      {/* Divider */}
      {reviews.length > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h4 className="text-[13px] font-bold text-gray-700">Latest Comments</h4>

          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="flex gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100/80"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#F4ECFF] flex items-center justify-center">
                {review.reviewer?.avatarUrl ? (
                  <Image
                    src={review.reviewer.avatarUrl}
                    alt={review.reviewer.firstName}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-[#7300E5]">
                    {review.reviewer
                      ? `${review.reviewer.firstName[0]}${review.reviewer.lastName[0]}`
                      : "?"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-gray-900 truncate">
                      {review.reviewer
                        ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                        : "Anonymous"}
                    </span>
                    {review.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-[#7300E5] shrink-0" />
                    )}
                    <span className="text-[10px] text-gray-400 uppercase font-semibold bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {review.reviewerRole === "CLIENT" ? "Client" : "Collab"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                    {relTime(review.createdAt)}
                  </span>
                </div>

                <StarRating value={review.overallScore} size="sm" />

                {review.comment && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <Quote className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
