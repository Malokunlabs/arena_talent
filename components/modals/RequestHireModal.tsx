"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestHireModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentName?: string;
  talentAvatar?: string;
}

export default function RequestHireModal({
  isOpen,
  onClose,
  talentName = "Ebibere Rinebai",
  talentAvatar,
}: RequestHireModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    onClose();
  };

  // Success State
  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center justify-center text-center p-10 gap-6">
          <div className="h-24 w-24 rounded-full bg-[#E8F8F0] flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-[#16A34A] flex items-center justify-center text-white">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Request Sent!</h2>
            <p className="text-gray-500 max-w-[280px] mx-auto">
              Our team will confirm availability and reach out within 24 hours
            </p>
          </div>
          <Button
            onClick={resetForm}
            variant="outline"
            className="w-full border-[#7300E5] text-[#7300E5] font-bold h-12 rounded-xl mt-4"
          >
            Back to home
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Form State
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-full p-6">
        <DialogHeader className="space-y-4">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold">
              Request Hire
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Requesting talent:{" "}
              <span className="text-[#7300E5] font-medium">{talentName}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-semibold">
              Company Name *
            </Label>
            <Input
              id="company"
              placeholder="Your company"
              required
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                required
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234"
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-semibold">
              What you need *
            </Label>
            <Select>
              <SelectTrigger className="h-12 rounded-lg border-gray-200">
                <SelectValue placeholder="Select options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ugc">UGC Video</SelectItem>
                <SelectItem value="mystery">Mystery Shopping</SelectItem>
                <SelectItem value="content">Content Creation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief" className="text-sm font-semibold">
              Project Brief *
            </Label>
            <Textarea
              id="brief"
              placeholder="Describe your project, deliverables, and objectives..."
              required
              className="min-h-[100px] rounded-lg border-gray-200 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Lagos, Abuja"
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Budget Range (₦)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="min"
                type="number"
                className="h-12 rounded-lg border-gray-200"
              />
              <Input
                placeholder="max"
                type="number"
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-semibold">
              Desired Timeline
            </Label>
            <Input
              id="timeline"
              placeholder="e.g., ASAP, 2 weeks, Dec 2025"
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#F3E8FF]/30 rounded-lg border border-[#F3E8FF]">
            <Checkbox id="terms" className="mt-1" />
            <label
              htmlFor="terms"
              className="text-xs text-gray-600 leading-relaxed cursor-pointer"
            >
              I understand GetUrgent2K will assign/approve talent and manage
              delivery. Direct contact is mediated to protect quality and
              payouts.
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl"
            >
              Submit Request
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 border-gray-300 text-gray-500 font-bold rounded-xl hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
