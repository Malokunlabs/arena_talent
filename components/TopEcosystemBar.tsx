"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";

const gu2kBase = process.env.NEXT_PUBLIC_GU2K_BASE_URL ?? "https://geturgent2k.com";

export default function TopEcosystemBar() {
  const { isAuthenticated, initAuth } = useAuthStore();
  const { fetchUser } = useUserStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-11 bg-[#F9F9FB] border-b border-[#ECECEE] px-4 md:px-6 flex items-center select-none">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar h-full text-[12px] tracking-[-0.01em]">
        <a
          href={gu2kBase}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          GU2K - Earn Gigs
        </a>

        <Link
          href="/"
          className="px-5 h-[34px] mt-[7px] bg-[#EFEFF3] rounded-t-xl flex items-center text-black font-semibold whitespace-nowrap border-t border-x border-[#E4E4E9]"
        >
          Arena - Share Proof
        </Link>

        <a
          href={`${gu2kBase}/brands`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          Brands - Post Gigs
        </a>

        <span className="h-3.5 w-px bg-[#DCDCE2] mx-1 shrink-0" />

        <a
          href={`${gu2kBase}/daily`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 h-full flex items-center text-[#747682] hover:text-black font-medium whitespace-nowrap transition-colors"
        >
          Daily - Play &amp; Earn
        </a>
      </div>
    </header>
  );
}
