"use client";

import React, { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  FileCheck,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboardPage() {
  const { stats, fetchDashboardStats, isLoading } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading dashboard data...
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

  // Mock data for charts (since API doesn't provide time-series data yet)
  const funnelData = [
    { name: "New", value: 20 },
    { name: "Stage", value: 40 }, // "Stage" as a placeholder for "Triage"
    { name: "Awaiting Creator", value: 60 },
    { name: "Completed", value: 80 },
  ];

  const dailyPostsData = [
    { name: "Oct 15", value: 95 },
    { name: "Oct 16", value: 50 },
    { name: "Oct 17", value: 110 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor Arena activity and key metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Proofs
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proofs.total}</div>
            <p className="text-xs text-muted-foreground font-medium flex items-center">
              Total platform proofs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Hire Requests
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.talentRequests.byStatus.find((s) => s.status === "NEW")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified Talents
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.talents.verified}</div>
            <p className="text-xs text-green-500 font-medium flex items-center">
              Of {stats.talents.total} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shadow Limited
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.proofs.shadowLimited}
            </div>
            <p className="text-xs text-red-500 font-medium">
              Restricted visibility
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-12 border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-semibold rounded-full"
        >
          Go to moderation queue
        </Button>
        <Button
          variant="outline"
          className="h-12 border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-semibold rounded-full"
        >
          View top creators
        </Button>
        <Button
          variant="outline"
          className="h-12 border-[#7300E5] text-[#7300E5] hover:bg-purple-50 font-semibold rounded-full"
        >
          Export weekly report
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hire Funnel */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-500">
              Hire Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} barSize={80}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                >
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#7300E5" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Proof Posts */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-500">
              Daily Proof Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPostsData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "white",
                    stroke: "#8B5CF6",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
