"use client";

import React, { useEffect, useState } from "react";
import RequestTable, {
  Request as CollabRequestUI,
} from "@/components/dashboard/RequestTable";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { Loader2 } from "lucide-react";
import {
  CollaborationRequest,
  CollaborationStatus,
} from "@/services/collaborationService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CollaborateRequestsPage() {
  const { requests, isLoading, fetchRequests, updateStatus } =
    useCollaborationStore();
  const [selectedRequest, setSelectedRequest] =
    useState<CollaborationRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Map API requests to UI Request format
  const mappedRequests: CollabRequestUI[] = (requests || []).map(
    (req: CollaborationRequest) => {
      // Map API status to UI status
      let mappedStatus: CollabRequestUI["status"] = "Pending";
      if (req.status === "ACCEPTED") mappedStatus = "Accepted";
      if (req.status === "DECLINED" || req.status === "CANCELLED")
        mappedStatus = "Rejected";
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
    },
  );

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
              Request Details
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                  {selectedRequest.fromUser?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedRequest.fromUser.avatarUrl}
                      alt={selectedRequest.fromUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#7300E5]">
                      {selectedRequest.fromUser?.username?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedRequest.fromUser?.firstName}{" "}
                    {selectedRequest.fromUser?.lastName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    @{selectedRequest.fromUser?.username}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Title</p>
                  <p className="font-semibold">{selectedRequest.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <span className="inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold bg-[#F3E8FF] text-[#7300E5]">
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">City</p>
                  <p className="font-semibold">
                    {selectedRequest.city || "Remote"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Start Date
                  </p>
                  <p className="font-semibold">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(selectedRequest.startDate))}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Description
                </p>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                  {selectedRequest.description}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedRequest.roles?.map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold"
                  >
                    {role}
                  </span>
                ))}
                {selectedRequest.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#F3E8FF] text-[#7300E5] rounded-full text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
