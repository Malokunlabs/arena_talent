"use client";

import React, { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCollaborationStore } from "@/store/useCollaborationStore";

interface CollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  partnerId?: string;
}

const SKILL_OPTIONS = [
  "Video Editing",
  "Copywriting",
  "UGC Creation",
  "Research",
  "Design",
  "Data Entry",
  "Photography",
  "Social Media",
  "Animation",
  "Content Strategy",
];

export default function CollaborateModal({
  isOpen,
  onClose,
  partnerName = "Segun Balogun",
  partnerId,
}: CollaborateModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitRequest, isSubmitting } = useCollaborationStore();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    projectTitle: "",
    description: "",
    brief: "",
    city: "",
    startDate: new Date().toISOString().slice(0, 16), // Default to now
  });

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Video Editing",
    "Content Strategy",
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };


  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setNewSkill("");
      setIsAddingSkill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRequest({
        toUserId: partnerId,
        title: formData.projectTitle,
        description: formData.description,
        roles: selectedSkills,
        city: formData.city,
        startDate: new Date(formData.startDate).toISOString(),
        tags: ["tech"], // Default for now
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit collab request", error);
    }
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
              <Check className="h-8 w-8 stroke-3" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Request Sent!</h2>
            <p className="text-gray-500 max-w-[280px] mx-auto">
              Your proposal has been sent to{" "}
              <span className="text-[#7300E5] font-medium">
                @{partnerName.replace(" ", "").toLowerCase()}
              </span>
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
              Propose a Collaboration
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              Partner with{" "}
              <span className="text-[#7300E5] font-medium">{partnerName}</span>{" "}
              to co-create something amazing
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Your Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Chinonso Eze"
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
                placeholder="lukew@gmail.com"
                required
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-semibold">
                WhatsApp (preferred contact) *
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+234 815 701 5140"
                required
                className="h-12 rounded-lg border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectTitle" className="text-sm font-semibold">
              Project or Idea Title *
            </Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              placeholder="Product Advertisement"
              required
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-semibold">
              City *
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Lagos"
              required
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Describe what you&apos;d like to work on together *(
              {formData.description.length}/300 chars)
            </Label>
            <Textarea
              id="description"
              placeholder="I want us to make some really sharp video content for this brand. It is super promising"
              required
              maxLength={300}
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px] rounded-lg border-gray-200 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief" className="text-sm font-semibold">
              Project Brief *
            </Label>
            <Textarea
              id="brief"
              value={formData.brief}
              onChange={handleChange}
              placeholder="We just need about 3 videos, one drone shot and well edited videos"
              required
              className="min-h-[100px] rounded-lg border-gray-200 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Skills or roles you&apos;re looking for *
            </Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all",
                      isSelected
                        ? "bg-[#7300E5] text-white"
                        : "bg-[#F3E8FF] text-[#7300E5] hover:bg-[#E9D5FF]",
                    )}
                  >
                    {skill}
                  </button>
                );
              })}

              {/* Display custom selected skills that are not in SKILL_OPTIONS */}
              {selectedSkills
                .filter((s) => !SKILL_OPTIONS.includes(s))
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-[#7300E5] text-white flex items-center gap-1 transition-all"
                  >
                    {skill}
                    <X className="h-3 w-3" />
                  </button>
                ))}

              {!isAddingSkill ? (
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold border border-dashed border-[#7300E5] text-[#7300E5] hover:bg-[#F3E8FF] flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  Others
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomSkill()}
                    placeholder="Enter skill..."
                    autoFocus
                    className="h-8 w-32 text-xs rounded-full border-[#7300E5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSkill()}
                    className="h-8 w-8 rounded-full bg-[#7300E5] text-white flex items-center justify-center"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSkill(false);
                      setNewSkill("");
                    }}
                    className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {selectedSkills.length > 0 && (
              <p className="text-xs text-gray-500">
                Selected: {selectedSkills.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm font-semibold">
              Preferred start time *
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="h-12 rounded-lg border-gray-200"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl"
            >
              {isSubmitting ? (
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
              disabled={isSubmitting}
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
