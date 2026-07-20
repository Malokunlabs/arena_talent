"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Award,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import badgeService, {
  type BadgeDashboard,
  type BadgeApplication,
  type SkillBadge,
  type BadgeTier,
} from "@/services/badgeService";
import { mediaService } from "@/services/mediaService";
import BadgeCard from "@/components/dashboard/badges/BadgeCard";
import BadgeDetailView from "@/components/dashboard/badges/BadgeDetailView";
import ChecklistPanel from "@/components/dashboard/badges/ChecklistPanel";
import TierPrivilegesPanel from "@/components/dashboard/badges/TierPrivilegesPanel";
import FormRenderer from "@/components/dashboard/badges/FormRenderer";

type BadgeTab = "all" | "pending" | "verified";
type MainTab = "badge-detail" | "skill-assessment";
type View = "list" | "detail" | "apply";

// ─── Risk Alert Banner ────────────────────────────────────────────────────────

// function RiskBanner() {
//   const [dismissed, setDismissed] = useState(false);
//   if (dismissed) return null;
//   return (
//     <div className="flex items-center justify-between bg-[#FFFBEB] border border-yellow-200 rounded-2xl px-4 py-3 gap-4">
//       <div className="flex items-center gap-3 min-w-0">
//         <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
//         <div className="min-w-0">
//           <p className="text-sm font-bold text-yellow-800">
//             On-Time Delivery at Risk
//           </p>
//           <p className="text-[12px] text-yellow-600 truncate">
//             Your on-time delivery rate dropped to 84% (threshold: 85%). Complete
//             your next 3 gigs on time to maintain Beginner tier.
//           </p>
//         </div>
//       </div>
//       <button
//         onClick={() => setDismissed(true)}
//         className="text-[12px] font-semibold text-yellow-700 border border-yellow-300 rounded-xl px-3 py-1.5 hover:bg-yellow-100 transition-colors shrink-0"
//       >
//         View Details
//       </button>
//     </div>
//   );
// }

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-[#F4ECFF] flex items-center justify-center mb-5">
        <Award className="w-9 h-9 text-[#7300E5]" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Badges Yet</h2>
      <p className="text-[14px] text-gray-500 max-w-sm mb-6">
        Earn verified skill badges to showcase your expertise and unlock higher
        earning potential on Arena.
      </p>
      <button
        onClick={onBrowse}
        className="flex items-center gap-2 bg-[#7300E5] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#5c00b8] transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Browse Available Badges
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Skill Assessment Stepper ──────────────────────────────────────────────────

function SkillAssessmentView({
  badge,
  onBack,
  onSubmit,
}: {
  badge: SkillBadge;
  onBack: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const processedValues = { ...formValues };
      
      // Map file uploads to URLs
      for (const field of badge.formSchema || []) {
        if (field.type === "file_upload" && Array.isArray(processedValues[field.id])) {
          const files = processedValues[field.id] as { url?: string }[];
          processedValues[field.id] = files.map((f) => f.url).filter(Boolean);
        }
      }

      await onSubmit(processedValues);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {["Select Skill", "Submit Work", "Review"].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    i === 0
                      ? "bg-[#7300E5] text-white"
                      : i === 1
                        ? "bg-[#7300E5] text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i === 0 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[13px] font-semibold ${
                    i <= 1 ? "text-[#7300E5]" : "text-gray-400"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 ${
                    i === 0 ? "bg-[#7300E5]" : "bg-gray-100"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Risk Banner */}
      {/* <RiskBanner /> */}

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <FormRenderer
          fields={badge.formSchema}
          values={formValues}
          onChange={(id, val) =>
            setFormValues((prev) => ({ 
              ...prev, 
              [id]: typeof val === 'function' ? val(prev[id]) : val 
            }))
          }
          badgeName={badge.name}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 bg-[#7300E5] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5c00b8] transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Submit for Review ↗"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const [dashboard, setDashboard] = useState<BadgeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>("badge-detail");
  const [badgeTab, setBadgeTab] = useState<BadgeTab>("all");
  const [view, setView] = useState<View>("list");
  const [selectedBadge, setSelectedBadge] = useState<SkillBadge | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<BadgeApplication | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await badgeService.getDashboard();
      setDashboard(data);
    } catch {
      // silently fail, empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const myApplications = dashboard?.myApplications ?? [];
  const allBadges = dashboard?.badges ?? [];

  const pendingApps = myApplications.filter((a) =>
    ["PENDING", "UNDER_REVIEW", "APPEALED"].includes(a.status),
  );
  const verifiedApps = myApplications.filter((a) => a.status === "APPROVED");

  const applicationByBadgeId = Object.fromEntries(
    myApplications.map((a) => [a.badgeId, a]),
  );

  const handleSelectBadge = (badge: SkillBadge) => {
    const existing = applicationByBadgeId[badge.id];
    setSelectedBadge(badge);
    if (existing) {
      setSelectedApplication(existing);
      setView("detail");
      setMainTab("badge-detail");
    } else {
      setSelectedApplication(null);
      setView("apply");
      setMainTab("skill-assessment");
    }
  };

  const handleStartAssessment = () => {
    setMainTab("skill-assessment");
    setView("apply");
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedBadge) return;
    await badgeService.submitApplication(selectedBadge.slug, {
      submissionData: formData,
      appliedForTier: "BEGINNER" as BadgeTier,
    });
    await fetchDashboard();
    setView("list");
    setMainTab("badge-detail");
    setBadgeTab("pending");
  };

  const handleBack = () => {
    setView(myApplications.length > 0 ? "list" : "list");
    setMainTab("badge-detail");
    setShowAllBadges(false);
  };

  const hasAnyBadge = myApplications.length > 0;

  // ── Badge grid to display ──
  const getBadgesForTab = () => {
    if (badgeTab === "pending")
      return allBadges.filter((b) =>
        pendingApps.some((a) => a.badgeId === b.id),
      );
    if (badgeTab === "verified")
      return allBadges.filter((b) =>
        verifiedApps.some((a) => a.badgeId === b.id),
      );
    return allBadges; // "all"
  };

  const displayedBadges = hasAnyBadge
    ? getBadgesForTab()
    : showAllBadges
      ? allBadges
      : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#7300E5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMainTab("badge-detail");
            if (view === "apply") setView("list");
          }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mainTab === "badge-detail"
              ? "bg-[#7300E5] text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-[#7300E5]/40"
          }`}
        >
          Badge Detail
        </button>
        <button
          onClick={() => setMainTab("skill-assessment")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            mainTab === "skill-assessment"
              ? "bg-[#7300E5] text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-[#7300E5]/40"
          }`}
        >
          Skill Assessment
        </button>
      </div>

      {/* Risk Banner (always visible) */}
      {/* <RiskBanner /> */}

      {/* ─── Badge Detail Tab ─── */}
      {mainTab === "badge-detail" && (
        <>
          {/* Sub-tabs */}
          {(hasAnyBadge || showAllBadges) && view === "list" && (
            <div className="flex gap-5 border-b border-gray-100 pb-0">
              {(["all", "pending", "verified"] as BadgeTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBadgeTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 ${
                    badgeTab === tab
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-400 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab === "all"
                    ? "All Badges"
                    : tab === "pending"
                      ? `Pending Badges${pendingApps.length > 0 ? ` (${pendingApps.length})` : ""}`
                      : `Verified Badges${verifiedApps.length > 0 ? ` (${verifiedApps.length})` : ""}`}
                </button>
              ))}
            </div>
          )}

          {/* Detail view when a badge is selected */}
          {view === "detail" && selectedApplication && (
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to badges
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  <BadgeDetailView
                    application={selectedApplication}
                    onStartAssessment={handleStartAssessment}
                  />
                  <ChecklistPanel items={selectedApplication.checklist ?? []} />
                </div>
                <div>
                  <TierPrivilegesPanel
                    tiers={selectedApplication.badge.tiers ?? []}
                    currentTier={selectedApplication.currentTier}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Badge grid list */}
          {view === "list" && (
            <>
              {!hasAnyBadge && !showAllBadges ? (
                <EmptyState onBrowse={() => setShowAllBadges(true)} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedBadges.map((badge) => {
                    const app = applicationByBadgeId[badge.id];
                    return (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        onApply={handleSelectBadge}
                        applied={!!app}
                        applicationStatus={app?.status}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── Skill Assessment Tab ─── */}
      {mainTab === "skill-assessment" && (
        <>
          {view === "apply" && selectedBadge ? (
            <SkillAssessmentView
              badge={selectedBadge}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] text-gray-500 font-medium">
                Select a badge below to start your skill assessment
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {allBadges.map((badge) => {
                  const app = applicationByBadgeId[badge.id];
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      onApply={(b) => {
                        setSelectedBadge(b);
                        setView("apply");
                      }}
                      applied={!!app}
                      applicationStatus={app?.status}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
