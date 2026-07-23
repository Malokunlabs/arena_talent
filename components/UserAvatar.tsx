"use client";

import React, { useState } from "react";
import Image from "next/image";

/**
 * 10-colour palette — each item is [bgClass, textClass].
 * The colour is picked deterministically from the user's name so the same
 * person always gets the same colour across the app.
 */
const PALETTE: [string, string][] = [
  ["#7300E5", "#ffffff"], // arena purple
  ["#2563EB", "#ffffff"], // blue
  ["#059669", "#ffffff"], // emerald
  ["#D97706", "#ffffff"], // amber
  ["#DC2626", "#ffffff"], // red
  ["#7C3AED", "#ffffff"], // violet
  ["#0891B2", "#ffffff"], // cyan
  ["#DB2777", "#ffffff"], // pink
  ["#EA580C", "#ffffff"], // orange
  ["#4338CA", "#ffffff"], // indigo
];

function pickColour(name: string): [string, string] {
  if (!name) return PALETTE[0];
  // Sum char codes → stable index
  const sum = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserAvatarProps {
  /** Full name of the user — used to generate initials & pick colour */
  name: string;
  /** URL of the profile image. When falsy, shows the initials fallback */
  src?: string | null;
  /** Diameter in pixels (renders as a square that is rounded-full) */
  size?: number;
  className?: string;
}

export default function UserAvatar({
  name,
  src,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;

  const [bg, fg] = pickColour(name);
  const initials = getInitials(name);

  const fontSize = Math.max(10, Math.round(size * 0.36));

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        /* Initials fallback */
        <div
          className="w-full h-full flex items-center justify-center select-none font-bold"
          style={{ backgroundColor: bg, color: fg, fontSize }}
          aria-label={name}
        >
          {initials}
        </div>
      ) : (
        <Image
          src={src!}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
