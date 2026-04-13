"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Reset token is missing. Please check your email link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      toast.success("Password reset successful!");

      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error.message || "Failed to reset password. The link may have expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto text-[#16A34A]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Great News!</h1>
            <p className="text-gray-500">
              Your password has been reset successfully. You will be redirected
              to the login page in a few seconds.
            </p>
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="w-full h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl shadow-lg shadow-purple-100 transition-all"
          >
            Login Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h1>
            <p className="text-gray-500">
              Create a strong new password for your account.
            </p>
          </div>
        </div>

        {!token ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center space-y-4">
            <p className="text-red-700 text-sm font-medium leading-relaxed">
              The reset link appears to be invalid or incomplete. Please request
              a new reset link from the forgot password page.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-red-700 font-bold hover:underline"
            >
              Go to Forgot Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12 rounded-xl"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className={`w-full h-12 ${
                password && confirmPassword
                  ? "bg-[#7300E5] hover:bg-[#5f00bd]"
                  : "bg-[#B794F4]"
              } text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
