"use client";

import React from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { TrophyGraphic, GreenSquiggle } from "@/components/arena/HeroBannerSvg";
import { HeroArenaSwitcher } from "@/components/TopEcosystemBar";
import { toast } from "sonner";

function buildGu2kAuthUrl(intent: "login" | "signup" = "login") {
  const base =
    process.env.NEXT_PUBLIC_GU2K_BASE_URL ?? "http://localhost:8000";
  const clientId = process.env.NEXT_PUBLIC_GU2K_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_GU2K_REDIRECT_URI ?? "";
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "profile email",
    state,
    intent,
    prompt: "select_account",
  });
  sessionStorage.setItem("gu2k_oauth_state", state);
  return `${base}/oauth/authorize?${params.toString()}`;
}

export default function LoginPage() {
  const { error } = useAuthStore();

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-44px)] grid grid-cols-1 lg:grid-cols-[54%_46%] bg-white">
      {/* Left Purple Hero Panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#7E00EE] flex-col items-center justify-between pt-12 pb-0 px-6 lg:min-h-[calc(100vh-44px)] select-none">
        {/* Top "Arena v" Switcher Pill + Headline */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-[460px]">
          <HeroArenaSwitcher />

          <h1 className="mt-5 text-[44px] sm:text-[56px] font-semibold text-white leading-[1.06] tracking-[-0.03em]">
            Share your
            <br />
            work, level up
          </h1>

          <GreenSquiggle className="w-[240px] h-5 mt-3" />
        </div>

        {/* Bottom Trophy Illustration */}
        <div className="relative z-10 w-full max-w-[460px] h-[340px] sm:h-[400px] mt-4">
          <TrophyGraphic className="w-full h-full" />
        </div>
      </div>

      {/* Right Sign-in Panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 min-h-[100svh] lg:min-h-0">
        <div className="w-full max-w-[340px] space-y-7">
          <div className="text-center space-y-2">
            <h2 className="text-[28px] font-bold text-black tracking-[-0.03em]">
              Sign in to Arena
            </h2>
            <p className="text-[13px] text-[#747682] leading-relaxed px-2">
              Sign in to level up and gain points from sharing proof of your
              work on GU2K
            </p>
          </div>

          <div className="space-y-3">
            {/* Continue with GU2K Button */}
            <button
              id="gu2k-sso-btn"
              type="button"
              onClick={() => {
                window.location.href = buildGu2kAuthUrl("login");
              }}
              className="w-full h-12 px-4 rounded-xl border border-[#E4E4EA] bg-white hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer"
            >
              <Image
                src="/icons/gu2k-logo.svg"
                alt="GU2K"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span className="text-[13px] font-semibold text-black flex-1 text-center pr-6">
                Continue with GU2K
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
