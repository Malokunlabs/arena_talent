"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import adminBadgeService, { type RevokeBadgeDto } from "@/services/adminBadgeService";

const REVOCATION_REASONS: { value: RevokeBadgeDto["revocationReason"]; label: string }[] = [
  { value: "METRICS_DROPPED", label: "Metrics dropped below threshold" },
  { value: "POLICY_VIOLATION", label: "Policy violation" },
  { value: "FRAUDULENT_SUBMISSION", label: "Fraudulent submission" },
  { value: "OTHER", label: "Other (Specify)" },
];

interface RevokeConfirmModalProps {
  applicationId: string;
  talentName: string;
  badgeName: string;
  onClose: () => void;
  onRevoked: () => void;
}

export default function RevokeConfirmModal({
  applicationId,
  talentName,
  badgeName,
  onClose,
  onRevoked,
}: RevokeConfirmModalProps) {
  const [reason, setReason] = useState<RevokeBadgeDto["revocationReason"] | "">("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await adminBadgeService.revoke(applicationId, {
        revocationReason: reason,
        revocationNote: note || undefined,
      });
      onRevoked();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">Badge Requests Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-[#FFEBEB] border border-[#FFD6D6] rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-[#E53E3E] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-bold text-gray-900">This action will remove the badge</p>
              <p className="text-[13px] text-[#E53E3E] mt-0.5">
                The talent will loose badge and must reapply
              </p>
            </div>
          </div>

          {/* Revocation Reason */}
          <div className="space-y-2">
            <p className="text-[13px] font-bold text-gray-700">Revocation Reasons</p>
            <div className="space-y-2">
              {REVOCATION_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    reason === r.value
                      ? "border-[#7300E5] bg-white"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      reason === r.value ? "border-[#7300E5]" : "border-gray-300"
                    }`}
                  >
                    {reason === r.value && (
                      <div className="w-2 h-2 rounded-full bg-[#7300E5]" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    className="hidden"
                    onChange={() => setReason(r.value)}
                  />
                  <span className="text-[13px] text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Note textarea */}
          <div className="space-y-2">
            <p className="text-[13px] font-bold text-gray-700">Revocation Reasons</p>
            <textarea
              className="w-full border-2 border-gray-100 rounded-xl p-3.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-200 resize-none transition-all"
              rows={4}
              placeholder="Explain why this badge is being revoked ........................"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold bg-[#FF3B30] text-white hover:bg-[#E5332A] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Confirm Revocation
          </button>
        </div>
      </div>
    </div>
  );
}
