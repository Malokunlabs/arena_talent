"use client";

import React from "react";
import { ArenaLevelSummary } from "@/services/levelService";

const DEFAULT_COLOR_BY_SLUG: Record<string, string> = {
  hustler: "#FACC15",
  specialist: "#38BDF8",
  pro: "#22C55E",
  lead: "#A855F7",
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `rgba(126, 0, 238, ${alpha})`;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getLevelColor(
  level?: Partial<ArenaLevelSummary> | null,
): string {
  if (level?.color) return level.color;
  const slug = (level?.slug || level?.name || "").toLowerCase();
  return DEFAULT_COLOR_BY_SLUG[slug] || "#FACC15";
}

export function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "").trim().toLowerCase();
  if (clean === "facc15") return "#D97706";
  if (clean === "38bdf8") return "#0891B2";
  if (clean === "22c55e") return "#16A34A";
  if (clean === "a855f7") return "#7E00EE";
  return hex;
}

export function LevelPill({
  level,
  fallbackName = "Hustler",
  size = "sm",
}: {
  level?: Partial<ArenaLevelSummary> | null;
  fallbackName?: string;
  size?: "xs" | "sm";
}) {
  const name = level?.name || fallbackName;
  const baseColor = getLevelColor(level ?? { name });
  const textColor = getReadableTextColor(baseColor);

  return (
    <span
      style={{
        borderColor: baseColor,
        color: textColor,
        backgroundColor: hexToRgba(baseColor, 0.08),
      }}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${
        size === "xs"
          ? "px-2 py-[1px] text-[10.5px]"
          : "px-2 py-[1px] text-[11px]"
      }`}
    >
      {level?.iconUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={level.iconUrl}
          alt=""
          className="w-3 h-3 object-contain rounded-full"
        />
      )}
      {name}
    </span>
  );
}

export function LevelEmblem({
  level,
  size = "md",
}: {
  level?: Partial<ArenaLevelSummary> | null;
  size?: "sm" | "md" | "lg";
}) {
  const color = getLevelColor(level);
  const boxSize =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
        ? "w-14 h-14"
        : "w-11 h-11";

  if (level?.iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={level.iconUrl}
        alt={level.name || "Arena Level"}
        className={`${boxSize} object-contain`}
      />
    );
  }

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(color, 0.78)}, ${color})`,
        borderColor: hexToRgba(color, 0.35),
        boxShadow: `0 6px 16px ${hexToRgba(color, 0.25)}`,
      }}
      className={`${boxSize} rotate-45 rounded-xl border flex items-center justify-center`}
    >
      <div className="w-2/3 h-1.5 bg-white/45 rounded-full -rotate-45" />
    </div>
  );
}

export function getLevelBgTint(hex: string): string {
  return hexToRgba(hex, 0.1);
}

export function getLevelTrackTint(hex: string): string {
  return hexToRgba(hex, 0.22);
}
