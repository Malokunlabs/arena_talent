"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Collaborate Requests",
    href: "/dashboard/requests/collaboration",
    icon: Users,
  },
  {
    title: "Job Requests",
    href: "/dashboard/requests/jobs",
    icon: Briefcase,
  },
  {
    title: "My Proofs",
    href: "/dashboard/posts",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto">
      <nav className="flex-1 px-4 space-y-2 mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-[#7300E5] text-white shadow-md shadow-purple-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#7300E5]",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-[#7300E5]",
                  )}
                />
                <span className="font-semibold text-sm">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        {/* Logout handled by ProfileDropdown or similar */}
      </div>
    </aside>
  );
}
