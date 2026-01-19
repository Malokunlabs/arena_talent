"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";

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
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    validateStep1,
    validate,
  } = useAuthStore();

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Form is valid", { fullName, email, password });
      // Proceed with signup logic
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 pt-24 sm:pt-32 transition-all duration-300 ease-in-out">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Sign Up
            </h1>
            <p className="text-gray-500">
              Let&apos;s finish setting up your account.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Abdul Mustapha"
                  className={cn(
                    "h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#7300E5]/20",
                    errors.fullName &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="abdphi@gmail.com"
                  className={cn(
                    "h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#7300E5]/20",
                    errors.email && "border-red-500 focus-visible:ring-red-500",
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 mt-2 transition-all hover:scale-[1.02]"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#7300E5]/20 pr-10",
                      errors.password &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
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
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "h-12 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#7300E5]/20 pr-10",
                      errors.confirmPassword &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-1/3 h-12 border-gray-300 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="w-2/3 h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm space-y-4">
          <div className="text-center text-xs text-gray-400 px-4">
            By clicking &quot;Continue&quot;, you agree to this website&apos;s{" "}
            <span className="text-[#7300E5] cursor-pointer hover:underline">
              privacy policy
            </span>{" "}
            and{" "}
            <span className="text-[#7300E5] cursor-pointer hover:underline">
              terms of service
            </span>
            .
          </div>

          <div>
            <span className="text-gray-500">Already Have an account? </span>
            <Link
              href="/login"
              className="text-[#7300E5] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
