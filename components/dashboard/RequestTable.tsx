"use client";

import React from "react";
import Image from "next/image";
import { MoreHorizontal, Check, X, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Request {
  id: string;
  sender: {
    name: string;
    avatar: string;
    email: string;
  };
  details: string;
  date: string;
  status: "Pending" | "Accepted" | "Rejected" | "Stalled";
}

interface RequestTableProps {
  requests: Request[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onStall: (id: string) => void;
  onView: (request: Request) => void;
}

export default function RequestTable({
  requests,
  onAccept,
  onReject,
  onStall,
  onView,
}: RequestTableProps) {
  const getStatusColor = (status: Request["status"]) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Rejected":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "Stalled":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      default:
        return "bg-[#F3E8FF] text-[#7300E5] hover:bg-[#F3E8FF]";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-[300px]">Sender</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                    <Image
                      src={request.sender.avatar}
                      alt={request.sender.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {request.sender.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.sender.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-gray-600 font-medium">
                {request.details}
              </TableCell>
              <TableCell className="text-gray-500">{request.date}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(request.status)} font-bold border-none`}
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => onAccept(request.id)}
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                    onClick={() => onStall(request.id)}
                    title="Stall"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => onReject(request.id)}
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-gray-400 hover:text-[#7300E5] hover:bg-purple-50"
                    onClick={() => onView(request)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
