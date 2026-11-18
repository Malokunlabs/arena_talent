"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/store/useAdminStore";
import { AdminAnalyticsPayload, adminService } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Star,
  Users,
  UserPlus,
  Download,
  ArrowRight,
  ThumbsUp,
  Award,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { stats, fetchDashboardStats, isLoading } = useAdminStore();
  const [analytics, setAnalytics] = useState<AdminAnalyticsPayload | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    adminService
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => {});
  }, [fetchDashboardStats]);

  const handleExport = async (
    reportType: "arena-metrics" | "user-engagement",
  ) => {
    setExporting(true);
    try {
      await adminService.exportReport(reportType);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="p-12 flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-[#7300E5]" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const getStatusCount = (status: string) =>
    stats.proofs.byStatus.find((s) => s.status === status)?.count ?? 0;

  const approvedCount = getStatusCount("APPROVED");
  const pendingProofCount = getStatusCount("PENDING");
  const flaggedProofCount = getStatusCount("FLAGGED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor Arena posts, Proofs of the Week, users, and connection
            requests.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={() => handleExport("arena-metrics")}
            className="gap-1.5 rounded-full"
          >
            <Download className="h-3.5 w-3.5" />
            Export Metrics CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={() => handleExport("user-engagement")}
            className="gap-1.5 rounded-full"
          >
            <Download className="h-3.5 w-3.5" />
            Export Users CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-[#7300E5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proofs.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {approvedCount} approved • {pendingProofCount} pending
              {flaggedProofCount > 0 ? ` • ${flaggedProofCount} flagged` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proofs of the Week
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proofs.featured}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently featured by admin
              {stats.proofs.shadowLimited > 0
                ? ` • ${stats.proofs.shadowLimited} shadow limited`
                : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.talents.total}</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              +{stats.talents.newThisWeek} this week • {stats.talents.verified}{" "}
              verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connection Requests
            </CardTitle>
            <UserPlus className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.connections?.total ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.connections?.pending ?? 0} pending •{" "}
              {stats.connections?.accepted ?? 0} accepted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/moderation">
          <Button
            variant="outline"
            className="w-full h-12 border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-semibold rounded-full justify-between px-5"
          >
            <span>Manage Posts &amp; Moderation</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/admin/moderation?featured=true">
          <Button
            variant="outline"
            className="w-full h-12 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold rounded-full justify-between px-5"
          >
            <span>Manage Proof of the Week</span>
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          </Button>
        </Link>
        <Link href="/admin/talents">
          <Button
            variant="outline"
            className="w-full h-12 border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-semibold rounded-full justify-between px-5"
          >
            <span>View Users &amp; Connection Requests</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Platform Activity */}
        <Card className="lg:col-span-7 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Weekly Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weeklyActivity ?? []} barSize={28}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="weekLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="proofCount"
                  name="Posts Created"
                  fill="#7300E5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="newTalentsCount"
                  name="New Users"
                  fill="#A855F7"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card className="lg:col-span-5 shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800">
              Top Performing Posts
            </CardTitle>
            <Link
              href="/admin/moderation"
              className="text-xs font-semibold text-[#7300E5] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {!analytics || analytics.topProofs.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No posts yet.
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.topProofs.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {idx + 1}. {item.title || "Untitled Post"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        by {item.creator || "Arena User"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <ThumbsUp className="h-3.5 w-3.5 text-[#7300E5]" />
                        {item.likes}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Award className="h-3.5 w-3.5 text-yellow-500" />
                        {item.salutes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
