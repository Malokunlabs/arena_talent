"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, MapPin, Calendar, CheckCircle2, Star, Clock, Edit, Share, Download, Edit2, ImageIcon } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { talentService, TalentProfile } from "@/services/talentService";
import { proofService, Proof } from "@/services/proofService";
import PIProgressBar from "@/components/pi/PIProgressBar";
import UserAvatar from "@/components/UserAvatar";
import { usePiStore } from "@/store/usePiStore";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUserStore();
  const { piStatus, fetchPiStatus } = usePiStore();
  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [featuredProofs, setFeaturedProofs] = useState<Proof[]>([]);
  
  useEffect(() => {
    fetchPiStatus();
  }, [fetchPiStatus]);
  
  useEffect(() => {
    if (user?.username) {
      talentService.getTalentByUsername(user.username).then(setProfileData).catch(console.error);
      proofService.getMyProofs({ limit: 4 }).then(res => {
        setFeaturedProofs(res.data);
      }).catch(console.error);
    }
  }, [user?.username]);

  const stats = profileData?.stats;
  const talent = profileData?.talent || user;

  const joinDate = talent?.createdAt 
    ? new Date(talent.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : "Jun 2024";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 mt-4">
      
      {/* Header Profile Info (No Cover) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-8 relative shadow-sm">
        <UserAvatar
          name={talent ? `${talent.firstName} ${talent.lastName}` : "User"}
          src={talent?.avatarUrl}
          size={112}
          className="border-[6px] border-white shadow-lg shrink-0"
        />

        <div className="flex-1 w-full">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
             <div>
               <div className="flex items-center gap-3">
                 <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{talent?.firstName} {talent?.lastName}</h1>
                 <span className="inline-flex items-center gap-1.5 bg-[#F4ECFF] text-[#7300E5] px-2.5 py-1 rounded-full text-xs font-bold">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                 </span>
               </div>
               <p className="text-gray-500 text-sm mt-1.5 font-medium">@{talent?.username} • /u/{talent?.username}</p>
             </div>
             <div className="flex items-center gap-3 flex-wrap">
                <Button className="bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl gap-2 font-bold px-6 h-11"><Edit className="w-4 h-4" /> Edit Profile</Button>
                <Button variant="outline" className="bg-[#1A1D21] text-white hover:bg-gray-800 rounded-xl gap-2 font-bold px-6 h-11 border-0"><Share className="w-4 h-4" /> Share Profile</Button>
                <Button variant="outline" className="rounded-xl gap-2 font-bold px-6 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4" /> Download CV</Button>
             </div>
          </div>

          <p className="text-gray-600 mt-5 max-w-3xl leading-relaxed text-[15px]">
            {talent?.bio || "Mystery shopper and field reporter. Eyes everywhere. Turning every gig into a story worth sharing. Based in Lagos, available for DCAS audits, UGC content, and field operations across Nigeria."}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-sm text-gray-500 font-semibold">
             <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {talent?.location || "Not set"}</div>
             <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Joined {joinDate}</div>
             <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-gray-400" /> {stats?.totalGigs ?? 0} Gigs Done</div>
             <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-gray-400" /> {stats?.rating ?? 0} Rating</div>
             <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Responds in 24h</div>
          </div>
        </div>
      </div>

      {/* Top 4 Stats Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
            <h3 className="text-3xl font-black text-gray-900">{stats?.totalProofs ?? 0}</h3>
            <p className="text-gray-500 text-sm font-semibold mt-1">Proofs</p>
         </div>
         <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
            <h3 className="text-3xl font-black text-gray-900">{stats?.totalGigs ?? 0}</h3>
            <p className="text-gray-500 text-sm font-semibold mt-1">Gigs</p>
         </div>
         <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
            <h3 className="text-3xl font-black text-gray-900">{stats?.totalSalutes ?? 0}</h3>
            <p className="text-gray-500 text-sm font-semibold mt-1">Salutes</p>
         </div>
         <div className="bg-white rounded-3xl border border-gray-200 py-7 text-center shadow-sm">
            <h3 className="text-3xl font-black text-gray-900">0</h3>
            <p className="text-gray-500 text-sm font-semibold mt-1">Reviews</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-8 space-y-6">
          {/* About */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {talent?.bio || "Experienced field researcher and content creator with over 2 years in the gig economy. Specialized in DCAS audits, mystery shopping, and user-generated content production. I've worked with brands like Brandify Nigeria, Malokun Labs, and Swift Research NG. My approach combines attention to detail with creative storytelling — every audit report tells a story, every video captures an authentic moment."}
            </p>
          </div>

          {/* Top Skills */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
            <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
               <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
               </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Top Skills</h2>
            <p className="text-sm text-gray-500 mb-6">Select up to 5 skills that best represent your expertise</p>
            
            <div className="flex flex-wrap gap-3">
              {(talent?.skills?.length ? talent.skills : ["DCAS", "Field Ops", "Mystery Shop", "UGC Video", "Vox Pop"]).map((skill) => (
                <div key={skill} className="px-4 py-2 rounded-full border border-purple-400 bg-[#F4ECFF] text-[#7300E5] text-sm font-bold">
                  {skill}
                </div>
              ))}
              {["Video Editing", "Social Media", "Copywriting", "Content Strategy", "Transcription", "FGD Moderation", "Photography"].map((skill) => (
                <div key={skill} className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-semibold">
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Featured Proofs */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Featured Proofs</h2>
              <Link href="/dashboard/proofs">
                <button className="px-4 py-1.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-100">View All</button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mb-6">Your best work showcased</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProofs.length > 0 ? (
                featuredProofs.map((proof) => (
                 <div key={proof.id} className="border border-gray-100 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center">
                       {proof.mediaUrl ? (
                          <Image src={proof.mediaUrl} alt={proof.title} fill className="object-cover" />
                       ) : (
                          <div className="flex flex-col items-center justify-center text-gray-300">
                             <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                             <span className="text-xs font-semibold">Image Placeholder</span>
                          </div>
                       )}
                    </div>
                    <div className="p-5 bg-white">
                       <h4 className="font-bold text-gray-900 text-[15px] mb-2.5 truncate">{proof.title}</h4>
                       <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                          <span className="flex items-center gap-1.5 text-gray-600"><CheckCircle2 className="w-4 h-4 text-gray-400" /> {proof.status || "Completed"}</span>
                          <span className="flex items-center gap-1.5 text-gray-600">🙌 {proof.salutesCount || 0} Salutes</span>
                       </div>
                    </div>
                 </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-gray-500 text-sm font-medium">No featured proofs yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Reviews */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Client Reviews</h2>
              <span className="text-2xl font-black text-[#7300E5]">4.8</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">What brands say about working with you</p>

            <div className="space-y-6">
              {[1].map((i) => (
                <div key={i} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#F4ECFF] text-[#7300E5] font-bold flex items-center justify-center shrink-0 text-lg">
                       ML
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px]">Malokun Labs</h4>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">2 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
                    "Excellent work, very thorough and professional. Reports were detailed and delivered ahead of schedule. The photo documentation was top-notch. Will definitely hire again for future audits."
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#F4ECFF] text-[#7300E5] px-4 py-2 rounded-xl text-xs font-bold">
                    <MapPin className="w-4 h-4" /> DCAS Audit — 12 Locations
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
             <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
               <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
               </button>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Connect</h2>
            <div className="flex flex-wrap gap-3">
               {["WhatsApp", "Instagram", "Twitter", "LinkedIn", "TikTok", "YouTube"].map((platform) => (
                 <button key={platform} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
                   <span className="w-4 h-4 rounded bg-gray-200 inline-block opacity-50" /> {platform}
                 </button>
               ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Level / PI Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center">
             <div className="inline-flex items-center gap-2 bg-[#F4ECFF] text-[#7300E5] px-4 py-1.5 rounded-full text-sm font-extrabold mb-6">
               👑 Level {piStatus?.level ?? talent?.progressIndex ?? 0}
             </div>
             <h2 className="text-[56px] leading-none font-black text-[#7300E5] mb-2">{piStatus?.piScore ?? talent?.piScore ?? 0}</h2>
             <p className="text-sm text-gray-500 font-semibold mb-8">Progress Index (PI)</p>

             <PIProgressBar />
          </div>

          {/* Availability */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-5">Availability</h2>
             
             <div className="bg-[#F4ECFF] border border-purple-100 rounded-2xl p-5 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#7300E5] shadow-sm shadow-purple-400"></div>
                   <div>
                     <p className="text-[#7300E5] font-extrabold text-[15px]">Available for Hire</p>
                     <p className="text-gray-500 text-xs mt-0.5 font-medium">Brands can send you requests</p>
                   </div>
                </div>
                {/* Custom Toggle visual mock */}
                <div className="w-12 h-6 bg-green-400 rounded-full flex items-center justify-end p-1 shrink-0 shadow-inner">
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>

             <div className="space-y-3">
                <Button className="w-full h-12 bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl font-bold shadow-sm">
                   💼 Hire Me
                </Button>
                <Button className="w-full h-12 bg-[#7300E5] hover:bg-[#6000c0] text-white rounded-xl font-bold shadow-sm">
                   🤝 Let's Collaborate
                </Button>
             </div>
          </div>

          {/* Badges */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Badges</h2>
                <button className="px-4 py-1.5 bg-gray-50 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-100">View All</button>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">🔥</div>
                      <div>
                         <p className="font-bold text-gray-900 text-[15px]">7-Day Active</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">Logged in 7 days straight</p>
                      </div>
                   </div>
                   <span className="text-[11px] text-gray-400 font-bold shrink-0">Jan 2026</span>
                </div>

                <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center text-xl shrink-0">👑</div>
                      <div>
                         <p className="font-bold text-gray-900 text-[15px]">Legend</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">Completed 100+ gigs</p>
                      </div>
                   </div>
                   <span className="text-[11px] text-gray-400 font-bold shrink-0">Mar 2026</span>
                </div>

                <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">⚡</div>
                      <div>
                         <p className="font-bold text-gray-900 text-[15px]">Top Hustler</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">Top 10% earners this month</p>
                      </div>
                   </div>
                   <span className="text-[11px] text-gray-400 font-bold shrink-0">Apr 2026</span>
                </div>

                <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-xl shrink-0">🔍</div>
                      <div>
                         <p className="font-bold text-gray-900 text-[15px]">Street Analyst</p>
                         <p className="text-xs text-gray-500 mt-0.5 font-medium">50+ field reports submitted</p>
                      </div>
                   </div>
                   <span className="text-[11px] text-gray-400 font-bold shrink-0">Feb 2026</span>
                </div>
             </div>
          </div>

          {/* This Month */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-6">This Month</h2>
             
             <div className="space-y-5">
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                   <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#7300E5]" /> Gigs Completed
                   </div>
                   <span className="font-black text-gray-900 text-lg">12</span>
                </div>
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                   <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                      <Image src="/dashboard-icons/homepage/proofs-shared-icon.svg" width={18} height={18} alt="icon" /> Proofs Shared
                   </div>
                   <span className="font-black text-gray-900 text-lg">8</span>
                </div>
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                   <div className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                      <span className="text-[#7300E5] text-lg">🙌</span> Salutes Received
                   </div>
                   <span className="font-black text-gray-900 text-lg">45</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-[15px] font-bold text-[#7300E5]">
                      ⚡ PI Earned
                   </div>
                   <span className="font-black text-gray-900 text-lg">+24</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
