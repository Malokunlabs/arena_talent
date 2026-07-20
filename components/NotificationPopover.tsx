"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  UserCheck,
  Star,
  Zap,
  Info,
  CheckCheck,
} from "lucide-react";
import {
  notificationService,
  NotificationItem,
} from "@/services/notificationService";

function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "BADGE_APPLICATION_SUBMITTED":
    case "BADGE_APPLICATION_APPEALED":
      return <Award className="w-4 h-4 text-purple-600" />;
    case "BADGE_APPLICATION_APPROVED":
    case "BADGE_APPEAL_RESOLVED":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
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
      return <Info className="w-4 h-4 text-gray-500" />;
  }
}

export default function NotificationPopover({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      if (isAdmin) {
        const [list, countRes] = await Promise.all([
          notificationService.getAdminNotifications(),
          notificationService.getAdminUnreadCount(),
        ]);
        setNotifications(list);
        setUnreadCount(countRes.count);
      } else {
        const [list, countRes] = await Promise.all([
          notificationService.getUserNotifications(),
          notificationService.getUserUnreadCount(),
        ]);
        setNotifications(list);
        setUnreadCount(countRes.count);
      }
    } catch {
      /* silently catch unauthenticated / net errors */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, [isAdmin]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      if (isAdmin) {
        await notificationService.markAllAdminRead();
      } else {
        await notificationService.markAllUserRead();
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* silently catch */
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7300E5] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#F4ECFF] text-[#7300E5] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[12px] font-semibold text-[#7300E5] hover:text-[#5c00b8] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Latest updates will appear here
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const content = (
                  <div
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      !item.isRead ? "bg-purple-50/30" : ""
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-[13px] truncate ${
                            !item.isRead
                              ? "font-bold text-gray-900"
                              : "font-semibold text-gray-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {relTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-snug">
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
