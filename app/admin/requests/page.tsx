"use client";

import React, { useEffect, useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import RequestCard from "@/components/admin/RequestCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Calendar, MapPin, Banknote, Mail, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TalentRequest } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";

export default function HireRequestsPage() {
  const { kanbanBoard, fetchKanbanBoard, isLoading } = useAdminStore();
  const [selectedRequest, setSelectedRequest] = useState<TalentRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                  <RequestCard 
                    key={item.id} 
                    request={item} 
                    onClick={() => {
                      setSelectedRequest(item);
                      setIsModalOpen(true);
                    }}
                  />
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
                  <RequestCard 
                    key={item.id} 
                    request={item} 
                    onClick={() => {
                      setSelectedRequest(item);
                      setIsModalOpen(true);
                    }}
                  />
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

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-[#7300E5]">
                  <Building className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedRequest.companyName}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedRequest.email}
                    </span>
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-[#7300E5] text-white border-none py-1 px-3">
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Request Type</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedRequest.requestType}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Budget Range</p>
                    <div className="flex items-center gap-2 font-bold text-[#7300E5]">
                      <Banknote className="w-4 h-4" />
                      <span>
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(selectedRequest.budgetMin)} 
                         - 
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(selectedRequest.budgetMax)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Location / City</p>
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedRequest.location || selectedRequest.city || "Remote"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Timeline</p>
                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {selectedRequest.timeline === "asap" ? "ASAP" : new Date(selectedRequest.timeline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Brief */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Project Brief</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 text-sm leading-relaxed border border-gray-100">
                  {selectedRequest.projectBrief}
                </div>
              </div>

              {/* Created Date */}
              <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                Request ID: {selectedRequest.id} • Created on {new Date(selectedRequest.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
