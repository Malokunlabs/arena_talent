"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ArenaShell from "@/components/arena/ArenaShell";
import OnboardingModal from "@/components/modals/OnboardingModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, initAuth } = useAuthStore();
  const { user, fetchUser } = useUserStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    fetchUser();
  }, [isInitialized, isAuthenticated, fetchUser, router]);

  useEffect(() => {
    if (user && !user.username && !showOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 100);
      return () => clearTimeout(timer);
    }
  }, [user, showOnboarding]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-44px)] bg-white flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#7E00EE]" />
      </div>
    );
  }

  if (pathname?.startsWith("/dashboard/profile")) {
    return (
      <>
        {children}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      </>
    );
  }

  return (
    <ArenaShell showRightSidebar={false}>
      {children}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </ArenaShell>
  );
}
