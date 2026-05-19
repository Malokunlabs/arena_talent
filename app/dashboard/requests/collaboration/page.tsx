"use client";

import React, { useEffect, useState } from "react";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { Loader2, Mail, Smartphone, MapPin, X, RefreshCw, Trash2 } from "lucide-react";
import { CollaborationStatus } from "@/services/collaborationService";
import { cn } from "@/lib/utils";

type FilterStatus = "Pending" | "Hired" | "Rejected" | "Completed";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

function mapApiStatusToUI(apiStatus: string): FilterStatus {
  switch (apiStatus) {
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Hired";
    case "DECLINED":
    case "CANCELLED":
      return "Rejected";
    case "COMPLETED":
      return "Completed";
    default:
      return "Pending";
  }
}

export default function CollaborateRequestsPage() {
  const { requests, isLoading, fetchRequests, updateStatus } = useCollaborationStore();
  const [activeTab, setActiveTab] = useState<FilterStatus>("Pending");

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const mappedRequests = (requests || []).map((req) => ({
    ...req,
    uiStatus: mapApiStatusToUI(req.status),
  }));

  const filteredRequests = mappedRequests.filter((req) => req.uiStatus === activeTab);

  const getCounts = () => {
    const counts = { Pending: 0, Hired: 0, Rejected: 0, Completed: 0 };
    mappedRequests.forEach((req) => {
      if (counts[req.uiStatus] !== undefined) {
        counts[req.uiStatus]++;
      }
    });
    return counts;
  };

  const counts = getCounts();

  const handleStatusUpdate = async (id: string, newStatus: CollaborationStatus) => {
    await updateStatus(id, newStatus);
  };

  const tabs: FilterStatus[] = ["Pending", "Hired", "Rejected", "Completed"];

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto py-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const dotColor = isActive ? "bg-[#7300E5]" : "bg-gray-400";
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors text-sm font-semibold",
                isActive
                  ? "border-purple-100 bg-[#F4ECFF] text-[#7300E5]"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", dotColor)} />
              {tab}
              <span className="text-gray-900 ml-1">{counts[tab]}</span>
            </button>
          );
        })}
      </div>

      {isLoading && requests.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#7300E5]" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="font-semibold text-lg">No {activeTab.toLowerCase()} requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-4 flex-1">
                  {/* Badge & Title */}
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#F4ECFF] text-[#7300E5] px-3 py-1 rounded-full text-xs font-bold mb-3">
                      🤝 Collab Request
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{req.title}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {req.fromUser?.firstName} {req.fromUser?.lastName} (@{req.fromUser?.username || "unknown"})
                    </p>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{req.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span>{req.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{req.city || "Remote"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 text-base leading-none">📝</span>
                      <span className="leading-snug">{req.description}</span>
                    </div>
                  </div>

                  {/* Tags and Timeline */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">

                    <div className="flex items-center gap-1.5 bg-[#F4ECFF] text-[#7300E5] px-3 py-1.5 rounded-full text-xs font-bold">
                      📅 {req.startDate ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(req.startDate)) : "Flexible"}
                    </div>
                    {/* Display a couple of tags if present */}
                    {req.roles?.slice(0, 2).map(role => (
                      <div key={role} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold">
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex justify-end">
                  {req.uiStatus === "Pending" && (
                    <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100">
                      Pending
                    </span>
                  )}
                  {req.uiStatus === "Hired" && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                      Hired
                    </span>
                  )}
                  {req.uiStatus === "Rejected" && (
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                      Rejected
                    </span>
                  )}
                  {req.uiStatus === "Completed" && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-medium">
                  {req.uiStatus === "Pending" ? "Requested" : req.uiStatus} {timeAgo(req.createdAt || new Date().toISOString())}
                </span>

                <div className="flex items-center gap-3">
                  {req.uiStatus === "Pending" && (
                    <button 
                      onClick={() => handleStatusUpdate(req.id, "DECLINED")}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel Request
                    </button>
                  )}
                  
                  {req.uiStatus === "Rejected" && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(req.id, "PENDING")}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reapply
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Dismiss
                      </button>
                    </>
                  )}

                  {(req.uiStatus === "Hired" || req.uiStatus === "Completed") && (
                    <>
                      <button className="px-5 py-2 bg-[#7300E5] text-white hover:bg-[#6000c0] rounded-xl text-sm font-bold transition-colors shadow-sm">
                        View Project
                      </button>
                      <button className="px-5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors shadow-sm">
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
