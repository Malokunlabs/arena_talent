"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminStore } from "@/store/useAdminStore";
import { AdminTalent } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function TalentDirectoryPage() {
  const { talents, talentsMeta, fetchTalents, verifyTalent, unverifyTalent, deleteTalent, isLoading } =
    useAdminStore();

  const [search, setSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"All" | "PENDING" | "VERIFIED" | "REJECTED">("All");
  const [emailVerified, setEmailVerified] = useState<"All" | "true" | "false">("All");
  const [deleteTarget, setDeleteTarget] = useState<AdminTalent | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadTalents = (page = 1) => {
    fetchTalents({
      page,
      limit: 20,
      search: search || undefined,
      verificationStatus: verificationStatus !== "All" ? verificationStatus : undefined,
      isEmailVerified: emailVerified !== "All" ? emailVerified === "true" : undefined,
    });
  };

  useEffect(() => {
    loadTalents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, verificationStatus, emailVerified]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= talentsMeta.pageCount) {
      loadTalents(newPage);
    }
  };

  const handleVerify = async (talent: AdminTalent) => {
    setActionLoading(talent.id + "_verify");
    await verifyTalent(talent.id);
    setActionLoading(null);
  };

  const handleUnverify = async (talent: AdminTalent) => {
    setActionLoading(talent.id + "_unverify");
    await unverifyTalent(talent.id);
    setActionLoading(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id + "_delete");
    await deleteTalent(deleteTarget.id);
    setActionLoading(null);
    setDeleteTarget(null);
  };

  const getVerificationBadge = (status: AdminTalent["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
    }
  };

  const getVerificationDot = (status: AdminTalent["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getInitials = (talent: AdminTalent) => {
    return `${talent.firstName.charAt(0)}${talent.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Talent Directory</h1>
        <p className="text-muted-foreground">
          Manage and verify talent accounts on the platform
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Talents", value: talentsMeta.total, color: "text-gray-900" },
          {
            label: "Verified",
            value: talents.filter((t) => t.verificationStatus === "VERIFIED").length,
            color: "text-green-600",
          },
          {
            label: "Pending",
            value: talents.filter((t) => t.verificationStatus === "PENDING").length,
            color: "text-yellow-600",
          },
          {
            label: "Email Verified",
            value: talents.filter((t) => t.isEmailVerified).length,
            color: "text-blue-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, email, or username"
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Select
            value={verificationStatus}
            onValueChange={(v) => setVerificationStatus(v as typeof verificationStatus)}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Verification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={emailVerified}
            onValueChange={(v) => setEmailVerified(v as typeof emailVerified)}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Email Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Emails</SelectItem>
              <SelectItem value="true">Email Verified</SelectItem>
              <SelectItem value="false">Email Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Talent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Email Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : talents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  No talents found.
                </TableCell>
              </TableRow>
            ) : (
              talents.map((talent) => (
                <TableRow key={talent.id} className="hover:bg-gray-50/50">
                  {/* Talent */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center text-[#7300E5] font-bold text-sm shrink-0">
                        {talent.avatarUrl ? (
                          <Image
                            src={talent.avatarUrl}
                            alt={`${talent.firstName} ${talent.lastName}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          getInitials(talent)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {talent.firstName} {talent.lastName}
                        </p>
                        {talent.username && (
                          <p className="text-xs text-gray-400">@{talent.username}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{talent.email}</span>
                      </div>
                      {talent.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{talent.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    {talent.location ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                        {talent.location}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </TableCell>

                  {/* Email status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-xs font-normal ${
                        talent.isEmailVerified
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          talent.isEmailVerified ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      />
                      {talent.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>

                  {/* Verification status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full text-xs font-normal ${getVerificationBadge(talent.verificationStatus)}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getVerificationDot(talent.verificationStatus)}`}
                      />
                      {talent.verificationStatus.charAt(0) +
                        talent.verificationStatus.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-xs text-gray-500">
                    {new Date(talent.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {talent.verificationStatus === "VERIFIED" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Unverify talent"
                          className="h-8 w-8 text-gray-400 hover:text-yellow-600"
                          disabled={actionLoading === talent.id + "_unverify"}
                          onClick={() => handleUnverify(talent)}
                        >
                          <ShieldX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Verify talent"
                          className="h-8 w-8 text-gray-400 hover:text-green-600"
                          disabled={actionLoading === talent.id + "_verify"}
                          onClick={() => handleVerify(talent)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete talent"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => setDeleteTarget(talent)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {talentsMeta.pageCount > 1 && (
        <div className="flex items-center justify-between py-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(talentsMeta.page - 1)}
            disabled={talentsMeta.page <= 1}
            className="gap-1 pl-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {Array.from({ length: talentsMeta.pageCount }, (_, i) => (
              <Button
                key={i + 1}
                variant={talentsMeta.page === i + 1 ? "secondary" : "ghost"}
                className={`h-8 w-8 p-0 ${
                  talentsMeta.page === i + 1
                    ? "bg-purple-100 text-purple-700 font-bold"
                    : ""
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => handlePageChange(talentsMeta.page + 1)}
            disabled={talentsMeta.page >= talentsMeta.pageCount}
            className="gap-1 pr-2.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Talent Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </span>
              {"'s"} account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === deleteTarget?.id + "_delete"}
            >
              {actionLoading === deleteTarget?.id + "_delete" ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
