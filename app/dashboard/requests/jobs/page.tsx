"use client";

import React, { useEffect, useState } from "react";
import RequestTable, {
  Request as JobRequest,
} from "@/components/dashboard/RequestTable";
import { useTalentRequestStore } from "@/store/useTalentRequestStore";
import { Loader2 } from "lucide-react";
import { TalentRequest } from "@/services/talentService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function JobRequestsPage() {
  const { requests, isLoading, fetchReceivedRequests, updateStatus } =
    useTalentRequestStore();
  const [selectedRequest, setSelectedRequest] = useState<TalentRequest | null>(
    null,
  );

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  // Map API requests to UI Request format
  const mappedRequests: JobRequest[] = (requests || []).map(
    (req: TalentRequest) => {
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
          avatar: req.avatarUrl,
        },
        details: `${req.requestType}: ${req.projectBrief.substring(0, 50)}...`,
        date: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(req.createdAt)),
        status: mappedStatus,
      };
    },
  );

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
        onView={(req) => {
          const fullReq = requests.find((r) => r.id === req.id);
          if (fullReq) setSelectedRequest(fullReq);
        }}
      />

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">
              Job Request Details
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F3E8FF] flex items-center justify-center border border-gray-100">
                  {selectedRequest.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedRequest.avatarUrl}
                      alt={selectedRequest.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#7300E5]">
                      {selectedRequest.companyName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedRequest.companyName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selectedRequest.requesterName} • {selectedRequest.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Type</p>
                  <p className="font-semibold">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <span className="inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold bg-[#F3E8FF] text-[#7300E5]">
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  <p className="font-semibold">
                    {selectedRequest.city || "Remote"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Budget</p>
                  <p className="font-semibold text-green-700">
                    ₦{selectedRequest.budgetMin.toLocaleString()} - ₦
                    {selectedRequest.budgetMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Timeline</p>
                  <p className="font-semibold">
                    {selectedRequest.timeline || "Flexible"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="font-semibold">
                    {selectedRequest.phone || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Project Brief
                </p>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                  {selectedRequest.projectBrief}
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Additional Notes
                  </p>
                  <div className="p-4 bg-gray-50/50 rounded-xl text-gray-600 whitespace-pre-wrap text-sm italic">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
