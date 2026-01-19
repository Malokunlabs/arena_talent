"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DailyPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyPulseModal({
  isOpen,
  onClose,
}: DailyPulseModalProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHustle, setSelectedHustle] = useState<string | null>(null);

  const times = [
    { label: "Morning (6AM-12PM)", value: "morning" },
    { label: "Afternoon (12PM-6PM)", value: "afternoon" },
    { label: "Evening (6PM-12AM)", value: "evening" },
    { label: "Night (12AM-6AM)", value: "night" },
  ];

  const hustles = [
    { emoji: "🤕", value: "hurt" },
    { emoji: "🤒", value: "sick" },
    { emoji: "🔥", value: "fire" },
    { emoji: "🤞🏼", value: "fingers_crossed" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl sm:max-w-lg">
        <DialogTitle className="text-xl font-bold tracking-tight mb-4">
          Daily Pulse
        </DialogTitle>

        <div className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              What time of day do you prefer to complete gigs?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {times.map((time) => (
                <button
                  key={time.value}
                  onClick={() => setSelectedTime(time.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-colors text-center",
                    selectedTime === time.value
                      ? "bg-[#7300E5] text-white"
                      : "bg-[#F7EFFD] text-[#7300E5] hover:bg-purple-100",
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
            {selectedTime && (
              <p className="text-xs text-[#7300E5] font-semibold pl-1">
                Completed +2 Pt
              </p>
            )}
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              How&apos;s your hustle going today?
            </h3>
            <div className="flex gap-4">
              {hustles.map((hustle) => (
                <button
                  key={hustle.value}
                  onClick={() => setSelectedHustle(hustle.value)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all",
                    selectedHustle === hustle.value
                      ? "bg-[#7300E5] shadow-md scale-110"
                      : "bg-[#F7EFFD] hover:bg-purple-100",
                  )}
                >
                  {hustle.emoji}
                </button>
              ))}
            </div>
            {selectedHustle && (
              <p className="text-xs text-[#7300E5] font-semibold pl-1">
                Completed +2 Pt
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl py-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
