"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { TrophyGraphic, GreenSquiggle } from "@/components/arena/HeroBannerSvg";
import { HeroArenaSwitcher } from "@/components/TopEcosystemBar";
import { toast } from "sonner";

function buildGu2kAuthUrl(intent: "login" | "signup" = "signup") {
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

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    fullName,
    email,
    password,
    confirmPassword,
    errors,
    isLoading,
    error,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    validateStep1,
    validate,
    signup,
  } = useAuthStore();

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const router = useRouter();

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (validate()) {
      const success = await signup();
      if (success) {
        router.push("/verify-email");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] grid grid-cols-1 lg:grid-cols-[54%_46%] bg-white">
      {/* Left Purple Hero Panel */}
      <div className="relative overflow-hidden bg-[#7E00EE] flex flex-col items-center justify-between pt-12 pb-0 px-6 min-h-[380px] lg:min-h-[calc(100vh-44px)] select-none">
        <div className="relative z-20 flex flex-col items-center text-center max-w-[460px]">
          <HeroArenaSwitcher />

          <h1 className="mt-5 text-[44px] sm:text-[56px] font-semibold text-white leading-[1.06] tracking-[-0.03em]">
            Share your
            <br />
            work, level up
          </h1>

          <GreenSquiggle className="w-[240px] h-5 mt-3" />
        </div>

        <div className="relative z-10 w-full max-w-[460px] h-[340px] sm:h-[400px] mt-4">
          <TrophyGraphic className="w-full h-full" />
        </div>
      </div>

      {/* Right Sign-up Form Panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-[28px] font-bold text-black tracking-[-0.03em]">
              Create New Account
            </h2>
            <p className="text-[13px] text-[#747682]">
              Set up your Arena account to share proof of your work.
            </p>
          </div>

          {/* GU2K SSO Option on Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                id="gu2k-signup-btn"
                type="button"
                onClick={() => {
                  window.location.href = buildGu2kAuthUrl("signup");
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

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-[#ECECF0]" />
                <span className="text-[11px] text-[#747682] font-medium">
                  or sign up with email
                </span>
                <div className="flex-1 h-px bg-[#ECECF0]" />
              </div>
            </div>
          )}

          {/* Step 1 / Step 2 Form */}
          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-[12px] font-semibold text-black">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Abdul Mustapha"
                    className={cn(
                      "h-11 rounded-xl border-[#E4E4EA] text-[13px]",
                      errors.fullName &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[12px] font-semibold text-black">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    placeholder="abdphi@gmail.com"
                    className={cn(
                      "h-11 rounded-xl border-[#E4E4EA] text-[13px]",
                      errors.email &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-[#7E00EE] hover:bg-[#6a00c9] text-white font-semibold rounded-xl text-[13px] mt-1 transition-all cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[12px] font-semibold text-black">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "h-11 rounded-xl border-[#E4E4EA] text-[13px] pr-10",
                        errors.password &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747682] hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[12px] font-semibold text-black">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "h-11 rounded-xl border-[#E4E4EA] text-[13px] pr-10",
                        errors.confirmPassword &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747682] hover:text-black"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="w-1/3 h-12 border-[#E4E4EA] text-[#747682] font-semibold rounded-xl hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-2/3 h-12 bg-[#7E00EE] hover:bg-[#6a00c9] text-white font-semibold rounded-xl text-[13px]"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center space-y-3 pt-2">
            <p className="text-[11px] text-[#747682] px-2">
              By continuing, you agree to Arena&apos;s{" "}
              <span className="text-[#7E00EE] cursor-pointer hover:underline">
                privacy policy
              </span>{" "}
              and{" "}
              <span className="text-[#7E00EE] cursor-pointer hover:underline">
                terms of service
              </span>
              .
            </p>

            <div className="text-[13px]">
              <span className="text-[#747682]">Already have an account? </span>
              <Link
                href="/login"
                className="text-[#7E00EE] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
