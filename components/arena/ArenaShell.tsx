"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ArrowRight, Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { useProofStore } from "@/store/useProofStore";
import { useLevelStore } from "@/store/useLevelStore";
import { connectionService } from "@/services/connectionService";
import UserAvatar from "@/components/UserAvatar";
import NotificationPopover from "@/components/NotificationPopover";
import LevelBreakdownModal from "@/components/modals/LevelBreakdownModal";
import {
  LevelEmblem,
  getLevelColor,
  getLevelBgTint,
  getLevelTrackTint,
  getReadableTextColor,
} from "@/components/arena/LevelBadge";
import { toast } from "sonner";

const NAV_ITEMS = [
  {
    label: "Feed",
    href: "/",
    iconSrc: "/icons/home-button.svg",
  },
  {
    label: "Overview",
    href: "/dashboard",
    iconSrc: "/icons/overview-button.svg",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    iconSrc: "/icons/profile-button.svg",
  },
];

function computeFallbackRank(proofCount: number) {
  if (proofCount >= 30) {
    return {
      name: "Lead",
      color: "#A855F7",
      nextName: null as string | null,
      remaining: 0,
      progressPercent: 100,
    };
  }
  if (proofCount >= 16) {
    return {
      name: "Pro",
      color: "#22C55E",
      nextName: "Lead",
      remaining: 30 - proofCount,
      progressPercent: Math.round(((proofCount - 16) / 14) * 100),
    };
  }
  if (proofCount >= 6) {
    return {
      name: "Specialist",
      color: "#38BDF8",
      nextName: "Pro",
      remaining: 16 - proofCount,
      progressPercent: Math.round(((proofCount - 6) / 10) * 100),
    };
  }
  return {
    name: "Hustler",
    color: "#FACC15",
    nextName: "Specialist",
    remaining: Math.max(6 - proofCount, 0),
    progressPercent: Math.round((proofCount / 6) * 100),
  };
}

interface ArenaShellProps {
  children: React.ReactNode;
  onShareProofClick?: () => void;
  showRightSidebar?: boolean;
  customRightSidebar?: React.ReactNode;
  profileBadgeCount?: number;
}

export default function ArenaShell({
  children,
  onShareProofClick,
  showRightSidebar = true,
  customRightSidebar,
  profileBadgeCount,
}: ArenaShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const { user, clearUser } = useUserStore();
  const {
    proofsOfTheWeek,
    userProofs,
    searchQuery,
    setSearchQuery,
    setActiveFilter,
    fetchProofs,
    fetchProofsOfTheWeek,
    fetchUserProofs,
    toggleBookmark,
    recordView,
  } = useProofStore();
  const { myProgress, fetchMyLevelProgress } = useLevelStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    fetchProofsOfTheWeek(5);
  }, [fetchProofsOfTheWeek]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProofs();
      fetchMyLevelProgress();
      connectionService
        .getIncomingRequests(20)
        .then((list) => setPendingRequestsCount(Array.isArray(list) ? list.length : 0))
        .catch(() => {});
    } else {
      setPendingRequestsCount(0);
    }
  }, [isAuthenticated, fetchUserProofs, fetchMyLevelProgress]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchProofs({ search: val });
  };

  const handleBookmarkWeekly = (id: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark proofs");
      return;
    }
    toggleBookmark(id);
  };

  const handleShareProofTrigger = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (onShareProofClick) {
      onShareProofClick();
    } else {
      router.push("/?compose=1");
    }
  };

  const fallbackRank = computeFallbackRank(userProofs.length);
  const activeLevel = myProgress?.currentLevel ?? {
    name: fallbackRank.name,
    color: fallbackRank.color,
    iconUrl: null,
  };
  const activeLevelColor = getLevelColor(activeLevel);
  const activeReadableColor = getReadableTextColor(activeLevelColor);
  const nextLevelName = myProgress
    ? (myProgress.nextLevel?.name ?? null)
    : fallbackRank.nextName;
  const remainingProofs = myProgress
    ? myProgress.proofsToNextLevel
    : fallbackRank.remaining;
  const progressPercent = myProgress
    ? myProgress.progressPercent
    : fallbackRank.progressPercent;

  const SidebarBody = (
    <div className="flex flex-col h-full py-6 px-5 select-none">
      {/* Arena Logo */}
      <div className="flex items-center justify-between px-2 mb-7">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/icons/arena-logo.svg"
            alt="Arena"
            width={88}
            height={23}
            priority
            className="h-[22px] w-auto"
          />
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#747682] hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {NAV_ITEMS.filter((item) => isAuthenticated || item.href === "/").map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                (item.href === "/dashboard/profile" &&
                  pathname?.startsWith("/dashboard/profile")) ||
                (item.href === "/dashboard" &&
                  pathname === "/dashboard");

          const resolvedBadge =
            item.href === "/dashboard/profile"
              ? (profileBadgeCount ?? pendingRequestsCount)
              : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-[#F3E8FF] text-[#7E00EE] font-semibold"
                  : "text-[#747682] hover:bg-gray-50 hover:text-black font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={16}
                  height={16}
                  className={isActive ? "" : "opacity-80"}
                />
                <span className="text-[13.5px]">{item.label}</span>
              </div>

              {resolvedBadge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#7E00EE] text-white text-[11px] font-semibold flex items-center justify-center">
                  {resolvedBadge > 99 ? "99+" : resolvedBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Arena Rank Progress Card (shown when authenticated) */}
      {isAuthenticated && (
        <div className="mt-8 rounded-[22px] border border-[#ECECF0] bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {/* Tinted emblem container */}
          <div
            style={{ backgroundColor: getLevelBgTint(activeLevelColor) }}
            className="h-[88px] rounded-2xl flex items-center justify-center"
          >
            <LevelEmblem level={activeLevel} size="md" />
          </div>

          <div className="mt-3">
            <p
              style={{ color: activeReadableColor }}
              className="text-[13px] font-bold"
            >
              {activeLevel.name}{" "}
              <span className="text-[11px] font-normal text-[#747682]">
                in the Arena
              </span>
            </p>
            <p className="text-[11px] text-[#747682] mt-0.5">
              {nextLevelName && remainingProofs > 0
                ? `${remainingProofs} ${remainingProofs === 1 ? "proof" : "proofs"} to reach ${nextLevelName}`
                : "Top rank reached in the Arena"}
            </p>

            {/* Progress Bar */}
            <div
              style={{ backgroundColor: getLevelTrackTint(activeLevelColor) }}
              className="mt-2.5 h-1.5 w-full rounded-full overflow-hidden flex gap-0.5"
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: activeLevelColor,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>

            {/* Info + Share Proof Action Row */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (myProgress) {
                    setLevelModalOpen(true);
                  } else {
                    fetchMyLevelProgress().then(() => setLevelModalOpen(true));
                  }
                }}
                className="w-8 h-8 rounded-lg border border-[#E4E4EA] flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
                title="View Arena Rank Breakdown"
              >
                <Image
                  src="/icons/info.svg"
                  alt="Info"
                  width={14}
                  height={14}
                />
              </button>

              <button
                type="button"
                onClick={handleShareProofTrigger}
                className="flex-1 h-8 rounded-lg border border-[#E4E4EA] hover:border-black text-[12px] font-semibold text-black hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Share Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Mini Footer if logged in */}
      {isAuthenticated && user && (
        <div className="mt-auto pt-6 flex items-center gap-1">
          <Link
            href="/dashboard/profile"
            className="flex-1 min-w-0 flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <UserAvatar
              name={`${user.firstName || ""} ${user.lastName || ""}`}
              src={user.avatarUrl}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-black truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-[#747682] truncate">
                @{user.username || "talent"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              clearUser();
              setMobileMenuOpen(false);
              router.replace("/");
            }}
            title="Log out"
            className="p-2 rounded-xl text-[#747682] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-44px)] bg-white">
      {/* Mobile Top Bar for Drawer */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#EFEFF3]">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-lg text-black hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/icons/arena-logo.svg"
            alt="Arena"
            width={84}
            height={22}
            priority
            className="h-[20px] w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <NotificationPopover isAdmin={false} />
          ) : (
            <Link
              href="/login"
              className="text-[12px] font-semibold text-[#7E00EE]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-[240px] h-full bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`max-w-[1280px] mx-auto grid grid-cols-1 ${
          showRightSidebar
            ? "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]"
            : "lg:grid-cols-[220px_minmax(0,1fr)]"
        }`}
      >
        {/* Column 1: Left Sidebar */}
        <aside className="hidden lg:block sticky top-11 h-[calc(100vh-44px)] border-r border-[#EFEFF3]">
          {SidebarBody}
        </aside>

        {/* Column 2: Center Content */}
        <main
          className={`min-w-0 px-4 sm:px-7 py-6 ${
            showRightSidebar ? "border-r border-[#EFEFF3]" : ""
          }`}
        >
          {children}
        </main>

        {/* Column 3: Right Sidebar */}
        {showRightSidebar && (
          <aside className="hidden xl:block sticky top-11 h-[calc(100vh-44px)] overflow-y-auto px-6 py-6 space-y-5">
            {customRightSidebar ? (
              customRightSidebar
            ) : (
              <>
            {/* Search Arena + Notification Bell */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#747682] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search Arena"
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#E6E6EC] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] transition-colors"
                />
              </div>

              {isAuthenticated ? (
                <div className="w-10 h-10 rounded-xl border border-[#E6E6EC] flex items-center justify-center shrink-0">
                  <NotificationPopover isAdmin={false} />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-10 h-10 rounded-xl border border-[#E6E6EC] flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors"
                  title="Notifications"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#62636C"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Proofs of the Week Card */}
            <div className="rounded-[22px] border border-[#ECECF0] bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-black tracking-[-0.01em]">
                  Proofs of the Week
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("trending");
                    fetchProofs({ filter: "trending" });
                    if (pathname !== "/") {
                      router.push("/");
                    }
                  }}
                  className="text-[#747682] hover:text-black transition-colors cursor-pointer"
                  title="See trending proofs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-[#F1F1F5]">
                {proofsOfTheWeek.map((item) => {
                  const authorName = item.talent
                    ? `${item.talent.firstName || ""} ${item.talent.lastName || ""}`.trim() ||
                      "Arena Creator"
                    : "Arena Creator";
                  const snippet =
                    item.caption ||
                    item.title ||
                    "Completed retail audits and collected pricing, stock and availability data.";
                  const thumb =
                    item.mediaUrl ||
                    (item.mediaUrls && item.mediaUrls[0]) ||
                    null;
                  const profileLink = item.talent?.username
                    ? `/profile?username=${item.talent.username}`
                    : "#";

                  return (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Link
                          href={profileLink}
                          onClick={() => recordView(item.id)}
                          className="flex items-center gap-2 min-w-0"
                        >
                          <div className="rounded-full p-[1.5px] border border-[#A855F7] shrink-0">
                            <UserAvatar
                              name={authorName}
                              src={item.talent?.avatarUrl}
                              size={24}
                            />
                          </div>
                          <span className="text-[13px] font-semibold text-black truncate hover:underline">
                            {authorName}
                          </span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleBookmarkWeekly(item.id)}
                          className="p-1 rounded hover:bg-gray-100 shrink-0 cursor-pointer"
                          title={
                            item.isBookmarked
                              ? "Remove bookmark"
                              : "Bookmark proof"
                          }
                        >
                          {item.isBookmarked ? (
                            <svg
                              width="10"
                              height="13"
                              viewBox="0 0 11 14"
                              fill="#7E00EE"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.75 2.25C0.75 1.85218 0.908035 1.47064 1.18934 1.18934C1.47064 0.908035 1.85218 0.75 2.25 0.75H8.25C8.64782 0.75 9.02936 0.908035 9.31066 1.18934C9.59196 1.47064 9.75 1.85218 9.75 2.25V12.7995C9.74996 12.8673 9.73153 12.9339 9.69666 12.9921C9.6618 13.0503 9.6118 13.0979 9.552 13.1299C9.4922 13.1619 9.42484 13.1771 9.35708 13.1739C9.28933 13.1706 9.22372 13.1491 9.16725 13.1115L5.45775 10.6387C5.3962 10.5978 5.32393 10.5759 5.25 10.5759C5.17607 10.5759 5.1038 10.5978 5.04225 10.6387L1.33275 13.1115C1.27628 13.1491 1.21067 13.1706 1.14292 13.1739C1.07516 13.1771 1.0078 13.1619 0.948 13.1299C0.888199 13.0979 0.838203 13.0503 0.803336 12.9921C0.768468 12.9339 0.750035 12.8673 0.75 12.7995V2.25Z"
                                stroke="#7E00EE"
                                strokeWidth="1.5"
                              />
                            </svg>
                          ) : (
                            <Image
                              src="/icons/bookmark.svg"
                              alt="Bookmark"
                              width={10}
                              height={13}
                            />
                          )}
                        </button>
                      </div>

                      <Link
                        href={profileLink}
                        onClick={() => recordView(item.id)}
                        className="flex items-start justify-between gap-3 group"
                      >
                        <p className="text-[12px] leading-[1.45] text-[#747682] group-hover:text-black transition-colors line-clamp-3 flex-1">
                          {snippet}
                        </p>
                        {thumb && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#ECECF0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={authorName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}

                {proofsOfTheWeek.length === 0 && (
                  <p className="text-[12px] text-[#747682] py-4">
                    Top proofs shared this week will appear here.
                  </p>
                )}
              </div>
            </div>
              </>
            )}
          </aside>
        )}
      </div>

      <LevelBreakdownModal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        progress={myProgress}
      />
    </div>
  );
}
