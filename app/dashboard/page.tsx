"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Plus,
  Zap,
  ArrowUp,
  ArrowDown,
  Award,
  CheckCircle2,
  XCircle,
  UserCheck,
  Star,
  Info,
  CheckCheck,
  Loader2,
  LogIn,
  Edit3,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentStats } from "@/services/talentService";
import { usePiStore } from "@/store/usePiStore";
import {
  notificationService,
  NotificationItem,
} from "@/services/notificationService";
import PIProgressBar from "@/components/pi/PIProgressBar";

const topActionCards = [
  {
    title: "Share Proof",
    desc: "+10 PI",
    icon: "share-proof-icons.svg",
    href: "/dashboard/proofs",
  },
  {
    title: "Daily Pulse",
    desc: "+2 PI each",
    icon: "daily-pulse-icon.svg",
    href: "/dashboard/pulse",
  },
  {
    title: "Edit Profile",
    desc: "Update info",
    icon: "edit-user-icon.svg",
    href: "/dashboard/profile",
  },
  {
    title: "Explore Arena",
    desc: "Discover",
    icon: "explore-arena-icon.svg",
    href: "/talent",
  },
];

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "BADGE_APPLICATION_SUBMITTED":
    case "BADGE_APPLICATION_APPEALED":
      return <Award className="w-4 h-4 text-purple-600" />;
    case "BADGE_APPLICATION_APPROVED":
    case "BADGE_APPEAL_RESOLVED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case "BADGE_APPLICATION_REJECTED":
    case "BADGE_REVOKED":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "TALENT_REQUEST_CREATED":
    case "COLLABORATION_REQUEST_CREATED":
      return <UserCheck className="w-4 h-4 text-blue-600" />;
    case "PROOF_SALUTED":
      return <Zap className="w-4 h-4 text-amber-500" />;
    case "REVIEW_RECEIVED":
      return <Star className="w-4 h-4 text-yellow-500" />;
    default:
      return <Info className="w-4 h-4 text-[#7300E5]" />;
  }
}

export default function DashboardHome() {
  const { user, fetchUser } = useUserStore();
  const { fetchPiStatus } = usePiStore();

  const [stats, setStats] = useState<TalentStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
    } catch {
      /* silently catch */
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchPiStatus();
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000); // refresh activity feed every 30s
    return () => clearInterval(interval);
  }, [fetchUser, fetchPiStatus, loadNotifications]);

  // Fetch talent stats once we have a username
  useEffect(() => {
    if (!user?.username) return;

    talentService
      .getTalentByUsername(user.username)
      .then((profile) => {
        setStats(profile.stats);
      })
      .catch(() => {
        // errors shown via toast
      });
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllUserRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* silently catch */
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch {
        /* silently catch */
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Content (8 columns) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Top Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topActionCards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-[#7300E5]/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 mb-3 relative group-hover:scale-110 transition-transform">
                  <Image
                    src={`/dashboard-icons/homepage/${card.icon}`}
                    alt={card.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-[13px] group-hover:text-[#7300E5] transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-[11px] mt-1">{card.desc}</p>
              </Link>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Gigs Completed */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image
                  src="/dashboard-icons/homepage/gigs-completed-icon.svg"
                  alt="Gigs"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.totalGigs ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Gigs Completed
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>12% this month</span>
                </div>
              </div>
            </div>

            {/* Proofs Shared */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image
                  src="/dashboard-icons/homepage/proofs-shared-icon.svg"
                  alt="Proofs"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.totalProofs ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Proofs Shared
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>8 new this week</span>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/30" />
              <div className="w-10 h-10 mb-4 relative z-10">
                <Image
                  src="/dashboard-icons/homepage/average-rating-icon.svg"
                  alt="Rating"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="z-10">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.rating ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Average Rating
                </div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>0.2 this month</span>
                </div>
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image
                  src="/dashboard-icons/homepage/avg-response-time-icon.svg"
                  alt="Response Time"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0h</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Avg Response Time
                </div>
                <div className="flex items-center gap-1 mt-2 text-gray-400 text-[11px] font-bold">
                  <ArrowDown className="w-3 h-3" />
                  <span>2h faster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h2>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="bg-[#F4ECFF] text-[#7300E5] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.isRead).length} new
                  </span>
                )}
              </div>
              {notifications.some((n) => !n.isRead) ? (
                <button
                  onClick={handleMarkAllRead}
                  className="bg-[#F4ECFF] text-[#7300E5] px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[#e9dbff] transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              ) : (
                <span className="text-[12px] font-medium text-gray-400">
                  Live Feed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Your latest actions, updates, and notifications
            </p>

            {/* Loading / Activity List / Empty State */}
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#7300E5]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <p className="text-sm font-medium">No recent activity yet.</p>
                <p className="text-xs mt-1 text-gray-400">
                  Actions and updates will appear here soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 6).map((item) => {
                  const content = (
                    <div
                      onClick={() => handleItemClick(item)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border border-gray-100/80 hover:border-[#7300E5]/30 hover:bg-purple-50/20 transition-all cursor-pointer ${
                        !item.isRead ? "bg-purple-50/40 font-medium" : "bg-white"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#F4ECFF] flex items-center justify-center shrink-0 mt-0.5">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-[13px] truncate ${
                              !item.isRead
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-800"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                            {relTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">
                          {item.message}
                        </p>
                      </div>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#7300E5] shrink-0 mt-2" />
                      )}
                    </div>
                  );

                  if (item.link) {
                    return (
                      <Link key={item.id} href={item.link}>
                        {content}
                      </Link>
                    );
                  }

                  return <div key={item.id}>{content}</div>;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (4 columns) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Progress Index */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <PIProgressBar />
          </div>

          {/* Your Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Badges</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                🔥 7-Day Active
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 text-yellow-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                👑 Legend
              </div>
              <div className="flex items-center gap-1.5 bg-[#F4ECFF] border border-purple-100 text-[#7300E5] px-3 py-1.5 rounded-full text-xs font-semibold">
                ⚡ Top Hustler
              </div>
              <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-pink-600 px-3 py-1.5 rounded-full text-xs font-semibold">
                🔍 Street Analyst
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(user?.skills?.length
                ? user.skills
                : ["DCAS", "Field Ops", "Mystery Shop", "UGC Video", "Vox Pop"]
              ).map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#7300E5]/30 text-[#7300E5] px-3 py-1.5 rounded-full text-[11px] font-semibold"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
