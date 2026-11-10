"use client";

import React from "react";

/**
 * Trophy cup + sparkles + ribbons SVG graphic used in the
 * "Share your work, level up" purple banner and the split-screen Auth hero.
 */
export function TrophyGraphic({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Subtle darker purple background arcs */}
      <circle cx="290" cy="240" r="160" fill="#6F00E0" fillOpacity="0.45" />
      <circle cx="90" cy="60" r="110" fill="#8B1AFF" fillOpacity="0.3" />

      {/* Confetti / Geometric accents */}
      {/* Yellow trapezoid left */}
      <polygon
        points="62,92 104,98 98,120 56,115"
        fill="#FAFF00"
        stroke="#0F0F12"
        strokeWidth="1.5"
      />
      {/* Lilac half-circle left with dark shadow */}
      <path
        d="M18 158 C28 134, 58 134, 70 158 L44 196 Z"
        fill="#0F0F12"
      />
      <path
        d="M12 152 C26 126, 60 130, 68 160 L38 192 Z"
        fill="#E5C7FF"
        stroke="#0F0F12"
        strokeWidth="1.5"
      />

      {/* Right lilac trapezoid */}
      <polygon
        points="286,92 310,104 290,142 272,132"
        fill="#D8B4FE"
        stroke="#0F0F12"
        strokeWidth="1.5"
      />

      {/* Right black rectangle confetti */}
      <polygon
        points="296,154 316,150 320,168 298,172"
        fill="#18181B"
      />

      {/* Yellow circle bottom right with shadow */}
      <circle cx="268" cy="258" r="21" fill="#18181B" />
      <circle
        cx="272"
        cy="255"
        r="21"
        fill="#FAFF00"
        stroke="#0F0F12"
        strokeWidth="1.5"
      />

      {/* Trophy Handles */}
      {/* Left Handle */}
      <path
        d="M114 132 C74 114, 62 190, 108 206 C118 210, 126 202, 128 194"
        stroke="#0F0F12"
        strokeWidth="1.8"
        fill="#7E00EE"
      />
      <path
        d="M112 145 C86 135, 78 182, 110 194"
        stroke="#0F0F12"
        strokeWidth="1.8"
        fill="none"
      />

      {/* Right Handle */}
      <path
        d="M236 132 C276 114, 288 190, 242 206 C232 210, 224 202, 222 194"
        stroke="#0F0F12"
        strokeWidth="1.8"
        fill="#7E00EE"
      />
      <path
        d="M238 145 C264 135, 272 182, 240 194"
        stroke="#0F0F12"
        strokeWidth="1.8"
        fill="none"
      />

      {/* Trophy Cup Body */}
      <path
        d="M106 86 L246 86 L232 175 C225 212, 195 228, 174 228 C153 228, 123 212, 116 175 Z"
        fill="#7E00EE"
        stroke="#0F0F12"
        strokeWidth="1.8"
      />
      {/* Top Rim of Cup */}
      <ellipse
        cx="176"
        cy="86"
        rx="70"
        ry="5"
        fill="#5900B3"
        stroke="#0F0F12"
        strokeWidth="1.6"
      />

      {/* Big White "1" on Trophy */}
      <polygon
        points="168,112 196,112 182,190 150,190 160,138 148,138"
        fill="#F4F4F6"
        stroke="#0F0F12"
        strokeWidth="1.8"
      />

      {/* Trophy Stem */}
      <polygon
        points="166,227 180,227 168,288 152,288"
        fill="#7E00EE"
        stroke="#0F0F12"
        strokeWidth="1.8"
      />
      <polygon
        points="172,227 178,227 166,288 160,288"
        fill="#0F0F12"
      />

      {/* Swirling Ribbons */}
      <path
        d="M84 252 C84 228, 220 225, 232 252 C244 278, 92 284, 84 252 Z"
        fill="none"
        stroke="#0F0F12"
        strokeWidth="1.8"
      />
      <path
        d="M90 245 C120 228, 195 230, 224 248 L220 260 C190 244, 122 242, 86 258 Z"
        fill="#18181B"
      />
      <path
        d="M92 268 C140 288, 238 258, 276 178 L272 198 C236 274, 142 304, 86 282 Z"
        fill="#7E00EE"
        stroke="#0F0F12"
        strokeWidth="1.8"
      />

      {/* Sparkle / Starburst on Top Right of Cup */}
      <path
        d="M225 42 L234 78 L288 70 L240 90 L268 128 L226 98 L178 134 L214 90 L152 80 L216 78 Z"
        fill="#E9D5FF"
        stroke="#0F0F12"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function GreenSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 13 C12 3, 20 3, 27 12 C34 20, 42 3, 51 11 C60 19, 68 3, 77 11 C86 19, 96 4, 106 11 C116 18, 126 4, 137 11 C148 18, 160 4, 174 10 C188 16, 204 5, 227 8"
        stroke="#00FF38"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
