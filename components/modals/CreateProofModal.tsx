"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { Upload } from "lucide-react";
import { useProofStore } from "@/store/useProofStore";
import { toast } from "sonner";

interface CreateProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProofModal({
  isOpen,
  onClose,
}: CreateProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    caption: "",
    tags: "",
  });

  const { createProof, isLoading } = useProofStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
    // Validation
    if (!formData.title || !formData.category || !formData.caption) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!file) {
      toast.error("Please upload media");
      return;
    }

    // Since we don't have a file upload endpoint yet, we'll create a fake URL
    // In a real app, we would upload the file first, get the URL, then create the proof
    // updated to user requested URL
    const mediaUrl =
      "https://static.wikia.nocookie.net/onepiece/images/e/e5/Monkey_D._Luffy_Anime_Pre_Timeskip_Infobox.png/revision/latest?cb=20251214174652";

    // Parse tags
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const success = await createProof({
      title: formData.title,
      category: formData.category,
      caption: formData.caption,
      mediaUrl: mediaUrl,
      tags: tags,
    });

    if (success) {
      toast.success("Proof published successfully!");
      setFormData({ title: "", category: "", caption: "", tags: "" });
      setFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl sm:max-w-lg">
        <DialogTitle className="text-xl font-bold tracking-tight mb-2">
          Share Your Proof
        </DialogTitle>

        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Media Upload */}
          <div className="space-y-2">
            <Label htmlFor="media" className="font-bold text-sm">
              Media *
            </Label>
            <label
              htmlFor="media-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#7300E5] rounded-2xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              {file ? (
                <div className="w-full h-full relative overflow-hidden rounded-xl">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-[#7300E5] mb-2" />
                  <p className="text-sm text-gray-500 font-medium">
                    Upload Image or video
                  </p>
                </div>
              )}
              <input
                id="media-upload"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-bold text-sm">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What did you accomplish"
              className="rounded-xl border-gray-200"
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
            >
              <SelectTrigger className="rounded-xl border-gray-200">
                <SelectValue placeholder="Select options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UGC Content">UGC Content</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="font-bold text-sm">
              Caption * (0/220)
            </Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={handleChange}
              placeholder="Tell your story"
              className="rounded-xl border-gray-200 min-h-[100px]"
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
              placeholder="e.g., UGC, VoxPop, Lagos"
              className="rounded-xl border-gray-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl py-6"
            >
              {isLoading ? "Publishing..." : "Publish Proof (+10 Pt)"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
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
