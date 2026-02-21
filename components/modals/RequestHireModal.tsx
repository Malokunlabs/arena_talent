"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
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
import { useTalentStore } from "@/store/useTalentStore";
import { useToast } from "@/hooks/use-toast";

interface RequestHireModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentName?: string;
  talentAvatar?: string;
  talentId?: string;
}

export default function RequestHireModal({
  isOpen,
  onClose,
  talentName = "Agatha",
  talentAvatar,
  talentId,
}: RequestHireModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { sendTalentRequest, isSendingRequest } = useTalentStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    requestType: "",
    projectBrief: "",
    location: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    terms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, requestType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, terms: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!talentId) {
      toast({
        title: "Error",
        description: "Talent ID is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.terms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation for numbers
    const minBudget = parseFloat(formData.budgetMin);
    const maxBudget = parseFloat(formData.budgetMax);

    if (isNaN(minBudget) || isNaN(maxBudget)) {
      toast({
        title: "Invalid Budget",
        description: "Please enter valid numbers for the budget range.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendTalentRequest({
        talentId,
        companyName: formData.companyName,
        email: formData.email,
        requestType: formData.requestType,
        projectBrief: formData.projectBrief,
        budgetMin: minBudget,
        budgetMax: maxBudget,
        phone: formData.phone,
        location: formData.location,
        timeline: formData.timeline,
      });
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled in store but we can show toast here if needed
      toast({
        title: "Request Failed",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      companyName: "",
      email: "",
      phone: "",
      requestType: "",
      projectBrief: "",
      location: "",
      budgetMin: "",
      budgetMax: "",
      timeline: "",
      terms: false,
    });
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
            <Label htmlFor="companyName" className="text-sm font-semibold">
              Company Name *
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234"
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType" className="text-sm font-semibold">
              What you need *
            </Label>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger className="h-12 rounded-lg border-gray-200">
                <SelectValue placeholder="Select options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mystery Shop">Mystery Shop</SelectItem>
                <SelectItem value="UGC Video">UGC Video</SelectItem>
                <SelectItem value="Content Creation">
                  Content Creation
                </SelectItem>
                <SelectItem value="Field Ops">Field Ops</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectBrief" className="text-sm font-semibold">
              Project Brief *
            </Label>
            <Textarea
              id="projectBrief"
              value={formData.projectBrief}
              onChange={handleChange}
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
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Lagos, Abuja"
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Budget Range (N)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                placeholder="min"
                type="number"
                className="h-12 rounded-lg border-gray-200"
              />
              <Input
                id="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
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
              value={formData.timeline}
              onChange={handleChange}
              placeholder="e.g., ASAP, 2 weeks, Dec 2025"
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#F3E8FF]/30 rounded-lg border border-[#F3E8FF]">
            <Checkbox
              id="terms"
              checked={formData.terms}
              onCheckedChange={handleCheckboxChange}
              className="mt-1"
            />
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
              disabled={isSendingRequest}
              className="flex-1 h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl"
            >
              {isSendingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSendingRequest}
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
