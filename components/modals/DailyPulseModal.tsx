"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePulseStore } from "@/store/usePulseStore";
import { pulseService } from "@/services/pulseService";
import { usePiStore } from "@/store/usePiStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface DailyPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyPulseModal({
  isOpen,
  onClose,
}: DailyPulseModalProps) {
  const { activePulse, clearPulse } = usePulseStore();
  const { refreshAfterProof } = usePiStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOption || !activePulse) return;
    
    setIsSubmitting(true);
    try {
      await pulseService.respondToPulse(activePulse.id, selectedOption);
      setShowThankYou(true);
      refreshAfterProof(5);
      
      // Auto close and clear after 2 seconds
      setTimeout(() => {
        onClose();
        clearPulse(); // remove from active pulse so it doesn't show again
        setShowThankYou(false);
        setSelectedOption(null);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to submit pulse",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    onClose();
    router.push("/login");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setTimeout(() => {
      setShowThankYou(false);
      setSelectedOption(null);
    }, 300);
  };

  const hasValidPulse = activePulse && activePulse.question && (activePulse.options || []).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl sm:max-w-lg">
        <DialogTitle className="text-xl font-bold tracking-tight mb-4 text-center">
          Daily Pulse
        </DialogTitle>

        {showThankYou ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-[#F7EFFD] rounded-full flex items-center justify-center text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-bold text-gray-900">Thank you!</h3>
            <p className="text-muted-foreground font-medium">+5 Pt</p>
          </div>
        ) : !hasValidPulse ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <h3 className="text-xl font-bold text-gray-900">You&apos;re all caught up! ✨</h3>
            <p className="text-gray-500">
              We&apos;ll have fresh tasks soon. Check back later to earn more points.
            </p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-[#7300E5] hover:bg-[#7300E5]/90 text-white font-bold rounded-xl px-10"
            >
              Got it
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 text-center">
                {activePulse.question}
              </h3>
              
              {activePulse.description && (
                <p className="text-sm text-gray-500 text-center -mt-2">
                  {activePulse.description}
                </p>
              )}

              {activePulse.type === "EMOJI" ? (
                <div className="flex flex-wrap justify-center gap-4 py-4">
                  {(activePulse.options || []).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all",
                        selectedOption === option
                          ? "bg-[#7300E5] shadow-md scale-110"
                          : "bg-[#F7EFFD] hover:bg-purple-100"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {(activePulse.options || []).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-bold transition-all text-center border-2",
                        selectedOption === option
                          ? "border-[#7300E5] bg-[#7300E5] text-white"
                          : "border-transparent bg-[#F7EFFD] text-[#7300E5] hover:bg-purple-100"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            {!isAuthenticated && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-xs text-purple-700 leading-relaxed font-medium">
                  You&apos;re viewing this as a guest. <strong>Sign in</strong> to start earning points for your insights!
                </p>
              </div>
            )}
          </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl py-6"
              >
                Cancel
              </Button>
              {isAuthenticated ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedOption || isSubmitting}
                  className="flex-1 bg-[#7300E5] hover:bg-[#7300E5]/90 text-white rounded-xl py-6 font-bold"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button
                  onClick={handleSignIn}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-bold shadow-lg shadow-primary/20"
                >
                  Sign in to earn +5 Pt
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
