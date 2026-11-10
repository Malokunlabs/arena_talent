"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { TrophyGraphic, GreenSquiggle } from "@/components/arena/HeroBannerSvg";
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
    scope: "profile email phone kyc extended",
    state,
    intent,
  });
  sessionStorage.setItem("gu2k_oauth_state", state);
  return `${base}/oauth/authorize?${params.toString()}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, setEmail, setPassword, login, isLoading, error } =
    useAuthStore();

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await login();
    if (success) {
      const state = useAuthStore.getState();
      if (state.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] grid grid-cols-1 lg:grid-cols-[54%_46%] bg-white">
      {/* Left Purple Hero Panel */}
      <div className="relative overflow-hidden bg-[#7E00EE] flex flex-col items-center justify-between pt-12 pb-0 px-6 min-h-[420px] lg:min-h-[calc(100vh-44px)] select-none">
        {/* Top "Arena v" Switcher Pill + Headline */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-[460px]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 border-white text-white text-[18px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Arena</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-2xl bg-[#27272A] text-white shadow-xl py-2 px-1.5 text-left z-30 border border-white/10">
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-[12px] font-medium hover:bg-white/10 transition-colors"
                >
                  Arena - Share Proof
                </Link>
                <a
                  href={
                    process.env.NEXT_PUBLIC_GU2K_BASE_URL ??
                    "https://geturgent2k.com"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3.5 py-2 rounded-xl text-[12px] font-medium hover:bg-white/10 transition-colors text-white/85"
                >
                  GU2K - Get Gigs
                </a>
              </div>
            )}
          </div>

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
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
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

            {/* Create New Account Button -> normal /signup */}
            <Link
              href="/signup"
              className="w-full h-12 rounded-xl bg-[#7E00EE] hover:bg-[#6a00c9] text-white font-semibold text-[13px] flex items-center justify-center transition-colors shadow-sm"
            >
              Create New Account
            </Link>
          </div>

          {/* Optional Email Sign In for existing email/password users */}
          <div className="pt-2">
            {!showEmailForm ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="text-[12px] font-medium text-[#747682] hover:text-black underline underline-offset-4 cursor-pointer"
                >
                  Sign in with email &amp; password instead
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleEmailLogin}
                className="space-y-3.5 pt-3 border-t border-[#EFEFF3] animate-in fade-in duration-200"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-[12px] font-semibold text-black"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-semibold text-black"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-medium text-[#7E00EE] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747682] hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-11 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In with Email"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
