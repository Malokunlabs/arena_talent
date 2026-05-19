"use client";

import React, { useEffect, useState } from "react";
import { usePulseStore } from "@/store/usePulseStore";
import { pulseService, PulseStats } from "@/services/pulseService";
import { Check, Flame, Zap, Gift, Activity, TrendingUp, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePiStore } from "@/store/usePiStore";

export default function DailyPulsePage() {
  const { activePulse, fetchActivePulse, clearPulse } = usePulseStore();
  const { refreshAfterProof } = usePiStore();
  
  const [stats, setStats] = useState<PulseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const loadData = async () => {
    setIsLoadingStats(true);
    try {
      const [statsData] = await Promise.all([
        pulseService.getPulseStats(),
        fetchActivePulse(),
      ]);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load pulse data");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!selectedOption || !activePulse) return;
    
    setIsSubmitting(true);
    try {
      await pulseService.respondToPulse(activePulse.id, selectedOption);
      setShowThankYou(true);
      refreshAfterProof(2); // Each question worth 2 PI in this context
      
      // Auto advance to next question
      setTimeout(() => {
        clearPulse();
        setShowThankYou(false);
        setSelectedOption(null);
        loadData(); // Re-fetch active pulse and updated stats
      }, 1500);
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStats && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7300E5]" />
      </div>
    );
  }

  const completedLast7Days = stats?.last7DaysHistory.filter(d => d.completed).length || 0;

  return (
    <div className="max-w-[900px] mx-auto space-y-8 pb-20 mt-4">
      
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl shrink-0">
            🔥
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#7300E5] mb-1">
              {stats?.currentStreak || 0} Day Streak!
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Keep it going — answer all questions today to maintain your streak
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 justify-between md:justify-end">
          {stats?.weekProgress.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[36px]">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                day.isToday && !day.completed ? "bg-[#7300E5] text-white shadow-md shadow-purple-200" :
                day.completed ? "bg-[#F7EFFD] text-[#7300E5]" : 
                "bg-gray-100 text-gray-400"
              )}>
                {day.completed ? <Check className="w-5 h-5" /> : day.isToday ? day.date.split('-')[2] : <Check className="w-5 h-5 opacity-0" />}
              </div>
              <span className={cn(
                "text-[11px] font-bold",
                day.isToday ? "text-[#7300E5]" : "text-gray-400"
              )}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7EFFD] flex items-center justify-center text-[#7300E5]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">+{stats?.todayAvailablePi || 0} PI</h3>
              <p className="text-xs font-semibold text-gray-500">Available today</p>
            </div>
          </div>
          <span className="bg-[#F7EFFD] text-[#7300E5] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Pending
          </span>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7EFFD] flex items-center justify-center text-[#7300E5]">
              <Gift className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">+{stats?.streakBonusAvailable || 0} PI</h3>
              <p className="text-xs font-semibold text-gray-500">Streak bonus</p>
            </div>
          </div>
          <span className="bg-[#F7EFFD] text-[#7300E5] px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Pending
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-300">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">{stats?.currentStreak || 0} Days</h3>
              <p className="text-xs font-semibold text-gray-500">Current streak</p>
            </div>
          </div>
          <span className="bg-gray-100 text-gray-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Active
          </span>
        </div>
      </div>

      {/* Today's Questions */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Today's Questions</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Answer all to earn maximum PI</p>
          </div>
          <div className="bg-[#F7EFFD] text-[#7300E5] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current" /> +{stats?.todayAvailablePi || 0} PI available
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {showThankYou ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#F7EFFD] rounded-full flex items-center justify-center text-4xl">
                🎉
              </div>
              <h3 className="text-2xl font-black text-gray-900">Awesome!</h3>
              <p className="text-[#7300E5] font-bold">+2 PI Earned</p>
            </div>
          ) : activePulse ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="w-8 h-8 bg-[#F7EFFD] text-[#7300E5] rounded-full flex items-center justify-center font-bold text-sm mb-4">
                {(stats?.answeredQuestionsToday || 0) + 1}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {activePulse.question}
              </h3>
              {activePulse.description && (
                <p className="text-sm text-gray-500 mb-6">
                  {activePulse.description}
                </p>
              )}

              <div className="space-y-3 mt-8">
                {activePulse.type === "EMOJI" ? (
                  <div className="flex flex-wrap gap-4 py-4">
                    {(activePulse.options || []).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={cn(
                          "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center text-3xl transition-all border-2",
                          selectedOption === option
                            ? "border-[#7300E5] bg-purple-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/50"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {(activePulse.options || []).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={cn(
                          "px-5 py-4 rounded-xl text-sm font-semibold transition-all text-left border-2 flex items-center gap-4",
                          selectedOption === option
                            ? "border-[#7300E5] bg-white text-[#7300E5] shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selectedOption === option ? "border-[#7300E5]" : "border-gray-300"
                        )}>
                           {selectedOption === option && <div className="w-2.5 h-2.5 rounded-full bg-[#7300E5]" />}
                        </div>
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                   <Zap className="w-4 h-4 text-[#7300E5] fill-current" /> +2 PI on completion
                 </div>
                 <Button
                    onClick={handleSubmit}
                    disabled={!selectedOption || isSubmitting}
                    className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl px-8 font-bold shadow-sm"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Answer"}
                 </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mb-2">
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900">You're all caught up!</h3>
              <p className="text-gray-500 font-medium text-center max-w-sm">
                You've completed all available pulse questions for today. Check back tomorrow to maintain your streak!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-[#F9FAFB] border border-gray-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="bg-[#F7EFFD] text-[#7300E5] px-6 py-4 rounded-2xl">
             <div className="flex items-center gap-1.5 font-black text-2xl mb-1">
               <Zap className="w-5 h-5 fill-current text-yellow-400" /> +{stats?.totalPotentialToday || 0} PI
             </div>
             <p className="text-xs font-semibold opacity-80">Total potential today</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
               {stats?.answeredQuestionsToday || 0} of {stats?.totalQuestionsToday || 0} <span className="text-gray-500 font-medium">answered</span>
            </p>
          </div>
        </div>
        <Button disabled className="w-full sm:w-auto bg-[#D3B3F8] text-white opacity-80 rounded-xl px-8 font-bold">
           🔒 Answer All Questions
        </Button>
      </div>

      {/* Last 7 Days History */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h2 className="text-lg font-bold text-gray-900">Last 7 Days</h2>
               <p className="text-sm text-gray-500 font-medium mt-0.5">Your pulse completion history</p>
            </div>
            <div className="bg-[#F4ECFF] text-[#7300E5] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
               <Check className="w-3.5 h-3.5" /> {completedLast7Days}/7 completed
            </div>
         </div>

         <div className="flex items-stretch gap-3 overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
            {stats?.last7DaysHistory.map((day, i) => (
              <div key={i} className={cn(
                "min-w-[100px] flex-1 rounded-2xl border flex flex-col items-center justify-center p-5 gap-3 transition-colors",
                day.isToday ? "border-purple-100 bg-purple-50/30" : "border-gray-100 bg-white"
              )}>
                 <span className={cn(
                   "text-xs font-bold",
                   day.isToday ? "text-[#7300E5]" : "text-gray-500"
                 )}>{day.day}</span>
                 
                 <div className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                   day.completed ? "bg-[#7300E5] text-white" : "bg-purple-50 text-[#7300E5]"
                 )}>
                   {day.completed ? <Check className="w-5 h-5" /> : <div className="w-3 h-0.5 bg-current rounded-full" />}
                 </div>

                 <span className={cn(
                   "text-[11px] font-bold",
                   day.completed ? "text-gray-300" : "text-gray-900"
                 )}>
                   {day.completed ? `+${day.piEarned} PI` : day.piEarned > 0 ? `+${day.piEarned} PI` : "—"}
                 </span>
              </div>
            ))}
         </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
         <h2 className="text-lg font-bold text-gray-900 mb-6">Insights</h2>
         
         <div className="space-y-6">
           {stats?.insights.map((insight, i) => {
             const Icon = insight.type === 'roll' ? TrendingUp : insight.type === 'tip' ? Zap : Bell;
             const colorClass = insight.type === 'roll' ? 'text-purple-500 bg-purple-100' : 
                                insight.type === 'tip' ? 'text-[#7300E5] bg-[#F7EFFD]' : 
                                'text-purple-600 bg-purple-100';
             
             return (
               <div key={i} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                 <div className={cn("w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center", colorClass)}>
                   <Icon className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-[15px] mb-1">{insight.title}</h4>
                   <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                     {insight.text}
                   </p>
                 </div>
               </div>
             );
           })}
         </div>
      </div>

    </div>
  );
}
