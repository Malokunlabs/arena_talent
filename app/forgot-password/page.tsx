"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setIsSuccess(true);
      toast.success("Reset link sent if account exists!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Forgot Password
            </h1>
            <p className="text-gray-500 max-w-sm">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-[#F7EFFD] p-6 rounded-2xl border border-[#D5B8FF] space-y-4 text-center">
            <div className="w-12 h-12 bg-[#7300E5] rounded-full flex items-center justify-center mx-auto text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-gray-900">Email Sent!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-gray-900">{email}</span>,
                you will receive a reset link shortly.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center text-[#7300E5] font-semibold hover:underline"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="abdphi@gmail.com"
                className="h-12 rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full h-12 ${
                email ? "bg-[#7300E5] hover:bg-[#5f00bd]" : "bg-[#B794F4]"
              } text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-500 hover:text-[#7300E5] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
