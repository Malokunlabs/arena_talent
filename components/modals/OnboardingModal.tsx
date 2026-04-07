"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const { updateUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    bio: "",
    location: "",
    skills: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast({
        title: "Username required",
        description: "Please choose a username to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateUser({
        ...formData,
        // Ensure username is lowercase and URL-safe-ish
        username: formData.username.toLowerCase().replace(/\s+/g, "_"),
      });

      if (success) {
        toast({
          title: "Profile completed!",
          description: "Welcome to the Arena.",
        });
        onClose();
      }
    } catch {
      // Error handled by store/apiClient
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Just a few more details to get you started in the Arena.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold">
              Username <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                @
              </span>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                className="pl-8 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <p className="text-[10px] text-gray-500">
              Only letters, numbers, and underscores.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+234..."
                className="rounded-xl border-gray-200"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="Lagos, Nigeria"
                className="rounded-xl border-gray-200"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              className="rounded-xl border-gray-200 min-h-[100px]"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. Photoshop)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-xl border-gray-200"
              />
              <Button
                type="button"
                onClick={addSkill}
                size="icon"
                className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border-purple-100 flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-gray-400 italic">No skills added yet.</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 text-lg shadow-lg shadow-purple-200"
            >
              {isSubmitting ? "Saving Profile..." : "Complete Setup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
