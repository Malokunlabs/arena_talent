"use client";

import React, { useEffect } from "react";
import RequestTable, { Request as JobRequest } from "@/components/dashboard/RequestTable";
import { useTalentRequestStore } from "@/store/useTalentRequestStore";
import { Loader2 } from "lucide-react";
import { TalentRequest } from "@/services/talentService";

export default function JobRequestsPage() {
  const { requests, isLoading, fetchReceivedRequests, updateStatus } = useTalentRequestStore();

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  // Map API requests to UI Request format
  const mappedRequests: JobRequest[] = (requests || []).map((req: TalentRequest) => {
    // Map API status to UI status
    let mappedStatus: JobRequest["status"] = "Pending";
    if (req.status === "COMPLETED") mappedStatus = "Accepted";
    if (req.status === "DECLINED") mappedStatus = "Rejected";
    // Add other mappings as needed

    return {
      id: req.id,
      sender: {
        name: req.companyName,
        email: req.email,
      },
      details: `${req.requestType}: ${req.projectBrief.substring(0, 50)}...`,
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
    let apiStatus = "NEW";
    if (status === "Accepted") apiStatus = "COMPLETED"; // Or follow the pipeline
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
        <h1 className="text-3xl font-bold text-gray-900">Job Requests</h1>
        <p className="text-gray-500 mt-1">
          Review and manage direct hiring requests.
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
