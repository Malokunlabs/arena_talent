"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";

export const ECOSYSTEM_LINKS = {
  gu2k: "https://geturgent2k.com/",
  arena: "/",
  brands: "https://geturgent2k.com/brands",
  daily: "https://gu2kdaily.com/daily",
} as const;

export function EcosystemDropdownMenu({
  onSelect,
  widthClass = "w-52",
}: {
  onSelect: () => void;
  widthClass?: string;
}) {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 mt-2 ${widthClass} rounded-2xl bg-[#27272A] text-white shadow-xl py-2 px-1.5 text-left z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-150`}
    >
      <Link
        href={ECOSYSTEM_LINKS.arena}
        onClick={onSelect}
        className="block px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white bg-white/10 transition-colors"
      >
        Arena - Share Proof
      </Link>
      <a
        href={ECOSYSTEM_LINKS.gu2k}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onSelect}
        className="block px-3.5 py-2 rounded-xl text-[12px] font-medium hover:bg-white/10 transition-colors text-white/85"
      >
        GU2K - Earn Gigs
      </a>
    </div>
  );
}

export function HeroArenaSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 border-white text-white text-[18px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
      >
        <span>Arena</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <EcosystemDropdownMenu onSelect={() => setOpen(false)} />}
    </div>
  );
}

export default function TopEcosystemBar() {
  const { isAuthenticated, initAuth } = useAuthStore();
  const { fetchUser } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-11 bg-[#F9F9FB] border-b border-[#ECECEE] px-4 md:px-6 flex items-center select-none">
      {/* Desktop / Tablet Tab Strip */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar h-full text-[12px] tracking-[-0.01em]">
        <a
          href={ECOSYSTEM_LINKS.gu2k}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          GU2K - Earn Gigs
        </a>

        <Link
          href={ECOSYSTEM_LINKS.arena}
          className="px-5 h-[34px] mt-[7px] bg-[#EFEFF3] rounded-t-xl flex items-center text-black font-semibold whitespace-nowrap border-t border-x border-[#E4E4E9]"
        >
          Arena - Share Proof
        </Link>

        <a
          href={ECOSYSTEM_LINKS.brands}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          Brands - Post Gigs
        </a>

        <span className="h-3.5 w-px bg-[#DCDCE2] mx-1 shrink-0" />

        <a
          href={ECOSYSTEM_LINKS.daily}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          Daily - Play &amp; Earn
        </a>
      </div>

      {/* Mobile Ecosystem Switcher Dropdown */}
      <div
        ref={dropdownRef}
        className="flex sm:hidden w-full items-center justify-center relative"
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-[#E4E4E9] text-[12.5px] font-semibold text-black shadow-2xs cursor-pointer"
        >
          <span>Arena</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#747682] transition-transform ${
              mobileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileMenuOpen && (
          <EcosystemDropdownMenu
            widthClass="w-[230px]"
            onSelect={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
