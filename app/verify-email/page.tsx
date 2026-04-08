"use client";

import React from "react";
import Link from "next/link";
import { Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = React.useState(false);
  const { email } = useAuthStore();

  const handleResend = async () => {
    if (!email) {
      toast({ title: "Email not found", description: "Please go to login to send a new verification link.", variant: "destructive" });
      return;
    }
    setIsResending(true);
    try {
      await authService.resendVerification({ email });
      toast({ title: "Verification sent", description: "A new verification link has been sent to your email." });
    } catch (e) {
      const err = e as Error;
      toast({ title: "Resend failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

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

        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleResend}
            disabled={isResending}
            className="w-full h-12 bg-white border border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-bold rounded-xl text-base transition-all hover:scale-[1.02]"
          >
            {isResending ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
            {isResending ? "Resending..." : "Resend Verification Link"}
          </Button>

          <Link href="/login" className="block w-full">
            <Button className="w-full h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl text-base shadow-lg shadow-purple-100 transition-all hover:scale-[1.02]">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
