"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import TalentCard from "@/components/TalentCard";
import TalentFilters from "@/components/TalentFilters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTalentStore } from "@/store/useTalentStore";
import { Talent } from "@/services/talentService";

export default function TalentPage() {
  const router = useRouter();
  const { talents, fetchTalents, isLoading } = useTalentStore();

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleRequest = (talent: Talent) => {
    if (talent.username) {
      router.push(`/profile?username=${talent.username}`);
    }
  };

  const handleClearFilters = () => {
    fetchTalents();
  };

  return (
    <main className="min-h-screen pt-10 pb-12 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-black">
              Explore Arena Talents
            </h1>
            <p className="text-[#747682] text-sm">
              Discover verified talents sharing proofs of their work on Arena.
            </p>
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-[#F3E8FF] border-[#F3E8FF] text-[#7E00EE] font-bold rounded-xl justify-start gap-2"
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
            <aside className="hidden lg:block sticky top-20 bg-transparent pr-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-black">Filters</h2>
                </div>
                <TalentFilters onClear={handleClearFilters} />
              </div>
            </aside>

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
                    <h3 className="text-lg font-bold text-black">
                      No talents found
                    </h3>
                    <p className="text-[#747682] max-w-sm mt-1">
                      We couldn&apos;t find any talents that match your filters.
                    </p>
                  </div>
                  <Button
                    onClick={handleClearFilters}
                    className="bg-[#7E00EE] text-white font-bold rounded-xl mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
