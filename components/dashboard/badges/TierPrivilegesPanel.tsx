"use client";

import React from "react";
import { Lock, ArrowUp } from "lucide-react";
import { type BadgeTierInfo, type BadgeTier } from "@/services/badgeService";

interface TierPrivilegesPanelProps {
  tiers: BadgeTierInfo[];
  currentTier: BadgeTier | null;
}

const TIER_ORDER: BadgeTier[] = ["BEGINNER", "INTERMEDIATE", "PROFESSIONAL"];

const TIER_LABELS: Record<BadgeTier, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  PROFESSIONAL: "Professional",
};

const TIER_COLORS: Record<BadgeTier, { bg: string; text: string; border: string; icon: string }> = {
  BEGINNER: {
    bg: "bg-[#F4ECFF]",
    text: "text-[#7300E5]",
    border: "border-[#7300E5]/20",
    icon: "text-[#7300E5]",
  },
  INTERMEDIATE: {
    bg: "bg-purple-600",
    text: "text-white",
    border: "border-purple-600",
    icon: "text-white",
  },
  PROFESSIONAL: {
    bg: "bg-gray-100",
    text: "text-gray-400",
    border: "border-gray-200",
    icon: "text-gray-400",
  },
};

export default function TierPrivilegesPanel({ tiers, currentTier }: TierPrivilegesPanelProps) {
  const sortedTiers = [...tiers].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );

  const currentTierIndex = currentTier ? TIER_ORDER.indexOf(currentTier) : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-base">Tier Privileges</h3>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Platform upgrades unlocked at each tier
        </p>
      </div>

      <div className="space-y-3">
        {sortedTiers.map((tier, idx) => {
          const isUnlocked = TIER_ORDER.indexOf(tier.tier) <= currentTierIndex;
          const isCurrent = tier.tier === currentTier;
          const colors = TIER_COLORS[tier.tier];

          return (
            <div
              key={tier.tier}
              className={`rounded-xl border p-4 transition-all ${
                isCurrent
                  ? `${colors.bg} ${colors.border} ring-1 ring-[#7300E5]/30`
                  : isUnlocked
                  ? "bg-purple-600 border-purple-600"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isCurrent ? "bg-[#7300E5]" : "bg-white/20"
                      }`}
                    >
                      <ArrowUp
                        className={`w-4 h-4 ${
                          isCurrent ? "text-white" : "text-white"
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-[13px] font-bold ${
                        isUnlocked && !isCurrent
                          ? "text-white"
                          : isCurrent
                          ? "text-[#7300E5]"
                          : "text-gray-400"
                      }`}
                    >
                      {TIER_LABELS[tier.tier]} Unlocks
                    </p>
                    <p
                      className={`text-[11px] ${
                        isUnlocked && !isCurrent
                          ? "text-purple-100"
                          : isCurrent
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                    >
                      {isCurrent
                        ? "Your current tier privileges"
                        : isUnlocked
                        ? `Unlock at ${idx > 0 ? "20+" : "6+"} gigs with ${idx > 0 ? "4.3+" : "4.0+"} rating`
                        : `Unlock at ${idx === 2 ? "50+" : "20+"} gigs with ${idx === 2 ? "4.6+" : "4.3+"} rating`}
                    </p>
                  </div>
                </div>
                {!isUnlocked && (
                  <Lock className="w-4 h-4 text-gray-300" />
                )}
              </div>

              <ul className="space-y-1 pl-9">
                {tier.privileges.items?.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-1.5 text-[12px] ${
                      isUnlocked && !isCurrent
                        ? "text-purple-100"
                        : isUnlocked
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    <span>{isUnlocked ? "✓" : "–"}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
