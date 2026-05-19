"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Settings, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

type NavItem = {
  title: string;
  href: string;
  iconSrc?: string;
  LucideIcon?: React.ElementType;
  badge?: number | string;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "MENU",
    items: [
      { title: "Overview", href: "/dashboard", iconSrc: "/dashboard-icons/overview-icon.svg" },
      { title: "My Proofs", href: "/dashboard/proofs", iconSrc: "/dashboard-icons/my-proof-icon.svg" },
      { title: "Daily Pulse", href: "/dashboard/pulse", iconSrc: "/dashboard-icons/daily-pulse.svg" },
      { title: "Arena Feed", href: "/dashboard/arena-feed", iconSrc: "/dashboard-icons/arena-feed.svg" },
    ],
  },
  {
    title: "TALENT",
    items: [
      { title: "My Profile", href: "/dashboard/profile", iconSrc: "/dashboard-icons/my-profile-icon.svg" },
      { title: "Hire Requests", href: "/dashboard/requests/jobs", iconSrc: "/dashboard-icons/hire-request-icon.svg" },
      { title: "Collaborations", href: "/dashboard/requests/collaboration", iconSrc: "/dashboard-icons/collaborations-icon.svg" },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { title: "My Stats", href: "/dashboard/stats", iconSrc: "/dashboard-icons/my-stats-icon.svg" },
      { title: "Settings", href: "/dashboard/settings", LucideIcon: Settings },
    ],
  },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useUserStore();

  const getInitials = () => {
    if (!user) return "AT";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white lg:border-r lg:border-gray-100">
      {/* Mobile close button (header in mobile view) */}
      <div className="lg:hidden flex items-center justify-end p-4 border-b border-gray-100">
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 mb-3 text-[11px] font-bold text-gray-500 tracking-wider">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                // Determine if active: simple prefix match or exact match
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <div
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 rounded-2xl transition-colors group",
                        isActive
                          ? "bg-[#F4ECFF] text-[#7300E5]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {item.iconSrc ? (
                          <div className={cn(
                            "relative w-[18px] h-[18px] flex items-center justify-center transition-all",
                            !isActive && "grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-[50%]"
                          )}>
                            <Image src={item.iconSrc} alt={item.title} fill className="object-contain" />
                          </div>
                        ) : item.LucideIcon ? (
                          <item.LucideIcon className={cn(
                            "w-[18px] h-[18px]",
                            isActive ? "text-[#7300E5]" : "text-gray-500 group-hover:text-gray-600"
                          )} />
                        ) : null}
                        <span className={cn(
                          "text-[15px]",
                          isActive ? "font-semibold" : "font-medium"
                        )}>{item.title}</span>
                      </div>
                      {item.badge && (
                        <div className="bg-[#7300E5] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {item.badge}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Summary */}
      <div className="p-4 mt-auto">
        <Link href="/dashboard/profile" onClick={onClose}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-[42px] h-[42px] rounded-full bg-[#F4ECFF] text-[#7300E5] flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user ? `${user.firstName} ${user.lastName}` : "Arena Talent"}
              </p>
              <p className="text-[13px] text-gray-500 truncate">
                Level {user?.progressIndex || 6} • {user?.piScore || 89} PI
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[60] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 lg:top-24 left-0 z-[70] lg:z-10 h-screen lg:h-[calc(100vh-6rem)] w-[260px] bg-white transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
}
