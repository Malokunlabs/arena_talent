"use client";

import React, { useState } from "react";
import RequestTable, { Request } from "@/components/dashboard/RequestTable";

const INITIAL_REQUESTS: Request[] = [
  {
    id: "1",
    sender: {
      name: "Segun Balogun",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop",
      email: "segun@example.com",
    },
    details: "Product Advertisement - Video Editing",
    date: "Oct 24, 2024",
    status: "Pending",
  },
  {
    id: "2",
    sender: {
      name: "Chioma Okeke",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
      email: "chioma@agency.com",
    },
    details: "UGC Campaign for Skincare Brand",
    date: "Oct 22, 2024",
    status: "Accepted",
  },
];

export default function CollaborateRequestsPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleStatusChange = (id: string, newStatus: Request["status"]) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
    );
  };

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
        requests={requests}
        onAccept={(id) => handleStatusChange(id, "Accepted")}
        onReject={(id) => handleStatusChange(id, "Rejected")}
        onStall={(id) => handleStatusChange(id, "Stalled")}
        onView={(req) => console.log("View", req)}
      />
    </div>
  );
}
