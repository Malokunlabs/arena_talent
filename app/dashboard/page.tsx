"use client";

import React, { useEffect } from "react";
import { Wallet, Clock, AlertCircle, Award } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import FeedCard from "@/components/FeedCard";
import { useUserStore } from "@/store/useUserStore";

const RECENT_POSTS = [
  {
    id: 101,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
    name: "Ebibere Rinebai",
    location: "Lagos",
    timeAgo: "3hrs ago",
    badge: "Win",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop",
    tags: ["UGC", "win", "unicorn"],
    title: "Collaborated with a Unicorn Startup!",
    description:
      "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
    salutes: 87,
  },
  {
    id: 102,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop",
    name: "Ebibere Rinebai",
    location: "Lagos",
    timeAgo: "3hrs ago",
    badge: "Learning",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
    tags: ["UGC", "win", "unicorn"],
    title: "Collaborated with a Unicorn Startup!",
    description:
      "Victoria Island to Lekki hustle. Every brand checked, every detail noted. This how we make progress.🤩",
    salutes: 87,
  },
] as const;

export default function DashboardHome() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : "there";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {displayName}! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value="₦2,850,000"
          icon={Wallet}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Pending Requests"
          value="12"
          icon={Clock}
          trend="+4"
          trendUp={true}
        />
        <StatCard
          title="Completed Jobs"
          value="48"
          icon={Award}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Stalled Jobs"
          value="3"
          icon={AlertCircle}
          trend="-1"
          trendUp={false}
        />
      </div>

      {/* Recent Posts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {RECENT_POSTS.map((post) => (
            <FeedCard
              key={post.id}
              avatar={post.avatar}
              name={post.name}
              location={post.location}
              timeAgo={post.timeAgo}
              badge={post.badge}
              image={post.image}
              tags={[...post.tags]}
              title={post.title}
              description={post.description}
              salutes={post.salutes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
