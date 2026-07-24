"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { proofService, Proof } from "@/services/proofService";
import { toast } from "sonner";

interface EditProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: Proof | null;
  onUpdated: (updatedProof: Proof) => void;
}

export default function EditProofModal({
  isOpen,
  onClose,
  proof,
  onUpdated,
}: EditProofModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    caption: "",
    tags: "",
  });

  useEffect(() => {
    if (proof) {
      setFormData({
        title: proof.title || "",
        category: proof.category || "UGC Content",
        caption: proof.caption || "",
        tags: proof.tags ? proof.tags.join(", ") : "",
      });
    }
  }, [proof]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async () => {
    if (!proof) return;
    if (!formData.title || !formData.category || !formData.caption) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter((tag) => tag.length > 0);

      const updated = await proofService.updateProof(proof.id, {
        title: formData.title,
        category: formData.category,
        caption: formData.caption,
        tags: tagsArray,
      });

      toast.success("Proof updated successfully!");
      onUpdated(updated);
      onClose();
    } catch {
      toast.error("Failed to update proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl sm:max-w-lg">
        <DialogTitle className="text-xl font-bold tracking-tight mb-2">
          Edit Proof
        </DialogTitle>

        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-bold text-sm">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Proof Title"
              className="rounded-xl border-gray-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="font-bold text-sm">
              Category *
            </Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.category}
              disabled={isSubmitting}
            >
              <SelectTrigger className="rounded-xl border-gray-200">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UGC Content">UGC Content</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
                <SelectItem value="Field Ops">Field Ops</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="font-bold text-sm">
              Caption * ({formData.caption.length}/220)
            </Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={handleChange}
              placeholder="Tell your story"
              className="rounded-xl border-gray-200 min-h-[100px]"
              maxLength={220}
              disabled={isSubmitting}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="font-bold text-sm">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., photography, lagos, markets"
              className="rounded-xl border-gray-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl py-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-[#7300E5] text-gray-600 hover:text-gray-900 border-opacity-30 rounded-xl py-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
