"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function CollaborationRequestsPage() {
  const { collaborationKanbanBoard, fetchCollaborationKanbanBoard, isLoading } =
    useAdminStore();

  useEffect(() => {
    fetchCollaborationKanbanBoard();
  }, [fetchCollaborationKanbanBoard]);

  const columnTitles: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const getColumn = (status: string) => {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collaborationKanbanBoard.find((c: any) => c.status === status) || {
        status,
        items: [],
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700";
      case "DECLINED":
        return "bg-red-100 text-red-700";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Collaboration Requests
        </h1>
        <p className="text-muted-foreground">
          Manage peer-to-peer collaboration requests
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search requests..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["PENDING", "ACCEPTED", "COMPLETED"].map((status) => {
          const col = getColumn(status);
          return (
            <div key={status} className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-sm font-bold text-gray-700">
                  {columnTitles[status]}
                </span>
                <span className="bg-purple-100 text-[#7300E5] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {col.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${getStatusColor(item.status)} border-none text-[10px] py-0`}
                      >
                        {item.status}
                      </Badge>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                        {item.fromUser?.avatarUrl ? (
                          <Image
                            src={item.fromUser.avatarUrl}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 text-gray-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium truncate">
                        {item.fromUser?.firstName} →{" "}
                        {item.toUser?.firstName || "Public"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {col.items.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs italic">
                    No requests in {columnTitles[status]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Basic Footer Pagination */}
      <div className="flex items-center justify-between py-4 mt-6 bg-white p-4 rounded-2xl border border-gray-100">
        <Button variant="outline" disabled className="gap-1 rounded-xl">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-xs font-medium text-gray-500">Page 1 of 1</span>
        <Button variant="outline" disabled className="gap-1 rounded-xl">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
