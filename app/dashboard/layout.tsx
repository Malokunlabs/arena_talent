import React from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50 pt-24">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">{children}</main>
    </div>
  );
}
