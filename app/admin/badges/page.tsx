"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Camera, Video, PenLine, Palette, Layout, Film, Share2, Mic2, Sparkles, BarChart3,
  Search, Filter, ArrowUpDown, Eye, CheckCircle2, XCircle, RotateCcw,
  Inbox, BadgeCheck, AlertTriangle, Clock, Download, type LucideIcon,
} from "lucide-react";
import adminBadgeService, {
  type AdminBadgeApplication,
  type AdminBadgeStats,
} from "@/services/adminBadgeService";
import { type BadgeApplicationStatus } from "@/services/badgeService";
import BadgeRequestModal from "@/components/admin/badges/BadgeRequestModal";
import RevokeConfirmModal from "@/components/admin/badges/RevokeConfirmModal";
import BadgeActionModal from "@/components/admin/badges/BadgeActionModal";
import TalentProfileModal from "@/components/admin/badges/TalentProfileModal";

// ─── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  camera: Camera, video: Video, pen: PenLine, palette: Palette,
  layout: Layout, film: Film, share: Share2, mic: Mic2, sparkles: Sparkles, chart: BarChart3,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type MainTab = "pending" | "approved" | "rejected" | "completed";

type ActiveModal =
  | { kind: "detail"; app: AdminBadgeApplication }
  | { kind: "profile"; app: AdminBadgeApplication }
  | { kind: "revoke"; app: AdminBadgeApplication }
  | { kind: "action"; type: "approve" | "reject" | "uphold" | "approve-appeal"; app: AdminBadgeApplication };

// ─── Tab status mapping ───────────────────────────────────────────────────────
const TAB_STATUSES: Record<MainTab, BadgeApplicationStatus[]> = {
  pending: ["PENDING", "UNDER_REVIEW"],
  approved: ["APPROVED"],
  rejected: ["REJECTED", "APPEALED"],
  completed: ["REVOKED"],
};

// ─── Tier pill ───────────────────────────────────────────────────────────────
function TierPill({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-[12px] text-gray-400 font-medium">No Badge</span>;
  const colors: Record<string, string> = {
    BEGINNER: "text-[#7300E5] font-semibold",
    INTERMEDIATE: "text-amber-600 font-semibold",
    PROFESSIONAL: "text-blue-700 font-semibold",
  };
  return (
    <span className={`text-[13px] ${colors[tier] ?? "text-gray-500"}`}>
      {tier.charAt(0) + tier.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Score chip ──────────────────────────────────────────────────────────────
function ScoreChip({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-400 text-[13px]">—</span>;
  const color =
    score >= 85 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-red-500";
  return (
    <span className={`flex items-center gap-1 text-[13px] font-semibold ${color}`}>
      ★ {score}%
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BadgeApplicationStatus }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Pending", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    APPROVED: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
    REJECTED: { label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
    APPEALED: { label: "Under Appeal", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    REVOKED: { label: "Revoked", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Initials avatar ─────────────────────────────────────────────────────────
function InitialsAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const colors = ["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];
  const color = colors[(firstName.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ─── Relative time ───────────────────────────────────────────────────────────
function relTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h} hours ago`;
  return `${Math.floor(h / 24)} days ago`;
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  value,
  label,
  iconCls,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconCls: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconCls}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-[12px] text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminBadgesPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("pending");
  const [stats, setStats] = useState<AdminBadgeStats | null>(null);
  const [applications, setApplications] = useState<AdminBadgeApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ActiveModal | null>(null);

  // Counts per tab (from stats)
  const tabCounts = {
    pending: stats?.pendingCount ?? 0,
    approved: stats?.totalApproved ?? 0,
    rejected: 0,
    completed: 0,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        adminBadgeService.getStats(),
        adminBadgeService.listApplications({
          status: TAB_STATUSES[activeTab][0],
          search: search || undefined,
          limit: 50,
        }),
      ]);
      setStats(statsData);
      setApplications(listData.data);
      setTotal(listData.total);
    } catch {
      /* silently handle */
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDone = () => {
    setModal(null);
    fetchData();
  };

  // ── Pending tab stats ──
  const pendingStats = [
    { icon: Inbox, value: stats?.pendingCount ?? 0, label: "Pending Requests", iconCls: "bg-purple-50 text-[#7300E5]" },
    { icon: BadgeCheck, value: stats?.approvedToday ?? 0, label: "Approved Today", iconCls: "bg-green-50 text-green-600" },
    { icon: Clock, value: stats?.avgReviewTimeHours != null ? `${stats.avgReviewTimeHours}h` : "—", label: "Avg Review Time", iconCls: "bg-amber-50 text-amber-600" },
    { icon: XCircle, value: stats?.rejectedToday ?? 0, label: "Rejected Today", iconCls: "bg-red-50 text-red-500" },
  ];

  // ── Approved tab stats ──
  const approvedStats = [
    { icon: BadgeCheck, value: stats?.totalApproved ?? 0, label: "Active Badges", iconCls: "bg-green-50 text-green-600" },
    { icon: BarChart3, value: stats?.tierUpgradesThisWeek ?? 0, label: "Tier Upgrades", iconCls: "bg-purple-50 text-[#7300E5]" },
    { icon: AlertTriangle, value: stats?.atRiskCount ?? 0, label: "At Risk", iconCls: "bg-amber-50 text-amber-600" },
    { icon: RotateCcw, value: stats?.approvedThisWeek ?? 0, label: "This Week", iconCls: "bg-blue-50 text-blue-600" },
  ];

  const activeStats = activeTab === "approved" ? approvedStats : pendingStats;

  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
        <button className="flex items-center gap-2 bg-[#7300E5] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#5c00b8] transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2 flex-wrap">
        {MAIN_TABS.map(({ key, label }) => {
          const count = tabCounts[key];
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#7300E5] text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-[#7300E5]/40"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-white" : "bg-gray-300"
                }`}
              />
              {label}
              {count > 0 && (
                <span
                  className={`text-[11px] font-bold ml-0.5 ${
                    isActive ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Search + Filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search by name, badge, or email…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all bg-white"
          />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <button className="flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-colors">
          <ArrowUpDown className="w-4 h-4" /> Sort
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid gap-4 px-5 py-3 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider"
          style={{
            gridTemplateColumns: activeTab === "approved"
              ? "2fr 2fr 1fr 1fr 1fr 1fr 1fr"
              : "2fr 2fr 1fr 1fr 1fr 1fr",
          }}
        >
          <span>Talent</span>
          <span>{activeTab === "approved" ? "Badge" : "Badge Requested"}</span>
          <span>{activeTab === "approved" ? "Tier" : "Current Tier"}</span>
          {activeTab === "approved" && <span>Status</span>}
          <span>{activeTab === "approved" ? "Approved" : "Assessment Score"}</span>
          <span>Submitted</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#7300E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">No applications found</p>
            <p className="text-gray-300 text-[12px] mt-1">
              {search ? "Try a different search term" : `No ${activeTab} badge applications yet`}
            </p>
          </div>
        ) : (
          applications.map((app) => {
            const Icon = ICON_MAP[app.badge.iconKey] ?? Sparkles;
            const isApproved = activeTab === "approved";
            const isAtRisk = false; // would be computed from user metrics

            return (
              <div
                key={app.id}
                className="grid gap-4 px-5 py-3.5 border-b border-gray-50 items-center hover:bg-gray-50/60 transition-colors last:border-0"
                style={{
                  gridTemplateColumns: isApproved
                    ? "2fr 2fr 1fr 1fr 1fr 1fr 1fr"
                    : "2fr 2fr 1fr 1fr 1fr 1fr",
                }}
              >
                {/* Talent */}
                <button
                  className="flex items-center gap-2.5 text-left"
                  onClick={() => setModal({ kind: "profile", app })}
                >
                  <InitialsAvatar firstName={app.user.firstName} lastName={app.user.lastName} />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900 hover:text-[#7300E5] transition-colors">
                      {app.user.firstName} {app.user.lastName}
                    </p>
                    <p className="text-[11px] text-gray-400">@{app.user.username}</p>
                  </div>
                </button>

                {/* Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F4ECFF] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#7300E5]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{app.badge.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {app.appliedForTier.charAt(0) + app.appliedForTier.slice(1).toLowerCase()} Tier
                    </p>
                  </div>
                </div>

                {/* Tier */}
                <TierPill tier={app.currentTier} />

                {/* Status (approved tab only) */}
                {isApproved && (
                  <div>
                    {isAtRisk ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
                        <AlertTriangle className="w-3 h-3" /> At Risk
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                )}

                {/* Score */}
                {!isApproved ? (
                  <ScoreChip score={app.assessmentScore} />
                ) : (
                  <p className="text-[12px] text-gray-500">
                    {app.reviewedAt
                      ? new Date(app.reviewedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </p>
                )}

                {/* Score (approved) */}
                {isApproved && <ScoreChip score={app.assessmentScore} />}

                {/* Submitted */}
                <p className="text-[12px] text-gray-400">{relTime(app.createdAt)}</p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {/* View profile */}
                  <button
                    onClick={() => setModal({ kind: "profile", app })}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#7300E5] hover:border-[#7300E5] transition-all"
                    title="View profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {/* Pending: approve + reject inline */}
                  {(activeTab === "pending") && (
                    <>
                      <button
                        onClick={() => setModal({ kind: "action", type: "approve", app })}
                        className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50 transition-all"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setModal({ kind: "action", type: "reject", app })}
                        className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                        title="Reject"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Approved: revoke */}
                  {activeTab === "approved" && (
                    <button
                      onClick={() => setModal({ kind: "revoke", app })}
                      className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                      title="Revoke badge"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Rejected / Appealed: resolve appeal */}
                  {activeTab === "rejected" && app.status === "APPEALED" && (
                    <>
                      <button
                        onClick={() => setModal({ kind: "action", type: "approve-appeal", app })}
                        className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50 transition-all"
                        title="Approve appeal"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setModal({ kind: "action", type: "uphold", app })}
                        className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                        title="Uphold rejection"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {total > 0 && (
        <p className="text-[12px] text-gray-400 text-center">
          Showing {applications.length} of {total} applications
        </p>
      )}

      {/* ── Modals ── */}

      {/* Detail modal (from row eye click → view request) */}
      {modal?.kind === "detail" && (
        <BadgeRequestModal
          application={modal.app}
          mode={activeTab === "approved" ? "approved" : "review"}
          onClose={() => setModal(null)}
          onApprove={() => setModal({ kind: "action", type: "approve", app: modal.app })}
          onReject={() => setModal({ kind: "action", type: "reject", app: modal.app })}
          onRevoke={() => setModal({ kind: "revoke", app: modal.app })}
        />
      )}

      {/* Talent profile modal */}
      {modal?.kind === "profile" && (
        <TalentProfileModal
          application={modal.app}
          onClose={() => setModal(null)}
          onViewBadgeRequest={() =>
            setModal({ kind: "detail", app: modal.app })
          }
        />
      )}

      {/* Revoke confirm */}
      {modal?.kind === "revoke" && (
        <RevokeConfirmModal
          applicationId={modal.app.id}
          talentName={`${modal.app.user.firstName} ${modal.app.user.lastName}`}
          badgeName={modal.app.badge.name}
          onClose={() => setModal(null)}
          onRevoked={handleDone}
        />
      )}

      {/* Action modal (approve / reject / uphold / approve-appeal) */}
      {modal?.kind === "action" && (
        <BadgeActionModal
          type={modal.type}
          applicationId={modal.app.id}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
