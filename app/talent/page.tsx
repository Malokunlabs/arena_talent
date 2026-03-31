"use client";

import React, { useState, useEffect } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import TalentCard from "@/components/TalentCard";
import TalentFilters from "@/components/TalentFilters";
import RequestHireModal from "@/components/modals/RequestHireModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTalentStore } from "@/store/useTalentStore";
import { Talent } from "@/services/talentService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

export default function TalentPage() {
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { talents, fetchTalents, isLoading } = useTalentStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleRequest = (talent: Talent) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to hire talent.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTalent(talent);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    fetchTalents(); // Reset to default
  };

  return (
    <main className="min-h-screen pt-24 pb-12 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Hire Verified Local Talent
            </h1>
            <p className="text-gray-500 text-sm">
              Curated by GetUrgent2K. Requests are approved by our team to
              protect quality.
            </p>
          </div>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-[#F3E8FF] border-[#F3E8FF] text-[#7300E5] font-bold rounded-xl justify-start gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto w-[300px]">
                <SheetHeader className="pb-6">
                  <SheetTitle className="text-left text-xl font-bold">
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <TalentFilters onClear={handleClearFilters} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block sticky top-28 bg-transparent pr-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Filters</h2>
                </div>
                <TalentFilters onClear={handleClearFilters} />
              </div>
            </aside>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 text-center">
                  <p>Loading talents...</p>
                </div>
              ) : talents.length > 0 ? (
                talents.map((talent) => (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
                    onRequest={handleRequest}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      No talents found
                    </h3>
                    <p className="text-gray-500 max-w-sm mt-1">
                      We couldn&apos;t find any talents that match your filters.
                      Try adjusting your search to discover more verified
                      creators.
                    </p>
                  </div>
                  <Button
                    onClick={handleClearFilters}
                    className="bg-[#7300E5] text-white font-bold rounded-xl mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RequestHireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        talentName={
          selectedTalent
            ? `${selectedTalent.firstName} ${selectedTalent.lastName}`
            : ""
        }
        talentId={selectedTalent?.id}
      />
    </main>
  );
}
