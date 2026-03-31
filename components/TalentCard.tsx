"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Talent } from "@/services/talentService";

interface TalentCardProps {
  talent: Talent;
  onRequest: (talent: Talent) => void;
}

export default function TalentCard({ talent, onRequest }: TalentCardProps) {
  const fullName = `${talent.firstName} ${talent.lastName}`;
  const availabilityStatus = talent.isAvailable ? "Available" : "Busy";

  // Use a default avatar if none provided
  const avatarUrl = talent.avatarUrl || talent.avatar || "/placeholder-avatar.png";

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-100">
            <Image
              src={avatarUrl}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{fullName}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {talent.location}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
            talent.isAvailable
              ? "bg-[#E8F8F0] text-[#16A34A]"
              : "bg-gray-100 text-gray-500",
          )}
        >
          {availabilityStatus}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 leading-snug">
          {/* Fallback role description or bio snippet since role isn't in API yet, using bio or a default */}
          {talent.bio || "Verified Talent"}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {talent.skills?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7300E5] text-[10px] font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium pt-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
          <span>{talent.totalGigs || 0} gigs</span>
        </div>
        {/* Turnaround is not in API, mocking or hiding */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>24hrs avg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
          <span className="text-gray-900 font-bold">{talent.rating || 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-1 mt-auto">
        <Button
          onClick={() => onRequest(talent)}
          className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold h-9 text-xs rounded-xl shadow-md shadow-purple-50"
        >
          Request Talent
        </Button>
        <Link href={`/profile?username=${talent.username}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full border-[#7300E5] text-[#7300E5] hover:bg-[#F3E8FF] font-bold h-9 text-xs rounded-xl"
          >
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
