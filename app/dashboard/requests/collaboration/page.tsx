"use client";

import React, { useEffect } from "react";
import RequestTable, { Request as CollabRequestUI } from "@/components/dashboard/RequestTable";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { Loader2 } from "lucide-react";
import { CollaborationRequest, CollaborationStatus } from "@/services/collaborationService";

export default function CollaborateRequestsPage() {
  const { requests, isLoading, fetchRequests, updateStatus } = useCollaborationStore();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Map API requests to UI Request format
  const mappedRequests: CollabRequestUI[] = (requests || []).map((req: CollaborationRequest) => {
    // Map API status to UI status
    let mappedStatus: CollabRequestUI["status"] = "Pending";
    if (req.status === "ACCEPTED") mappedStatus = "Accepted";
    if (req.status === "DECLINED" || req.status === "CANCELLED") mappedStatus = "Rejected";
    if (req.status === "COMPLETED") mappedStatus = "Accepted"; // Or another appropriate mapping

    return {
      id: req.id,
      sender: {
        name: req.fromUser?.username || "Unknown",
        avatar: req.fromUser?.avatarUrl,
        email: req.fromUser?.email || "",
      },
      details: `${req.title}: ${req.description.substring(0, 50)}...`,
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(req.createdAt)),
      status: mappedStatus,
    };
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    // Map UI status back to API status
    let apiStatus: CollaborationStatus = "PENDING";
    if (status === "Accepted") apiStatus = "ACCEPTED";
    if (status === "Rejected") apiStatus = "DECLINED";
    
    await updateStatus(id, apiStatus);
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7300E5]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Collaborate Requests
        </h1>
        <p className="text-gray-500 mt-1">
          Manage incoming requests for creative collaboration.
        </p>
      </div>

      <RequestTable
        requests={mappedRequests}
        onAccept={(id) => handleStatusUpdate(id, "Accepted")}
        onReject={(id) => handleStatusUpdate(id, "Rejected")}
        onStall={(id) => handleStatusUpdate(id, "Stalled")}
        onView={(req) => console.log("View", req)}
      />
    </div>
  );
}
