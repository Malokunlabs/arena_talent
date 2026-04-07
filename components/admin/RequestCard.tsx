"use client";

import React from "react";
import { TalentRequest } from "@/services/adminService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Banknote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RequestCardProps {
  request: TalentRequest;
}

export default function RequestCard({ request }: RequestCardProps) {
  // Format budget
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
      <CardHeader className="p-4 pb-2 space-y-0">
        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
          {request.requestType}
        </h3>
        <p className="text-xs text-gray-500 font-medium">
          @
          {
            request.companyName
              .replace(/\s+/g, "")
              .toLowerCase() /* Simulation of username */
          }
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <p className="text-xs text-gray-700 line-clamp-2">
          {request.projectBrief}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{request.location || request.city || "Remote"}</span>
            <span className="mx-1">•</span>
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(
                request.timeline === "asap"
                  ? request.createdAt
                  : request.timeline,
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#7300E5]">
            <Banknote className="h-3 w-3" />
            <span>
              {formatMoney(request.budgetMin)} -{" "}
              {formatMoney(request.budgetMax)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
