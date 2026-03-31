import React from "react";
import Image from "next/image";
import { MapPin, Hand, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  avatar: string;
  name: string;
  location: string;
  timeAgo: string;
  badge: "Win" | "Hustle" | "Unicorn" | "Learning";
  image: string;
  tags: string[];
  title: string;
  description: string;
  salutes: number;
  onClick?: () => void;
  onSalute?: () => void;
  onShare?: () => void;
}

const badgeColors = {
  Win: "bg-[#F3E8FF] text-[#7300E5]",
  Hustle: "bg-[#FDF2F8] text-[#DB2777]",
  Unicorn: "bg-[#F0FDF4] text-[#16A34A]",
  Learning: "bg-[#FFF7ED] text-[#EA580C]",
};

export default function FeedCard({
  avatar,
  name,
  location,
  timeAgo,
  badge,
  image,
  tags,
  title,
  description,
  salutes,
  onClick,
  onSalute,
  onShare,
}: FeedCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all",
        onClick && "cursor-pointer",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100">
            <Image src={avatar} alt={name} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-sm">{name}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            badgeColors[badge] || badgeColors.Win,
          )}
        >
          {badge}
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSalute?.();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E8FF] text-[#7300E5] text-sm font-bold transition-colors hover:bg-[#E9D5FF]"
        >
          <Hand className="w-4 h-4" />
          <span>{salutes} Salutes</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
