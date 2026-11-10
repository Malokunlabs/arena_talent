"use client";

import React from "react";
import { X, CheckCircle2, Lock } from "lucide-react";
import { UserLevelProgress } from "@/services/levelService";
import {
  LevelEmblem,
  LevelPill,
  getLevelColor,
  getLevelBgTint,
  getLevelTrackTint,
  getReadableTextColor,
} from "@/components/arena/LevelBadge";

interface LevelBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserLevelProgress | null;
}

export default function LevelBreakdownModal({
  isOpen,
  onClose,
  progress,
}: LevelBreakdownModalProps) {
  if (!isOpen || !progress) return null;

  const currentColor = getLevelColor(progress.currentLevel);
  const readableColor = getReadableTextColor(currentColor);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              style={{
                backgroundColor: getLevelBgTint(currentColor),
                color: readableColor,
              }}
              className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wider uppercase"
            >
              {progress.indexLabel}
            </span>
            <h2 className="text-[20px] font-bold text-black tracking-[-0.02em] mt-1.5">
              {progress.title}
            </h2>
            <p className="text-[12.5px] text-[#747682] mt-1 leading-relaxed">
              {progress.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Progress Highlight Card */}
        <div
          style={{ backgroundColor: getLevelBgTint(currentColor) }}
          className="mt-5 rounded-2xl p-4 flex items-center gap-4 border border-[#ECECF0]"
        >
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs">
            <LevelEmblem level={progress.currentLevel} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold text-black">
                <span style={{ color: readableColor }}>
                  {progress.currentLevel.name}
                </span>{" "}
                <span className="text-[#747682] font-normal text-[12px]">
                  ({progress.totalProofs}{" "}
                  {progress.totalProofs === 1 ? "proof" : "proofs"})
                </span>
              </p>
              <span className="text-[12px] font-semibold text-black">
                {progress.progressPercent}%
              </span>
            </div>
            <p className="text-[12px] text-[#747682] mt-0.5">
              {progress.nextLevel
                ? `${progress.proofsToNextLevel} more ${
                    progress.proofsToNextLevel === 1 ? "proof" : "proofs"
                  } to reach ${progress.nextLevel.name}`
                : "You've reached the highest rank in the Arena!"}
            </p>
            <div
              style={{ backgroundColor: getLevelTrackTint(currentColor) }}
              className="mt-2 h-2 w-full rounded-full overflow-hidden"
            >
              <div
                style={{
                  width: `${progress.progressPercent}%`,
                  backgroundColor: currentColor,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* All Rank Levels List */}
        <div className="mt-6 space-y-3">
          <h3 className="text-[13px] font-bold text-black uppercase tracking-wider">
            Arena Rank Levels
          </h3>

          <div className="space-y-2.5">
            {progress.levels.map((lvl) => {
              const lvlColor = getLevelColor(lvl);
              const rangeLabel =
                lvl.info?.requirementText ||
                (lvl.maxProofs !== null && lvl.maxProofs !== undefined
                  ? `${lvl.minProofs}–${lvl.maxProofs} proofs`
                  : `${lvl.minProofs}+ proofs`);
              const perks = Array.isArray(lvl.info?.perks)
                ? lvl.info.perks
                : [];

              return (
                <div
                  key={lvl.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    lvl.isCurrent
                      ? "border-[#7E00EE]/40 bg-[#FAF5FF]/40"
                      : lvl.isUnlocked
                        ? "border-[#ECECF0] bg-white"
                        : "border-[#F1F1F5] bg-[#FAFAFC] opacity-85"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <LevelPill level={lvl} />
                      <span className="text-[12px] font-semibold text-[#747682]">
                        {rangeLabel}
                      </span>
                    </div>

                    {lvl.isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7E00EE]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Current
                      </span>
                    ) : lvl.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#747682]">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  {lvl.description && (
                    <p className="text-[12px] text-[#747682] mt-2 leading-relaxed">
                      {lvl.description}
                    </p>
                  )}

                  {perks.length > 0 && (
                    <ul className="mt-2.5 space-y-1">
                      {perks.map((perk, idx) => (
                        <li
                          key={idx}
                          className="text-[11.5px] text-black flex items-center gap-2"
                        >
                          <span
                            style={{ backgroundColor: lvlColor }}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                          />
                          <span>{String(perk)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
