"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Trash2 } from "lucide-react";

export type AdminFeedbackType =
  | "approved"
  | "rejected"
  | "featured"
  | "unfeatured"
  | "verified"
  | "flagged"
  | "deleted";

interface ActionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AdminFeedbackType;
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
            <Check className="h-10 w-10 stroke-3" />
          </div>
        );
      case "rejected":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-red-100 bg-red-50 flex items-center justify-center text-red-500">
            <X className="h-10 w-10 stroke-3" />
          </div>
        );
      case "featured":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center text-yellow-500">
            <Star className="h-10 w-10 fill-yellow-500 stroke-yellow-500" />
          </div>
        );
      case "unfeatured":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500">
            <Star className="h-10 w-10" />
          </div>
        );
      case "deleted":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-red-100 bg-red-50 flex items-center justify-center text-red-500">
            <Trash2 className="h-9 w-9" />
          </div>
        );
      case "flagged":
        return (
          <div className="h-20 w-20 rounded-full border-4 border-orange-100 bg-orange-50 flex items-center justify-center text-orange-500">
            <X className="h-10 w-10 stroke-3" />
          </div>
        );
    }
  };

  const parts = subMessage.split("'s");
  const hasPossessive = parts.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-8 flex flex-col items-center text-center bg-white border-none shadow-2xl rounded-3xl">
        <div className="mb-4">{getIcon()}</div>

        <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          {message}
        </DialogTitle>

        <p className="text-gray-500 mb-8 text-sm">
          {hasPossessive ? (
            <>
              <span className="text-[#7300E5] font-semibold">{parts[0]}</span>
              {"'s" + parts.slice(1).join("'s")}
            </>
          ) : (
            subMessage
          )}
        </p>

        <Button
          onClick={onClose}
          variant="outline"
          className="rounded-full px-8 py-2 border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent font-medium"
        >
          Back to posts
        </Button>
      </DialogContent>
    </Dialog>
  );
}
