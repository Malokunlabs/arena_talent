import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#7300E5]" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              trendUp
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
