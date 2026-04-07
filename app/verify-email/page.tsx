"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-[#7300E5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Check your email
            </h1>
            <p className="text-gray-500 max-w-sm mx-auto">
              We have sent a verification link to your email address. Please
              click the link to verify your account.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/login">
            <Button className="w-full h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all hover:scale-[1.02]">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
