"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export interface AdminRequestData {
  personalInfo: {
    nameLabel: string;
    nameValue: string;
    emailLabel: string;
    emailValue: string;
    phoneLabel: string;
    phoneValue: string;
  };
  sections: {
    label: string;
    value: React.ReactNode;
  }[];
  status: string;
}

interface AdminRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdminRequestData | null;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}

export default function AdminRequestDetailsModal({
  isOpen,
  onClose,
  data,
  onAccept,
  onReject,
  onComplete,
}: AdminRequestDetailsModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-[#FAFAFA] rounded-3xl p-6 sm:p-8 border-none shadow-xl gap-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Hidden title for accessibility */}
        <DialogPrimitive.Title className="sr-only">
          Request Details
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          Detailed view of a request.
        </DialogPrimitive.Description>

        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        {/* Content area with scrolling if needed */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Personal Information
          </h2>

          {/* Personal Info Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[13px] text-gray-400 mb-1.5">
                  {data.personalInfo.nameLabel}
                </p>
                <p className="text-[14px] font-medium text-gray-900 truncate">
                  {data.personalInfo.nameValue || "-"}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-400 mb-1.5">
                  {data.personalInfo.emailLabel}
                </p>
                <p className="text-[14px] font-medium text-gray-900 truncate">
                  {data.personalInfo.emailValue || "-"}
                </p>
              </div>
              <div>
                <p className="text-[13px] text-gray-400 mb-1.5">
                  {data.personalInfo.phoneLabel}
                </p>
                <p className="text-[14px] font-medium text-gray-900 truncate">
                  {data.personalInfo.phoneValue || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Other Sections */}
          <div className="space-y-4 pt-2">
            {data.sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-[13px] text-gray-400 mb-1.5">
                  {section.label}
                </p>
                <div className="text-[14px] font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {section.value || "-"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 shrink-0">
          {data.status === "COMPLETED" ? (
            <Button
              disabled
              className="w-full bg-[#7300E5] opacity-70 text-white rounded-xl h-12 font-semibold"
            >
              Completed
            </Button>
          ) : data.status === "IN_FULFILLMENT" ? (
            <Button
              onClick={onComplete}
              className="w-full bg-[#7300E5] hover:bg-[#6000bf] text-white rounded-xl h-12 font-semibold"
            >
              Complete Engagement
            </Button>
          ) : data.status === "DECLINED" ? (
            <Button
              disabled
              variant="outline"
              className="w-full border-red-200 text-red-500 rounded-xl h-12 font-semibold"
            >
              Declined
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                onClick={onAccept}
                className="flex-1 bg-[#7300E5] hover:bg-[#6000bf] text-white rounded-xl h-12 font-semibold"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={onReject}
                className="flex-1 bg-white border-gray-200 text-gray-500 hover:text-white hover:bg-red-500 rounded-xl h-12 font-semibold"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
