"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sparkles,
  Users,
  Target,
  Trophy,
  Rocket,
  Heart,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const { isAuthenticated } = useAuthStore();

  const beliefs = [
    {
      icon: Sparkles,
      title: "Show, don't tell",
      description:
        "Proof beats promises. We reward the people who put their work out there, every single day.",
    },
    {
      icon: Users,
      title: "Community first",
      description:
        "Arena is a shared stage. Wins get louder when everybody shows up for each other.",
    },
    {
      icon: Target,
      title: "Small, daily reps",
      description:
        "The Daily Pulse turns momentum into a habit. Tiny actions, stacked over weeks, change lives.",
    },
    {
      icon: Trophy,
      title: "Real recognition",
      description:
        "Points, streaks, and shout-outs go to the people doing the work — not the loudest voices.",
    },
    {
      icon: Rocket,
      title: "Move fast, in public",
      description:
        "We ship in the open, listen hard, and iterate with the people who use Arena.",
    },
    {
      icon: Heart,
      title: "Human by default",
      description:
        "Behind every profile is a person chasing something. We design like it.",
    },
  ];

  const stats = [
    { value: "12K+", label: "Active talents" },
    { value: "180K", label: "Proofs shared" },
    { value: "42", label: "Countries" },
    { value: "97%", label: "Weekly return" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* Main Content Area */}
      <main className="flex-1 pt-28 sm:pt-32 pb-20">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="w-full">
              <h1 className="text-5xl sm:text-4xl md:text-[46px] lg:text-[50px] font-semibold text-gray-900 tracking-tight leading-[1.2]">
                A home for people who{" "}
                <span className="text-[#7300E5] font-semibold">show up</span>.
              </h1>
              <p className="text-[24px] sm:text-[17px] text-black w-full leading-relaxed font-normal mt-3">
                Get Urgent2K is where everyday talent turns effort into proof.
                We built the Arena so anyone — anywhere — can post what they did
                today, get seen, and stack wins tat actually add up.
              </p>
            </div>

            {/* Hero Image Container */}
            <div className="w-full aspect-[16/9] sm:aspect-[2.2/1] max-h-[500px] relative rounded-[24px] overflow-hidden shadow-sm border border-gray-100 bg-gray-50 mt-6 sm:mt-10">
              <Image
                src="/images/about-us/about-us-image-large.jpg"
                alt="Arena - A home for people who show up"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Our Story Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start py-10 sm:py-14 border-t border-b border-gray-100">
            <div className="md:col-span-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#7300E5]">
                Our story
              </h2>
            </div>
            <div className="md:col-span-8">
              <p className="text-gray-500 text-[15px] sm:text-[16px] leading-[1.75] font-normal">
                The traditional job market demands polished resumes and
                corporate credentials. But the real world moves on proof. We
                built Arena to bridge the gap between effort and opportunity for
                the millions of creators, field researchers, developers,
                designers, and hustlers building across Africa and beyond. Arena
                gives everyday talent a transparent stage where output speaks
                louder than titles, streaks build trust, and daily consistency
                creates life-changing career momentum.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-start justify-between gap-6 py-6 sm:py-10 border-b border-gray-100 w-full">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`space-y-1 ${
                  index === stats.length - 1 ? "sm:text-right" : "text-left"
                }`}
              >
                <p className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-[#7300E5] tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] sm:text-[12px] text-gray-500 font-normal">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* What We Believe Section */}
          <div className="space-y-8 sm:space-y-10">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                What we believe
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-normal">
                Six principles that shape every decision we make about the
                Arena.
              </p>
            </div>

            {/* Belief Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {beliefs.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all hover:border-purple-200/80 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-[#F4ECFF] flex items-center justify-center text-[#7300E5] mb-5 group-hover:bg-[#7300E5] group-hover:text-white transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-[#7300E5] text-white rounded-[28px] p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-lg">
            <div className="max-w-2xl z-10 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to turn your effort into proof?
              </h3>
              <p className="text-purple-100 text-sm sm:text-base font-normal">
                Create your free profile in 2 minutes, showcase your work, and
                start getting hired.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 z-10 w-full sm:w-auto shrink-0">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button className="w-full sm:w-auto bg-white text-[#7300E5] hover:bg-purple-50 font-bold h-12 px-8 rounded-xl text-sm shadow-sm">
                  {isAuthenticated ? "Go to Dashboard" : "Join the Arena"}{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/talent">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-bold h-12 px-8 rounded-xl text-sm bg-transparent"
                >
                  Explore Talents
                </Button>
              </Link>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
