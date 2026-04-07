"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TalentFiltersProps {
  onClear: () => void;
}

export default function TalentFilters({ onClear }: TalentFiltersProps) {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
        <div className="space-y-2">
          {[
            "Research",
            "UGC",
            "Creative",
            "Field Ops",
            "Survey",
            "Mystery Shop",
          ].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                className="rounded-full data-[state=checked]:bg-[#7300E5] data-[state=checked]:border-[#7300E5]"
              />
              <Label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Location</h3>
        <Select>
          <SelectTrigger className="w-full text-gray-500 rounded-xl bg-white border-gray-200">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="lagos">Lagos</SelectItem>
            <SelectItem value="abuja">Abuja</SelectItem>
            <SelectItem value="ph">Port Harcourt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "UGC Video",
            "Vox Pop",
            "Transcription",
            "DCAS",
            "FGD Moderation",
            "Mystery Shop",
          ].map((skill) => (
            <div
              key={skill}
              className="px-3 py-1.5 rounded-full bg-[#F3E8FF] text-[#7300E5] text-xs font-bold cursor-pointer hover:bg-[#E9D5FF] transition-colors"
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Minimum Rating</h3>
        <Select>
          <SelectTrigger className="w-full text-gray-500 rounded-xl bg-white border-gray-200">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
            <SelectItem value="4.0">4.0+</SelectItem>
            <SelectItem value="3.5">3.5+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="available"
          className="rounded-full data-[state=checked]:bg-[#7300E5] data-[state=checked]:border-[#7300E5]"
        />
        <Label
          htmlFor="available"
          className="text-sm font-medium leading-none text-gray-700"
        >
          Available now only
        </Label>
      </div>

      <Button
        variant="outline"
        onClick={onClear}
        className="w-full border-[#7300E5] text-[#7300E5] font-bold rounded-xl hover:bg-[#F3E8FF]"
      >
        Clear Filters
      </Button>
    </div>
  );
}
