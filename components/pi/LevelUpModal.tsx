"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePiStore } from "@/store/usePiStore";

export default function LevelUpModal() {
  const { showLevelUp, newLevel, dismissLevelUp } = usePiStore();

  return (
    <Dialog open={showLevelUp} onOpenChange={() => dismissLevelUp()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-white border-none rounded-3xl text-center">
        <DialogTitle className="sr-only">Level Up!</DialogTitle>

        {/* Animated header */}
        <div className="bg-linear-to-br from-[#7300E5] to-[#a855f7] px-8 pt-10 pb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Level Up!
          </h2>
          <p className="text-purple-200 text-sm mt-1">
            You are on a roll!
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div>
            <p className="text-gray-500 text-sm">You have reached</p>
            <p className="text-5xl font-extrabold text-[#7300E5] mt-1">
              Level {newLevel}
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            Keep earning PI points to climb to the next level.
          </p>
          <Button
            onClick={dismissLevelUp}
            className="w-full bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold rounded-xl py-5"
          >
            Keep going!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
