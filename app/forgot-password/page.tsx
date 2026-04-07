"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center sm:text-left">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#7300E5]">
            Forgot Password?
          </h1>
          <p className="text-gray-900 font-medium">
            No worries, we will send reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-gray-400 font-normal">
              Email Address
            </Label>
            <Input
              id="email"
              placeholder="Email Address"
              className="h-12 rounded-xl border-gray-200"
            />
          </div>

          <Button className="w-full h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100">
            Reset Password
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[#7300E5] font-bold hover:underline"
          >
            Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
