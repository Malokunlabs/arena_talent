"use client";

import React from "react";
import { Lock, ArrowUp, Crown, Check } from "lucide-react";
import { type BadgeTierInfo, type BadgeTier } from "@/services/badgeService";

interface TierPrivilegesPanelProps {
  tiers: BadgeTierInfo[];
  currentTier: BadgeTier | null;
}

const DEFAULT_TIERS = [
  {
    tier: "BEGINNER" as BadgeTier,
    title: "Beginner Unlocks",
    subtitle: "Your current tier privileges",
    items: [
      "Standard public gig listings",
      "Base gig rates",
      "Profile badge visibility",
      "Proof feed visibility",
    ],
  },
  {
    tier: "INTERMEDIATE" as BadgeTier,
    title: "Intermediate Unlocks",
    subtitle: "Unlock at 20+ gigs with 4.3+ rating",
    items: [
      "Higher-paying gigs + early access",
      "+15-25% pay rate uplift",
      'Priority "Hire Me" matching',
      "Featured status on Talent page",
    ],
  },
  {
    tier: "PROFESSIONAL" as BadgeTier,
    title: "Professional Unlocks",
    subtitle: "Unlock at 50+ gigs with 4.6+ rating",
    items: [
      "Sensitive / enterprise gigs",
      "Brand partnerships",
      "+30-50% pay uplift",
      "Collaborate request priority",
      "Beta features & financial tools",
    ],
  },
];

export default function TierPrivilegesPanel({ tiers, currentTier }: TierPrivilegesPanelProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-base">Tier Privileges</h3>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Platform upgrades unlocked at each tier
        </p>
      </div>

      <div className="space-y-4">
        {DEFAULT_TIERS.map((tierDef) => {
          const isBeginner = tierDef.tier === "BEGINNER";
          const isIntermediate = tierDef.tier === "INTERMEDIATE";
          const isProfessional = tierDef.tier === "PROFESSIONAL";

          const isCurrent = currentTier === tierDef.tier || (isBeginner && !currentTier);
          const isLocked = isProfessional;

          return (
            <div
              key={tierDef.tier}
              className={`rounded-2xl border p-5 transition-all ${
                isBeginner
                  ? "bg-white border-purple-100"
                  : isIntermediate
                  ? "bg-white border-purple-200"
                  : "bg-gray-50/60 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isBeginner
                        ? "bg-[#F4ECFF] text-[#7300E5]"
                        : isIntermediate
                        ? "bg-[#7300E5] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isBeginner ? (
                      <Lock className="w-4 h-4 text-[#7300E5]" />
                    ) : isIntermediate ? (
                      <ArrowUp className="w-4 h-4 text-white" />
                    ) : (
                      <Crown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-snug">
                      {tierDef.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {tierDef.subtitle}
                    </p>
                  </div>
                </div>

                {isLocked && <Lock className="w-4 h-4 text-gray-300" />}
              </div>

              <ul className="space-y-2 mt-3">
                {tierDef.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[12px] font-medium"
                  >
                    {!isLocked ? (
                      <Check className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-300 shrink-0" />
                    )}
                    <span
                      className={!isLocked ? "text-gray-700" : "text-gray-400"}
                    >
                      {item}
                    </span>
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
