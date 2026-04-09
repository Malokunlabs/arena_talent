"use client";

import {
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  Users,
  Activity,
  UserCheck,
  CreditCard,
  BarChart3,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShieldCheck, label: "Proof Moderation", href: "/admin/moderation" },
  { icon: Briefcase, label: "Hire Requests", href: "/admin/requests" },
  {
    icon: Users,
    label: "Collaborations",
    href: "/admin/collaboration-requests",
  },
  { icon: Activity, label: "Pulse Manager", href: "/admin/pulse" },
  { icon: UserCheck, label: "Talent Directory", href: "/admin/talents" },
  { icon: CreditCard, label: "Finance & Payouts", href: "/admin/finance" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearUser } = useUserStore();

  const handleLogout = () => {
    logout();
    clearUser();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-100 px-6">
            <div className="flex items-center gap-2 font-bold text-xl text-[#7300E5]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7300E5] text-white">
                A
              </div>
              Arena Admin
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#7300E5] text-white shadow-md shadow-purple-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer User Profile (Simple) */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-[#7300E5] font-bold">
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-gray-500 text-xs truncate w-24">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 sm:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">
            {sidebarLinks.find((l) => l.href === pathname)?.label ||
              "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="w-64 pl-9 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-gray-200"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
