"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isInitialized,
    user: authUser,
    initAuth,
    setToken,
    setUser,
    logout,
  } = useAuthStore();
  const {
    user: profileUser,
    fetchUser,
    clearUser,
  } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const effectiveRole = authUser?.role || profileUser?.role;
    if (effectiveRole === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (!effectiveRole) {
      fetchUser();
    }
  }, [isInitialized, isAuthenticated, authUser?.role, profileUser?.role, fetchUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await authService.login({
        email: email.trim(),
        password,
      });

      const loggedUser = result.loggedInUser || result.user;
      if (!loggedUser || loggedUser.role !== "ADMIN") {
        authService.logout();
        logout();
        clearUser();
        const denial =
          "Access denied. This portal is restricted to Arena administrators.";
        setErrorMsg(denial);
        toast.error(denial);
        return;
      }

      setToken(result.accessToken);
      setUser({
        id: loggedUser.id,
        email: loggedUser.email,
        username: loggedUser.username,
        avatarUrl: loggedUser.avatarUrl,
        role: loggedUser.role,
      });
      await fetchUser(true);
      router.replace("/admin/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid administrator credentials.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#F9F9FB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-white border border-[#ECECF0] rounded-3xl shadow-sm p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-2.5">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#7300E5]/10 text-[#7300E5] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-[24px] font-bold text-black tracking-[-0.03em]">
            Arena Admin
          </h1>
          <p className="text-[13px] text-[#747682] leading-relaxed">
            Sign in with an administrator account to manage Arena moderation,
            talents, and payouts.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-[12px] font-semibold text-black"
            >
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@arena.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7300E5] disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-[12px] font-semibold text-black"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7300E5] disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747682] hover:text-black cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            disabled={isSubmitting || !email.trim() || !password}
            className="w-full h-11 rounded-xl bg-[#7300E5] hover:bg-[#5f00bd] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In to Admin"
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#EFEFF3] text-center">
          <Link
            href="/login"
            className="text-[12px] font-medium text-[#747682] hover:text-black transition-colors"
          >
            Back to Talent Login
          </Link>
        </div>
      </div>
    </div>
  );
}

