"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, Search, RefreshCw, Briefcase } from "lucide-react";
import { gigService, Gig } from "@/services/gigService";
import { toast } from "sonner";

interface SelectGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGigId?: string | null;
  onSelectGig: (gig: Gig) => void;
}

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
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedId, setTempSelectedId] = useState<string | null>(
    selectedGigId ?? null,
  );
  const didAutoSyncRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedId(selectedGigId ?? null);
      setError(null);
    } else {
      setSearchQuery("");
      didAutoSyncRef.current = false;
    }
  }, [selectedGigId, isOpen]);

  const fetchGigs = useCallback(
    async (queryText: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await gigService.getGigs({
          limit: 50,
          search: queryText || undefined,
        });
        let list = Array.isArray(res) ? res : res?.data || [];

        // If local gig cache is empty on initial load, trigger backend GU2K sync once
        if (list.length === 0 && !queryText.trim() && !didAutoSyncRef.current) {
          didAutoSyncRef.current = true;
          try {
            await gigService.syncGigs(false);
            const syncedRes = await gigService.getGigs({ limit: 50 });
            list = Array.isArray(syncedRes) ? syncedRes : syncedRes?.data || [];
          } catch {
            // Leave empty list if sync fails without faking gigs
          }
        }

        setGigs(list);
        setTempSelectedId((prev) => {
          if (prev && list.some((g) => g.id === prev)) return prev;
          return list[0]?.id ?? null;
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load gigs from server";
        setError(msg);
        setGigs([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchGigs(searchQuery);
    }, searchQuery ? 250 : 0);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery, fetchGigs]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await gigService.syncGigs(false);
      await fetchGigs(searchQuery);
      toast.success(
        result?.synced
          ? `Synced ${result.synced} gig${result.synced === 1 ? "" : "s"} from GU2K`
          : "Gigs refreshed",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync gigs");
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirm = () => {
    const chosen = gigs.find((g) => g.id === tempSelectedId) || gigs[0];
    if (chosen) {
      onSelectGig(chosen);
      onClose();
    }
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
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Select a Gig to talk about
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncing || loading}
              title="Sync latest gigs from GU2K"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin text-[#7E00EE]" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#747682] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gigs by title, location, or company..."
            className="w-full h-10 pl-9.5 pr-3.5 rounded-xl border border-[#E6E6EC] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] transition-colors"
          />
        </div>

        {/* Gig List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#7E00EE]" />
            <p className="text-[12.5px] text-[#747682]">Loading GU2K gigs...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-[13.5px] text-red-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => fetchGigs(searchQuery)}
              className="px-4 h-9 rounded-xl border border-[#E5E7EB] text-[12.5px] font-medium text-black hover:bg-gray-50 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : gigs.length === 0 ? (
          <div className="py-12 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#7E00EE] flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-[14px] font-semibold text-black">
              {searchQuery.trim()
                ? "No matching gigs found"
                : "No GU2K gigs available yet"}
            </p>
            <p className="text-[12.5px] text-[#747682]">
              {searchQuery.trim()
                ? "Try a different keyword."
                : "Click sync below to pull your latest completed gigs from GU2K."}
            </p>
            {!searchQuery.trim() && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncing}
                className="mt-1 px-4 h-9 rounded-xl border border-[#E5E7EB] text-[12.5px] font-medium text-black hover:bg-gray-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
                />
                Sync from GU2K
              </button>
            )}
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto pr-1 divide-y divide-[#F0F0F4]">
            {gigs.map((gig) => {
              const isSelected = tempSelectedId === gig.id;
              return (
                <button
                  key={gig.id}
                  type="button"
                  onClick={() => setTempSelectedId(gig.id)}
                  className="w-full py-4 flex items-center justify-between gap-4 text-left group hover:bg-gray-50/60 transition-colors px-1 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-black truncate">
                      {gig.title}
                    </p>
                    <p className="text-[12px] text-[#747682] mt-0.5 truncate">
                      {gig.companyName ? `${gig.companyName} • ` : ""}
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
