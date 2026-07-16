"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock, Star } from "lucide-react";
import { type ChecklistItem } from "@/services/badgeService";

interface ChecklistPanelProps {
  items: ChecklistItem[];
}

export default function ChecklistPanel({ items }: ChecklistPanelProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-base">Progress Checklist</h3>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Automatic metrics tracking your badge eligibility
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const pct =
            item.actual !== null && item.required > 0
              ? Math.min(100, Math.round((item.actual / item.required) * 100))
              : 0;

          const isRisk =
            !item.passed &&
            item.actual !== null &&
            pct >= 80;

          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center gap-2">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : isRisk ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                )}
                <span className="text-[13px] font-semibold text-gray-800">
                  {item.label}
                </span>
              </div>

              <p className="text-[12px] text-gray-500 pl-6">
                {item.displayRequired ?? `Required: ${item.required}${item.unit ?? ""}`}
              </p>

              {/* Progress bar */}
              <div className="pl-6">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.passed
                        ? "bg-green-500"
                        : isRisk
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span
                    className={`text-[11px] font-semibold ${
                      item.passed
                        ? "text-green-600"
                        : isRisk
                        ? "text-yellow-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.displayActual ?? `${item.actual ?? 0}${item.unit ?? ""}`}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {item.passed ? "✓ Passed" : isRisk ? "⚠ At Risk" : "Not met"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
