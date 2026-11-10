"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { gigService, Gig } from "@/services/gigService";

interface SelectGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGigId?: string | null;
  onSelectGig: (gig: Gig) => void;
}

const FALLBACK_GIGS: Gig[] = [
  {
    id: "fallback-gig-1",
    gu2kGigId: "gu2k_gig_001",
    title: "Customer Experience Evaluation",
    location: "Victoria Island, Nigeria",
    status: "COMPLETED",
    category: "Market Analysis Facilitator",
    companyName: "GU2K",
    completedAt: "2025-08-19T00:00:00.000Z",
    syncedAt: new Date().toISOString(),
  },
  {
    id: "fallback-gig-2",
    gu2kGigId: "gu2k_gig_002",
    title: "Mystery Shopping Exercise",
    location: "Victoria Island, Nigeria",
    status: "COMPLETED",
    category: "Retail Insights Analyst",
    companyName: "GU2K",
    completedAt: "2025-09-19T00:00:00.000Z",
    syncedAt: new Date().toISOString(),
  },
  {
    id: "fallback-gig-3",
    gu2kGigId: "gu2k_gig_003",
    title: "Amplification for Chicken Republic",
    location: "Lekki, Lagos",
    status: "COMPLETED",
    category: "Field Operations Coordinator",
    companyName: "Chicken Republic",
    completedAt: "2025-01-19T00:00:00.000Z",
    syncedAt: new Date().toISOString(),
  },
  {
    id: "fallback-gig-4",
    gu2kGigId: "gu2k_gig_004",
    title: "Cadbury Market Survey",
    location: "Victoria Island, Nigeria",
    status: "COMPLETED",
    category: "Market Analysis Facilitator",
    companyName: "Cadbury",
    completedAt: "2025-10-19T00:00:00.000Z",
    syncedAt: new Date().toISOString(),
  },
];

function formatCompletedDate(dateStr?: string | null) {
  if (!dateStr) return "Completed recently";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Completed recently";
  return `Completed ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export default function SelectGigModal({
  isOpen,
  onClose,
  selectedGigId,
  onSelectGig,
}: SelectGigModalProps) {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(
    selectedGigId ?? null,
  );

  useEffect(() => {
    setTempSelectedId(selectedGigId ?? null);
  }, [selectedGigId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadGigs = async () => {
      setLoading(true);
      try {
        const res = await gigService.getGigs({ limit: 30 });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (!cancelled) {
          if (list.length > 0) {
            setGigs(list);
            if (!tempSelectedId) {
              setTempSelectedId(list[0].id);
            }
          } else {
            // Try background sync once if empty
            try {
              await gigService.syncGigs(false);
              const syncedRes = await gigService.getGigs({ limit: 30 });
              const syncedList = Array.isArray(syncedRes)
                ? syncedRes
                : syncedRes?.data || [];
              setGigs(syncedList.length > 0 ? syncedList : FALLBACK_GIGS);
              if (!tempSelectedId) {
                setTempSelectedId(
                  (syncedList[0] ?? FALLBACK_GIGS[0])?.id ?? null,
                );
              }
            } catch {
              setGigs(FALLBACK_GIGS);
              if (!tempSelectedId) {
                setTempSelectedId(FALLBACK_GIGS[0].id);
              }
            }
          }
        }
      } catch {
        if (!cancelled) {
          setGigs(FALLBACK_GIGS);
          if (!tempSelectedId) {
            setTempSelectedId(FALLBACK_GIGS[0].id);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGigs();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const chosen = gigs.find((g) => g.id === tempSelectedId) || gigs[0];
    if (chosen) {
      onSelectGig(chosen);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Select a Gig to talk about
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gig List */}
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#7E00EE]" />
          </div>
        ) : (
          <div className="max-h-[340px] overflow-y-auto pr-1 divide-y divide-[#F0F0F4]">
            {gigs.map((gig) => {
              const isSelected = tempSelectedId === gig.id;
              return (
                <button
                  key={gig.id}
                  type="button"
                  onClick={() => setTempSelectedId(gig.id)}
                  className="w-full py-4 flex items-center justify-between gap-4 text-left group hover:bg-gray-50/60 transition-colors px-1"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-black truncate">
                      {gig.title}
                    </p>
                    <p className="text-[12px] text-[#747682] mt-0.5 truncate">
                      {gig.location || "Lagos, Nigeria"} &bull;{" "}
                      {formatCompletedDate(gig.completedAt)}
                    </p>
                  </div>

                  {/* Radio circle */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-[#7E00EE] border-2"
                        : "border-[#D4D4DC] group-hover:border-[#747682]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7E00EE]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Submit CTA */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || gigs.length === 0}
            className="w-full h-12 rounded-2xl bg-[#7E00EE] hover:bg-[#6b00cc] disabled:opacity-50 text-white font-semibold text-[14px] transition-all cursor-pointer shadow-sm"
          >
            Share Proof of Gig
          </button>
        </div>
      </div>
    </div>
  );
}
