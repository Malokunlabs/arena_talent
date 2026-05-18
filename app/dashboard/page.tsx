"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, Plus, Zap, ArrowUp, ArrowDown } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentStats } from "@/services/talentService";
import { usePiStore } from "@/store/usePiStore";
import PIProgressBar from "@/components/pi/PIProgressBar";
import LevelUpModal from "@/components/pi/LevelUpModal";
import { cn } from "@/lib/utils";

// Static content placeholders based on design
const topActionCards = [
  { title: "Share Proof", desc: "+10 PI", icon: "share-proof-icons.svg" },
  { title: "Daily Pulse", desc: "+2 PI each", icon: "daily-pulse-icon.svg" },
  { title: "Edit Profile", desc: "Update info", icon: "edit-user-icon.svg" },
  { title: "Explore Arena", desc: "Discover", icon: "explore-arena-icon.svg" },
];

export default function DashboardHome() {
  const { user, fetchUser } = useUserStore();
  const { fetchPiStatus } = usePiStore();

  const [stats, setStats] = useState<TalentStats | null>(null);

  useEffect(() => {
    fetchUser();
    fetchPiStatus();
  }, [fetchUser, fetchPiStatus]);

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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Content (8 columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Top Action Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topActionCards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="w-12 h-12 mb-3 relative group-hover:scale-110 transition-transform">
                  <Image 
                    src={`/dashboard-icons/homepage/${card.icon}`} 
                    alt={card.title} 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-[13px]">{card.title}</h3>
                <p className="text-gray-500 text-[11px] mt-1">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Gigs Completed */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image src="/dashboard-icons/homepage/gigs-completed-icon.svg" alt="Gigs" fill className="object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalGigs ?? 0}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Gigs Completed</div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>12% this month</span>
                </div>
              </div>
            </div>

            {/* Proofs Shared */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image src="/dashboard-icons/homepage/proofs-shared-icon.svg" alt="Proofs" fill className="object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalProofs ?? 0}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Proofs Shared</div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>8 new this week</span>
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-50/30"></div>
              <div className="w-10 h-10 mb-4 relative z-10">
                <Image src="/dashboard-icons/homepage/average-rating-icon.svg" alt="Rating" fill className="object-contain" />
              </div>
              <div className="z-10">
                <div className="text-2xl font-bold text-gray-900">{stats?.rating ?? 0}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Average Rating</div>
                <div className="flex items-center gap-1 mt-2 text-[#7300E5] text-[11px] font-bold">
                  <ArrowUp className="w-3 h-3" />
                  <span>0.2 this month</span>
                </div>
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 mb-4 relative">
                <Image src="/dashboard-icons/homepage/avg-response-time-icon.svg" alt="Response Time" fill className="object-contain" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0h</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Avg Response Time</div>
                <div className="flex items-center gap-1 mt-2 text-gray-400 text-[11px] font-bold">
                  <ArrowDown className="w-3 h-3" />
                  <span>2h faster</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <button className="bg-[#F4ECFF] text-[#7300E5] px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#e9dbff] transition-colors">
                View All
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-6">Your latest actions and updates</p>
            
            {/* Blank state as requested */}
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
              <p className="text-sm font-medium">No recent activity yet.</p>
              <p className="text-xs mt-1">Actions will appear here soon.</p>
            </div>
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
              {/* Badges mockups matching the screenshot */}
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
              {(user?.skills?.length ? user.skills : ["DCAS", "Field Ops", "Mystery Shop", "UGC Video", "Vox Pop"]).map((skill, idx) => (
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

      <LevelUpModal />
    </div>
  );
}
