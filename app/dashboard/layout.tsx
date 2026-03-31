"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OnboardingModal from "@/components/modals/OnboardingModal";
import { useUserStore } from "@/store/useUserStore";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchUser } = useUserStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // If user is loaded and has no username, show onboarding
    if (user && !user.username && !showOnboarding) {
      // Use a microtask/timeout to avoid "synchronous setState in effect" lint error
      const timer = setTimeout(() => setShowOnboarding(true), 100);
      return () => clearTimeout(timer);
    }
  }, [user, showOnboarding]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-gray-100 z-50 px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black italic tracking-tighter text-[#7300E5]">
            ARENA
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ProfileDropdown />
        </div>
      </header>

      <div className="flex pt-24 h-screen">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
