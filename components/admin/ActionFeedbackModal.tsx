"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Star, FileCheck } from "lucide-react";

interface ActionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "approved" | "rejected" | "featured" | "verified";
  message: string;
  subMessage: string;
}

export default function ActionFeedbackModal({
  isOpen,
  onClose,
  type,
  message,
  subMessage,
}: ActionFeedbackModalProps) {
  const getIcon = () => {
    switch (type) {
      case "approved":
      case "verified":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-green-500 flex items-center justify-center text-green-500">
            <Check className="h-10 w-10 stroke-[3]" />
          </div>
        );
      case "rejected":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-red-100 bg-red-50 flex items-center justify-center text-red-500">
            <X className="h-10 w-10 stroke-[3]" />
          </div>
        );
      case "featured":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-green-500 flex items-center justify-center text-green-500">
            <Star className="h-10 w-10 fill-green-500 stroke-none" />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-8 flex flex-col items-center text-center bg-white border-none shadow-2xl rounded-3xl">
        <div className="mb-4">{getIcon()}</div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          {message}
        </h2>

        <p className="text-gray-500 mb-8">
          <span className="text-[#7300E5] font-semibold">
            {subMessage.split("'s")[0]}
          </span>
          {"'s" + subMessage.split("'s")[1]}
        </p>

        <Button
          onClick={onClose}
          variant="outline"
          className="rounded-full px-8 py-2 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent font-medium"
        >
          Back to moderations
        </Button>
      </DialogContent>
    </Dialog>
  );
}
