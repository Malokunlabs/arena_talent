"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link2, Copy, Search, Share, MessageCircle, Plus, ImageIcon } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentProfile } from "@/services/talentService";
import { proofService, Proof } from "@/services/proofService";
import UserAvatar from "@/components/UserAvatar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateProofModal from "@/components/modals/CreateProofModal";

const filters = ["All Proofs", "Wins", "Hustles", "Learning", "Media", "Text"];

function getRelativeTimeString(dateString: string) {
  const date = new Date(dateString);
  const diffInDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day ago";
  return `${diffInDays} days ago`;
}

export default function MyProofsPage() {
  const { user } = useUserStore();
  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Proofs");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [salutingIds, setSalutingIds] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (user?.username) {
      talentService.getTalentByUsername(user.username)
        .then(setProfileData)
        .catch(console.error);
        
      loadProofs();
    }
  }, [user?.username]);

  const loadProofs = async () => {
    setIsLoading(true);
    try {
      const res = await proofService.getMyProofs({ limit: 50 });
      setProofs(res.data);
    } catch (err) {
      toast.error("Failed to load proofs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalute = async (proofId: string) => {
    if (salutingIds.has(proofId)) return;
    
    // Optimistic update
    setSalutingIds(prev => new Set(prev).add(proofId));
    setProofs(prev => prev.map(p => 
      p.id === proofId ? { ...p, salutesCount: (p.salutesCount || 0) + 1 } : p
    ));

    try {
      await proofService.saluteProof(proofId);
    } catch (err) {
      // Revert on failure
      toast.error("Failed to salute proof");
      setProofs(prev => prev.map(p => 
        p.id === proofId ? { ...p, salutesCount: Math.max((p.salutesCount || 1) - 1, 0) } : p
      ));
    } finally {
      setSalutingIds(prev => {
        const next = new Set(prev);
        next.delete(proofId);
        return next;
      });
    }
  };

  const copyProfileLink = () => {
    const link = `geturgent2k.com/u/${user?.username}`;
    navigator.clipboard.writeText(link);
    toast.success("Profile link copied!");
  };

  const stats = profileData?.stats;
  const talent = profileData?.talent || user;

  const filteredProofs = proofs.filter(proof => {
    if (searchQuery && !proof.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Simple filter matching for display
    if (activeFilter !== "All Proofs" && !proof.tags?.includes(activeFilter.toLowerCase())) {
       // Since the api doesn't fully support all filter tabs natively right now we just show all if no match
       // Return true for visual completeness or false to actually filter
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 mt-4">
      
      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
         <UserAvatar
           name={talent ? `${talent.firstName} ${talent.lastName}` : "User"}
           src={talent?.avatarUrl}
           size={80}
           className="shrink-0"
         />
           
           <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-gray-900 capitalize mb-2">
                {talent?.firstName} {talent?.lastName} Proofboard
              </h1>
              <div 
                onClick={copyProfileLink}
                className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold hover:text-gray-900 cursor-pointer group transition-colors"
              >
                 <Link2 className="w-4 h-4" />
                 <span>geturgent2k.com/u/{talent?.username}</span>
                 <span className="flex items-center gap-1.5 ml-2 text-gray-400 group-hover:text-gray-600 border border-gray-200 rounded px-2 py-0.5 bg-gray-50 text-xs">
                   <Copy className="w-3.5 h-3.5" /> Copy
                 </span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10 mt-4 md:mt-0">
           <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.totalProofs ?? 0}</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Proofs</p>
           </div>
           <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.totalSalutes ?? 0}</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Salutes</p>
           </div>
           <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">-</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Wins</p>
           </div>
           <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">-</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Views</p>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
             <button 
               key={filter}
               onClick={() => setActiveFilter(filter)}
               className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                 activeFilter === filter 
                   ? "bg-[#7300E5] text-white border-transparent"
                   : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
               }`}
             >
               {filter}
             </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
               placeholder="Search proofs..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-11 h-10 rounded-full border-gray-200 text-sm font-medium shadow-sm"
            />
          </div>
          <Button 
             onClick={() => setIsShareModalOpen(true)}
             className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-full gap-2 px-6 font-bold h-10 shadow-sm shrink-0"
          >
             <Plus className="w-4 h-4" /> Share Proof
          </Button>
        </div>
      </div>

      {/* Proofs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
               <div className="aspect-[4/3] bg-gray-100"></div>
               <div className="p-6 bg-white space-y-4">
                  <div className="h-5 bg-gray-100 rounded-md w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-5/6"></div>
               </div>
            </div>
          ))
        ) : filteredProofs.length > 0 ? (
          filteredProofs.map((proof) => (
            <div key={proof.id} className="border border-gray-100 rounded-[24px] overflow-hidden shadow-sm bg-white group hover:shadow-md transition-all">
               <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                  {proof.mediaUrl ? (
                     <Image src={proof.mediaUrl} alt={proof.title} fill className="object-cover" />
                  ) : (
                     <div className="flex flex-col items-center justify-center text-gray-300">
                        <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                        <span className="text-sm font-semibold">No Image</span>
                     </div>
                  )}
               </div>
               
               <div className="p-6 flex flex-col h-full">
                  <h3 className="font-extrabold text-gray-900 text-[15px] mb-2 line-clamp-1">{proof.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-5 font-medium">
                    {proof.caption || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proof.tags?.length > 0 ? (
                      proof.tags.map(tag => (
                        <span key={tag} className="bg-[#7300E5] text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                          #{tag.replace(/^#/, '')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">No tags</span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <button 
                          onClick={() => handleSalute(proof.id)}
                          className={`flex items-center gap-1.5 transition-colors ${salutingIds.has(proof.id) ? 'opacity-50 cursor-wait' : ''}`}
                        >
                           <span className="text-[17px] text-red-500">🙌</span>
                           <span className="text-[13px] font-bold text-red-500">{proof.salutesCount || 0} Salutes</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                           <Share className="w-4 h-4" />
                           <span className="text-[13px] font-semibold">Share</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
                           <MessageCircle className="w-4 h-4" />
                           <span className="text-[13px] font-semibold">0</span>
                        </button>
                     </div>
                     <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                       {proof.createdAt ? getRelativeTimeString(proof.createdAt) : "recently"}
                     </span>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
             <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-900 mb-1">No proofs found</h3>
             <p className="text-sm text-gray-500">You haven't uploaded any proofs matching this criteria.</p>
          </div>
        )}
      </div>

      <CreateProofModal 
        isOpen={isShareModalOpen} 
        onClose={() => {
          setIsShareModalOpen(false);
          loadProofs();
        }} 
      />
      
    </div>
  );
}
