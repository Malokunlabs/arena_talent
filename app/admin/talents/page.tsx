"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { useAdminStore } from "@/store/useAdminStore";
import {
  AdminConnectionItem,
  AdminTalent,
  ConnectionRequestStatus,
  TalentConnectionsResponse,
  adminService,
} from "@/services/adminService";
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
  Users,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Link2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DirectoryTab = "users" | "connections";

function getConnectionStatusBadge(status: ConnectionRequestStatus) {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-100 text-green-700 border-green-200";
    case "DECLINED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

export default function TalentDirectoryPage() {
  const {
    talents,
    talentsMeta,
    fetchTalents,
    verifyTalent,
    unverifyTalent,
    deleteTalent,
    isLoading,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<DirectoryTab>("users");

  // Users tab state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "All" | "PENDING" | "VERIFIED" | "REJECTED"
  >("All");
  const [emailVerified, setEmailVerified] = useState<"All" | "true" | "false">(
    "All",
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminTalent | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // User connection modal state
  const [connectionsModalUser, setConnectionsModalUser] =
    useState<AdminTalent | null>(null);
  const [userConnections, setUserConnections] =
    useState<TalentConnectionsResponse | null>(null);
  const [loadingUserConnections, setLoadingUserConnections] = useState(false);

  // Platform connections tab state
  const [connSearch, setConnSearch] = useState("");
  const [debouncedConnSearch, setDebouncedConnSearch] = useState("");
  const [connStatus, setConnStatus] = useState<
    "ALL" | ConnectionRequestStatus
  >("ALL");
  const [connectionsList, setConnectionsList] = useState<AdminConnectionItem[]>(
    [],
  );
  const [connectionsMeta, setConnectionsMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pageCount: 1,
  });
  const [loadingConnections, setLoadingConnections] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedConnSearch(connSearch.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [connSearch]);

  const loadTalents = useCallback(
    (page = 1) => {
      fetchTalents({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        verificationStatus:
          verificationStatus !== "All" ? verificationStatus : undefined,
        isEmailVerified:
          emailVerified !== "All" ? emailVerified === "true" : undefined,
      });
    },
    [fetchTalents, debouncedSearch, verificationStatus, emailVerified],
  );

  useEffect(() => {
    if (activeTab === "users") {
      loadTalents(1);
    }
  }, [activeTab, loadTalents]);

  const loadConnections = useCallback(
    async (page = 1) => {
      setLoadingConnections(true);
      try {
        const res = await adminService.getConnections({
          page,
          limit: 20,
          status: connStatus !== "ALL" ? connStatus : undefined,
          search: debouncedConnSearch || undefined,
        });
        setConnectionsList(res.data);
        setConnectionsMeta(res.meta);
      } catch {
        toast.error("Failed to fetch connection requests");
      } finally {
        setLoadingConnections(false);
      }
    },
    [connStatus, debouncedConnSearch],
  );

  useEffect(() => {
    if (activeTab === "connections") {
      loadConnections(1);
    }
  }, [activeTab, loadConnections]);

  const handleOpenUserConnections = async (talent: AdminTalent) => {
    setConnectionsModalUser(talent);
    setUserConnections(null);
    setLoadingUserConnections(true);
    try {
      const data = await adminService.getTalentConnections(talent.id);
      setUserConnections(data);
    } catch {
      toast.error("Failed to load user connection requests");
    } finally {
      setLoadingUserConnections(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= talentsMeta.pageCount) {
      loadTalents(newPage);
    }
  };

  const handleConnPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= connectionsMeta.pageCount) {
      loadConnections(newPage);
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

  return (
    <div className="space-y-6">
      {/* Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Users &amp; Connection Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Inspect Arena users, verify accounts, and monitor user connection
            requests.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "users"
                ? "bg-[#7300E5] text-white"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Users ({talentsMeta.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("connections")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "connections"
                ? "bg-[#7300E5] text-white"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            <Link2 className="h-3.5 w-3.5" />
            Connection Requests
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                onValueChange={(v) =>
                  setVerificationStatus(v as typeof verificationStatus)
                }
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
                onValueChange={(v) =>
                  setEmailVerified(v as typeof emailVerified)
                }
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

          {/* Users Table */}
          <div className="rounded-xl border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Connection Requests</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : talents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-gray-500"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  talents.map((talent) => {
                    const sentCount =
                      talent._count?.connectionRequestsSent ?? 0;
                    const receivedCount =
                      talent._count?.connectionRequestsReceived ?? 0;
                    const totalConn = sentCount + receivedCount;

                    return (
                      <TableRow key={talent.id} className="hover:bg-gray-50/50">
                        {/* User */}
                        <TableCell>
                          <Link
                            href={`/admin/talents/${talent.id}`}
                            className="flex items-center gap-3 group min-w-[180px]"
                          >
                            <UserAvatar
                              name={`${talent.firstName} ${talent.lastName}`}
                              src={talent.avatarUrl}
                              size={36}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 group-hover:text-[#7300E5] transition-colors truncate">
                                {talent.firstName} {talent.lastName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {talent.username
                                  ? `@${talent.username}`
                                  : "View profile"}
                              </p>
                            </div>
                          </Link>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {talent.email}
                              </span>
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

                        {/* Posts count */}
                        <TableCell className="text-sm font-semibold text-gray-800">
                          {talent._count?.proofs ?? 0}
                        </TableCell>

                        {/* Connections summary + inspect trigger */}
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUserConnections(talent)}
                            className="h-7 rounded-full px-3 text-xs font-medium border-purple-200 text-[#7300E5] hover:bg-purple-50 gap-1.5"
                          >
                            <Users className="h-3 w-3" />
                            <span>
                              {totalConn} ({sentCount} sent / {receivedCount}{" "}
                              recv)
                            </span>
                          </Button>
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
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(talent.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/talents/${talent.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Open user page"
                                className="h-8 w-8 text-gray-400 hover:text-[#7300E5]"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {talent.verificationStatus === "VERIFIED" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Unverify user"
                                className="h-8 w-8 text-gray-400 hover:text-yellow-600"
                                disabled={
                                  actionLoading === talent.id + "_unverify"
                                }
                                onClick={() => handleUnverify(talent)}
                              >
                                <ShieldX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Verify user"
                                className="h-8 w-8 text-gray-400 hover:text-green-600"
                                disabled={
                                  actionLoading === talent.id + "_verify"
                                }
                                onClick={() => handleVerify(talent)}
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete user"
                              className="h-8 w-8 text-gray-400 hover:text-red-600"
                              onClick={() => setDeleteTarget(talent)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                    variant={
                      talentsMeta.page === i + 1 ? "secondary" : "ghost"
                    }
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
        </>
      ) : (
        <>
          {/* Connection Requests Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requester or recipient..."
                className="pl-9 bg-white"
                value={connSearch}
                onChange={(e) => setConnSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              {(["ALL", "PENDING", "ACCEPTED", "DECLINED"] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setConnStatus(st)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                      connStatus === st
                        ? "bg-[#7300E5] text-white border-[#7300E5]"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    {st === "ALL"
                      ? "All"
                      : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* All Connection Requests Table */}
          <div className="rounded-xl border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Requester (Sender)</TableHead>
                  <TableHead />
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingConnections ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin text-[#7300E5]" />
                        <span>Loading connection requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : connectionsList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-gray-500"
                    >
                      No connection requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  connectionsList.map((conn) => (
                    <TableRow key={conn.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <Link
                          href={`/admin/talents/${conn.requester.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <UserAvatar
                            name={`${conn.requester.firstName} ${conn.requester.lastName}`}
                            src={conn.requester.avatarUrl}
                            size={32}
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900 group-hover:text-[#7300E5]">
                              {conn.requester.firstName}{" "}
                              {conn.requester.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {conn.requester.username
                                ? `@${conn.requester.username}`
                                : conn.requester.email}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="w-10 text-center">
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/admin/talents/${conn.recipient.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <UserAvatar
                            name={`${conn.recipient.firstName} ${conn.recipient.lastName}`}
                            src={conn.recipient.avatarUrl}
                            size={32}
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900 group-hover:text-[#7300E5]">
                              {conn.recipient.firstName}{" "}
                              {conn.recipient.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {conn.recipient.username
                                ? `@${conn.recipient.username}`
                                : conn.recipient.email}
                            </p>
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getConnectionStatusBadge(conn.status)}`}
                        >
                          {conn.status.charAt(0) +
                            conn.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(conn.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {connectionsMeta.pageCount > 1 && (
            <div className="flex items-center justify-between py-2">
              <Button
                variant="outline"
                onClick={() => handleConnPageChange(connectionsMeta.page - 1)}
                disabled={connectionsMeta.page <= 1}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {connectionsMeta.page} of {connectionsMeta.pageCount} (
                {connectionsMeta.total} total)
              </span>
              <Button
                variant="outline"
                onClick={() => handleConnPageChange(connectionsMeta.page + 1)}
                disabled={connectionsMeta.page >= connectionsMeta.pageCount}
                className="gap-1 pr-2.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* User Connection Requests Modal */}
      <Dialog
        open={!!connectionsModalUser}
        onOpenChange={(open) => !open && setConnectionsModalUser(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {connectionsModalUser && (
                <UserAvatar
                  name={`${connectionsModalUser.firstName} ${connectionsModalUser.lastName}`}
                  src={connectionsModalUser.avatarUrl}
                  size={36}
                />
              )}
              <div>
                <p>
                  {connectionsModalUser?.firstName}{" "}
                  {connectionsModalUser?.lastName} — Connection Requests
                </p>
                <p className="text-xs font-normal text-gray-500">
                  {connectionsModalUser?.username
                    ? `@${connectionsModalUser.username} • `
                    : ""}
                  {connectionsModalUser?.email}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {loadingUserConnections ? (
            <div className="py-12 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#7300E5]" />
              <span>Loading connection requests...</span>
            </div>
          ) : userConnections ? (
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Summary Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {[
                  { label: "Total", value: userConnections.summary.total },
                  { label: "Sent", value: userConnections.summary.sent },
                  {
                    label: "Received",
                    value: userConnections.summary.received,
                  },
                  { label: "Pending", value: userConnections.summary.pending },
                  {
                    label: "Accepted",
                    value: userConnections.summary.accepted,
                  },
                  {
                    label: "Declined",
                    value: userConnections.summary.declined,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5"
                  >
                    <p className="text-[11px] text-gray-500">{item.label}</p>
                    <p className="text-base font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {userConnections.data.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  This user has no connection requests yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border rounded-xl">
                  {userConnections.data.map((req) => {
                    const isSent = req.requesterId === connectionsModalUser?.id;
                    const peer = isSent ? req.recipient : req.requester;
                    return (
                      <div
                        key={req.id}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <Link
                          href={`/admin/talents/${peer.id}`}
                          onClick={() => setConnectionsModalUser(null)}
                          className="flex items-center gap-3 min-w-0 group"
                        >
                          <UserAvatar
                            name={`${peer.firstName} ${peer.lastName}`}
                            src={peer.avatarUrl}
                            size={34}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#7300E5]">
                              {peer.firstName} {peer.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {peer.username ? `@${peer.username}` : peer.email}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                              isSent
                                ? "bg-purple-50 text-[#7300E5]"
                                : "bg-blue-50 text-blue-700",
                            )}
                          >
                            {isSent ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownLeft className="h-3 w-3" />
                            )}
                            {isSent ? "Sent" : "Received"}
                          </span>

                          <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getConnectionStatusBadge(req.status)}`}
                          >
                            {req.status.charAt(0) +
                              req.status.slice(1).toLowerCase()}
                          </Badge>

                          <span className="text-[11px] text-gray-400 hidden sm:inline">
                            {new Date(req.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectionsModalUser(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
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
              {actionLoading === deleteTarget?.id + "_delete"
                ? "Deleting..."
                : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
