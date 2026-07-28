"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

function buildGu2kAuthUrl(intent: 'login' | 'signup' = 'login') {
  const base        = process.env.NEXT_PUBLIC_GU2K_BASE_URL ?? 'http://localhost:8000';
  const clientId    = process.env.NEXT_PUBLIC_GU2K_CLIENT_ID ?? '';
  const redirectUri = process.env.NEXT_PUBLIC_GU2K_REDIRECT_URI ?? '';
  const state       = crypto.randomUUID(); // CSRF protection
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'profile email phone kyc extended',
    state,
    intent,
  });
  // Store state so we can verify it on callback
  sessionStorage.setItem('gu2k_oauth_state', state);
  return `${base}/oauth/authorize?${params.toString()}`;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { email, password, setEmail, setPassword, login, isLoading, error } =
    useAuthStore();

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await login();
    if (success) {
      // Small delay to ensure state is synchronized if needed (though zustand is sync)
      const state = useAuthStore.getState();
      const user = state.user;

      if (user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Log in
            </h1>
            <p className="text-gray-500">Login to keep earning.</p>
          </div>
        </div>

        {/* GU2K SSO Button */}
        <button
          id="gu2k-sso-btn"
          type="button"
          onClick={() => { window.location.href = buildGu2kAuthUrl('login'); }}
          className="w-full flex items-center justify-center h-12 rounded-xl border-2 border-gray-200 bg-white hover:border-[#7300E5] hover:bg-purple-50 transition-all font-semibold text-gray-700 text-sm shadow-sm"
        >
          Continue with your GU2K account
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="abdphi@gmail.com"
              className="h-12 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 rounded-xl pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Forgot your password?</span>
            <Link
              href="/forgot-password"
              className="text-[#7300E5] font-semibold hover:underline"
            >
              Reset Password
            </Link>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !email || !password}
            className={`w-full h-12 ${
              email && password
                ? "bg-[#7300E5] hover:bg-[#5f00bd]"
                : "bg-[#B794F4] hover:bg-[#9F7AEA]"
            } text-white cursor-pointer font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all`}
          >
            {isLoading ? "Logging in..." : "Continue with email"}
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-500">Don&apos;t have an account? </span>
          <Link
            href="/signup"
            className="text-[#7300E5] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
