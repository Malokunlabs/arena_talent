"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import RequestCard from "@/components/admin/RequestCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HireRequestsPage() {
  const { kanbanBoard, fetchKanbanBoard, isLoading } = useAdminStore();

  useEffect(() => {
    fetchKanbanBoard();
  }, [fetchKanbanBoard]);

  // Reordering columns to match visual flow if needed, or trusting API order.
  // API returns "NEW", "TRIAGED", etc.
  // Design shows: New | Awaiting Creator | Awaiting Payments
  //               In Fulfillment | Review | Completed

  // Let's create a visual mapping of the columns
  const columnOrder = [
    "NEW",
    "TRIAGED",
    "AWAITING_CREATOR",
    "AWAITING_PAYMENT",
    "IN_FULFILLMENT",
    "COMPLETED", // "Review" is not in dummy.txt, maybe check status name?
    // dummy.txt: NEW, TRIAGED, AWAITING_CREATOR, AWAITING_PAYMENT, IN_FULFILLMENT, COMPLETED, DECLINED
  ];

  // Map API statuses to Display Titles
  const columnTitles: Record<string, string> = {
    NEW: "New",
    TRIAGED: "Triaged",
    AWAITING_CREATOR: "Awaiting Creator",
    AWAITING_PAYMENT: "Awaiting Payments",
    IN_FULFILLMENT: "In Fulfillment",
    COMPLETED: "Completed",
    DECLINED: "Declined",
  };

  // Helper to get column data safe
  const getColumn = (status: string) => {
    return (
      kanbanBoard.find((c) => c.status === status) || { status, items: [] }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Hire Requests</h1>
        <p className="text-muted-foreground">Manage hire request pipeline</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search" className="pl-9 bg-white" />
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Row */}
        {["NEW", "AWAITING_CREATOR", "AWAITING_PAYMENT"].map((status) => {
          const col = getColumn(status);
          return (
            <div key={status} className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-700">
                  {columnTitles[status]}
                </span>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md">
                  {col.items.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <RequestCard key={item.id} request={item} />
                ))}
                {col.items.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No requests
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom Row */}
        {["IN_FULFILLMENT", "TRIAGED", "COMPLETED"].map((status) => {
          // "Review" in design might actally be "TRIAGED" or something else. I'll use TRIAGED or map accordingly.
          // Let's use the remaining significant ones.
          const col = getColumn(status);
          return (
            <div key={status} className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-sm font-semibold text-gray-700">
                  {columnTitles[status]}
                </span>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md">
                  {col.items.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <RequestCard key={item.id} request={item} />
                ))}
                {col.items.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No requests
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Visual (Static for now as per Kanban limitations/design discrepancy) */}
      <div className="flex items-center justify-between py-4 mt-4 bg-white p-4 rounded-lg border border-gray-100">
        <Button variant="outline" disabled className="gap-1 pl-2.5">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Button
            variant="secondary"
            className="bg-purple-100 text-purple-700 font-bold h-8 w-8 p-0"
          >
            1
          </Button>
          <Button variant="ghost" className="h-8 w-8 p-0">
            2
          </Button>
          <span className="px-2">...</span>
          <Button variant="ghost" className="h-8 w-8 p-0">
            10
          </Button>
        </div>
        <Button variant="outline" className="gap-1 pr-2.5">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
