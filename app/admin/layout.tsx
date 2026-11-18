"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  LogOut,
  Loader2,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import NotificationPopover from "@/components/NotificationPopover";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  {
    icon: ShieldCheck,
    label: "Posts & Proof of the Week",
    href: "/admin/moderation",
  },
  { icon: Users, label: "Users & Connections", href: "/admin/talents" },
];

const SIDEBAR_STORAGE_KEY = "arena_admin_sidebar_collapsed";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, isAuthenticated, isInitialized, initAuth, logout } =
    useAuthStore();
  const {
    user: profileUser,
    isLoading: isProfileLoading,
    fetchUser,
    clearUser,
  } = useUserStore();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true") {
          setIsCollapsed(true);
        }
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isLoginRoute) {
      initAuth();
    }
  }, [isLoginRoute, initAuth]);

  const effectiveRole = user?.role || profileUser?.role;

  useEffect(() => {
    if (isLoginRoute || !isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }

    if (!effectiveRole) {
      fetchUser();
      return;
    }

    if (effectiveRole !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [
    isLoginRoute,
    isInitialized,
    isAuthenticated,
    effectiveRole,
    fetchUser,
    router,
  ]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (
    !isInitialized ||
    !isAuthenticated ||
    (!effectiveRole && isProfileLoading) ||
    effectiveRole !== "ADMIN"
  ) {
    return (
      <div className="min-h-[calc(100vh-44px)] bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#7300E5]" />
        <p className="text-sm text-gray-500">Verifying admin access...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    clearUser();
    router.push("/admin/login");
  };

  const activeLink = sidebarLinks.find(
    (l) =>
      pathname === l.href ||
      (l.href !== "/admin/dashboard" && pathname?.startsWith(l.href)),
  );

  const pageTitle = pathname?.startsWith("/admin/talents/")
    ? "User Profile & Activity"
    : activeLink?.label || "Dashboard";

  const renderSidebarContent = (collapsed: boolean, isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-gray-100 shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 font-bold text-lg text-[#7300E5] truncate"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#7300E5] text-white text-sm font-bold">
              A
            </div>
            <span className="truncate">Arena Admin</span>
          </Link>
        )}

        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(false)}
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <nav className="space-y-1.5">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin/dashboard" &&
                pathname?.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                onClick={() => isMobile && setMobileDrawerOpen(false)}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center h-11 w-11 mx-auto"
                    : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "bg-[#7300E5] text-white shadow-sm shadow-purple-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile */}
      <div className="border-t border-gray-100 p-3 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.email || "Admin"}
              className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-[#7300E5] font-bold text-sm"
            >
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Log out"
              onClick={handleLogout}
              className="h-8 w-8 text-gray-400 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-[#7300E5] font-bold text-sm">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="text-sm min-w-0">
                <p className="font-semibold text-gray-900 leading-tight">
                  Admin
                </p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Log out"
              onClick={handleLogout}
              className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-44px)] w-full max-w-full bg-[#F8F9FB]">
      {/* Desktop Collapsible Sidebar (sticky below TopEcosystemBar) */}
      <aside
        className={cn(
          "hidden md:flex flex-col sticky top-11 h-[calc(100vh-44px)] shrink-0 border-r border-gray-200 bg-white transition-all duration-200 z-30",
          isCollapsed ? "w-[72px]" : "w-60",
        )}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <aside
            className="w-64 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(false, true)}
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-11 z-20 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden h-9 w-9 text-gray-700 shrink-0"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#7300E5] px-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-200 transition-colors"
            >
              <span className="hidden sm:inline">View Arena</span>
              <span className="sm:hidden">Feed</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <NotificationPopover isAdmin={true} />
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
