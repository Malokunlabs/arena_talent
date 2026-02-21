"use client";

import React, { useState } from "react";
import RequestTable, { Request } from "@/components/dashboard/RequestTable";

const INITIAL_JOBS: Request[] = [
  {
    id: "1",
    sender: {
      name: "Tech Corp Inc.",
      avatar:
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2673&auto=format&fit=crop",
      email: "hiring@techcorp.com",
    },
    details: "Full-time Field Ops Manager",
    date: "Jan 15, 2025",
    status: "Pending",
  },
  {
    id: "2",
    sender: {
      name: "Urban Boutique",
      avatar:
        "https://images.unsplash.com/photo-1541577141970-eebc83bece0e?q=80&w=2658&auto=format&fit=crop",
      email: "manager@urbanboutique.com",
    },
    details: "Mystery Shopper - Weekly Gig",
    date: "Jan 10, 2025",
    status: "Stalled",
  },
];

export default function JobRequestsPage() {
  const [requests, setRequests] = useState(INITIAL_JOBS);

  const handleStatusChange = (id: string, newStatus: Request["status"]) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Requests</h1>
        <p className="text-gray-500 mt-1">
          Review and manage direct hiring requests.
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
