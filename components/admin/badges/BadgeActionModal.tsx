"use client";

import React, { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import adminBadgeService from "@/services/adminBadgeService";

type ActionType = "approve" | "reject" | "uphold" | "approve-appeal";

interface ActionModal {
  type: ActionType;
  applicationId: string;
  onClose: () => void;
  onDone: () => void;
}

export default function BadgeActionModal({ type, applicationId, onClose, onDone }: ActionModal) {
  const [score, setScore] = useState<number>(80);
  const [tier, setTier] = useState<"BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL">("BEGINNER");
  const [rejectedReason, setRejectedReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isApprove = type === "approve" || type === "approve-appeal";
  const isReject = type === "reject";
  const isAppeal = type === "uphold" || type === "approve-appeal";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (type === "approve") {
        await adminBadgeService.approve(applicationId, {
          assessmentScore: score,
          tier,
          adminNote: adminNote || undefined,
        });
      } else if (type === "reject") {
        await adminBadgeService.reject(applicationId, {
          rejectedReason,
          adminNote,
        });
      } else if (type === "uphold") {
        await adminBadgeService.upholdRejection(applicationId, {
          appealDecisionNote: adminNote,
        });
      } else if (type === "approve-appeal") {
        await adminBadgeService.approveAppeal(applicationId, {
          appealDecisionNote: adminNote,
          assessmentScore: score,
          tier,
        });
      }
      onDone();
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<ActionType, string> = {
    approve: "Approve Badge Application",
    reject: "Reject Badge Application",
    uphold: "Uphold Rejection",
    "approve-appeal": "Approve Appeal",
  };

  const descriptions: Record<ActionType, string> = {
    approve: "Grant the talent their verified badge at the selected tier.",
    reject: "Reject this application with a clear reason for the talent.",
    uphold: "Confirm that the rejection decision stands and lock further appeals.",
    "approve-appeal": "Overturn the rejection and grant the badge based on the appeal.",
  };

  const isValid =
    isApprove
      ? score >= 0 && score <= 100 && adminNote.length >= 0
      : rejectedReason.length > 5 && adminNote.length > 5;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">{titles[type]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-gray-500">{descriptions[type]}</p>

          {/* Approve fields */}
          {isApprove && (
            <>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Assessment Score (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Tier to Grant</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["BEGINNER", "INTERMEDIATE", "PROFESSIONAL"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTier(t)}
                      className={`py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                        tier === t
                          ? "bg-[#7300E5] text-white border-[#7300E5]"
                          : "border-gray-200 text-gray-600 hover:border-[#7300E5]/40"
                      }`}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reject fields */}
          {isReject && (
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Rejection Reason (shown to talent)</label>
              <input
                type="text"
                placeholder="e.g. Assessment score below passing threshold"
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>
          )}

          {/* Admin note (all types) */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              {isReject ? "Detailed Feedback (shown to talent)" : "Internal Admin Note (optional)"}
            </label>
            <textarea
              rows={3}
              placeholder={
                isReject
                  ? "Provide specific feedback on what needs improvement..."
                  : "Leave a note for the team..."
              }
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] resize-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (isReject && !isValid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              isReject || type === "uphold"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[#7300E5] text-white hover:bg-[#5c00b8]"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {type === "approve" && "Approve Badge"}
            {type === "reject" && "Reject Application"}
            {type === "uphold" && "Uphold Rejection"}
            {type === "approve-appeal" && "Approve Appeal"}
          </button>
        </div>
      </div>
    </div>
  );
}
