"use client";

import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollaborationRequestAdmin } from "@/services/adminService";

export default function CollaborationRequestsPage() {
  const { collaborationKanbanBoard, fetchCollaborationKanbanBoard, isLoading } =
    useAdminStore();
  const [selectedCollab, setSelectedCollab] = useState<CollaborationRequestAdmin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCollaborationKanbanBoard();
  }, [fetchCollaborationKanbanBoard]);

  const columnTitles: Record<string, string> = {
    NEW: "New",
    TRIAGED: "Triaged",
    AWAITING_CREATOR: "Awaiting Creator",
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
        {["NEW", "AWAITING_CREATOR", "ACCEPTED"].map((status) => {
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
                    onClick={() => {
                      setSelectedCollab(item);
                      setIsModalOpen(true);
                    }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow"
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Collaboration Details</DialogTitle>
          </DialogHeader>
          
          {selectedCollab && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                    {selectedCollab.fromUser?.avatarUrl ? (
                      <Image
                        src={selectedCollab.fromUser.avatarUrl}
                        alt=""
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedCollab.fromUser?.firstName} {selectedCollab.fromUser?.lastName}
                    </h3>
                    <p className="text-gray-500 text-sm italic">Initiator</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#7300E5]">→</div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedCollab.toUser?.firstName} {selectedCollab.toUser?.lastName}
                    </h3>
                    <p className="text-gray-500 text-sm italic">Partner</p>
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                    {selectedCollab.toUser?.avatarUrl ? (
                      <Image
                        src={selectedCollab.toUser.avatarUrl}
                        alt=""
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Project Title</p>
                  <p className="font-bold text-gray-900 capitalize">{selectedCollab.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                  <Badge className={`${getStatusColor(selectedCollab.status)} border-none py-1 px-3`}>
                    {selectedCollab.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">City</p>
                  <p className="font-semibold">{selectedCollab.city || "Remote"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Start Date</p>
                  <p className="font-semibold">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(selectedCollab.startDate))}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Description</p>
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 text-sm leading-relaxed">
                  {selectedCollab.description}
                </div>
              </div>

              {selectedCollab.roles && selectedCollab.roles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Roles Locked</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollab.roles.map((role: string) => (
                      <Badge key={role} variant="secondary" className="bg-purple-50 text-[#7300E5] border-none font-bold">
                        {role}
                      </Badge>
                    ))}
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
