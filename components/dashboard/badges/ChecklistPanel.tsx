"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { type ChecklistItem } from "@/services/badgeService";

interface ChecklistPanelProps {
  items: ChecklistItem[];
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    key: "completion_rate",
    label: "Task Completion Rate",
    required: 90,
    actual: 94,
    passed: true,
    unit: "%",
    displayRequired: "Maintain ≥90% completion across 10+ gigs",
    displayActual: "94% · 14 gigs",
  },
  {
    key: "client_ratings",
    label: "Client Ratings",
    required: 4.0,
    actual: 4.6,
    passed: true,
    unit: "★",
    displayRequired: "Maintain 4.0+ stars from 5+ reviews",
    displayActual: "4.6 ★ · 18 reviews",
  },
  {
    key: "skill_assessment",
    label: "Skill Assessment",
    required: 70,
    actual: 85,
    passed: true,
    unit: "%",
    displayRequired: "Pass assessment at 70%+ (Beginner), 80%+ (Intermediate)",
    displayActual: "85% · Passed",
  },
  {
    key: "gigs_in_category",
    label: "Gigs in Category",
    required: 20,
    actual: 12,
    passed: true,
    unit: "gigs",
    displayRequired: "Complete 5+ gigs (Beginner), 20+ (Intermediate), 50+ (Professional)",
    displayActual: "12 / 20 · Intermediate target",
  },
  {
    key: "on_time_delivery",
    label: "On-Time Delivery",
    required: 85,
    actual: 84,
    passed: false,
    unit: "%",
    displayRequired: "Maintain >85% (Beginner), >92% (Intermediate), >97% (Professional)",
    displayActual: "84% - At Risk",
  },
  {
    key: "dispute_rate",
    label: "Dispute Rate",
    required: 15,
    actual: 4,
    passed: true,
    unit: "%",
    displayRequired: "Keep below 15% (Beginner), 8% (Intermediate), 3% (Professional)",
    displayActual: "4% · Excellent",
  },
];

export default function ChecklistPanel({ items }: ChecklistPanelProps) {
  const displayItems = items && items.length > 0 ? items : DEFAULT_CHECKLIST;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-base">Progress Checklist</h3>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Automated metrics tracking your badge eligibility
        </p>
      </div>

      <div className="space-y-6">
        {displayItems.map((item) => {
          const isAtRisk = !item.passed && item.displayActual?.includes("At Risk");

          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.passed
                        ? "bg-[#00B86B] text-white"
                        : isAtRisk
                        ? "bg-[#FFB800] text-white font-bold"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : isAtRisk ? (
                      <span className="text-[13px] font-black">!</span>
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-snug">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.displayRequired ?? `Maintain required ${item.label}`}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[12px] font-bold shrink-0 ${
                    item.passed
                      ? "text-[#7300E5]"
                      : isAtRisk
                      ? "text-[#FF8A00]"
                      : "text-gray-500"
                  }`}
                >
                  {item.displayActual}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="pl-9">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.passed
                        ? "bg-[#00B86B]"
                        : isAtRisk
                        ? "bg-[#FF4D4D]"
                        : "bg-gray-300"
                    }`}
                    style={{
                      width: item.passed
                        ? "70%"
                        : isAtRisk
                        ? "60%"
                        : "40%",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
