"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminStore } from "@/store/useAdminStore";
import { AdminProof } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Eye,
  Check,
  X,
  ShieldAlert,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProofDetailModal from "@/components/admin/ProofDetailModal";
import ActionFeedbackModal from "@/components/admin/ActionFeedbackModal";

export default function ProofModerationPage() {
  const { proofs, proofsMeta, fetchProofs, isLoading } = useAdminStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedProof, setSelectedProof] = useState<AdminProof | null>(null);
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    type: "approved" | "rejected" | "featured" | "verified";
    message: string;
    subMessage: string;
  }>({
    isOpen: false,
    type: "approved",
    message: "",
    subMessage: "",
  });

  useEffect(() => {
    fetchProofs({
      search,
      status: status === "All" ? undefined : status,
      page: 1,
    });
  }, [search, status, fetchProofs]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= proofsMeta.pageCount) {
      fetchProofs({
        search,
        status: status === "All" ? undefined : status,
        page: newPage,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      case "FLAGGED":
        return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handleActionComplete = (
    type: "approved" | "rejected" | "featured" | "verified",
    proof: AdminProof,
  ) => {
    let message = "";
    let subMessage = `@${proof.talent?.username || proof.talent?.firstName} 's proof `;

    switch (type) {
      case "approved":
        message = "Proof approved";
        subMessage += "has been approved";
        break;
      case "rejected":
        message = "Proof rejected";
        subMessage += "has been rejected";
        break;
      case "featured":
        message = "Proof featured";
        subMessage += "has been featured";
        break;
      case "verified":
        message = "Proof verified";
        subMessage += "has been verified";
        break;
    }

    setFeedbackState({
      isOpen: true,
      type,
      message,
      subMessage,
    });
    setSelectedProof(null); // Close detail modal
    // Refresh list
    fetchProofs({
      search,
      status: status === "All" ? undefined : status,
      page: proofsMeta.page,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Proof Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate community proofs
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by user, title, or category"
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Status
          </span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-[180px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FLAGGED">Flagged</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0 bg-white">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[50px]">
                <Input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Proof ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>User</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Salutes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading proofs...
                </TableCell>
              </TableRow>
            ) : proofs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No proofs found.
                </TableCell>
              </TableRow>
            ) : (
              proofs.map((proof) => (
                <TableRow key={proof.id}>
                  <TableCell>
                    <Input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-500 text-xs">
                    #{proof.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{proof.category || "General"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={
                            proof.talent?.avatarUrl ||
                            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2576&auto=format&fit=crop"
                          }
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-sm">
                        {proof.talent?.firstName} {proof.talent?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{proof.talent?.location || "-"}</TableCell>
                  <TableCell>{proof.salutesCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 font-normal ${getStatusColor(proof.status)}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${proof.status === "APPROVED" ? "bg-green-500" : proof.status === "REJECTED" ? "bg-red-500" : proof.status === "FLAGGED" ? "bg-orange-500" : "bg-blue-500"}`}
                      ></span>
                      {formatStatus(proof.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-gray-900"
                        onClick={() => setSelectedProof(proof)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-blue-600"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-yellow-500"
                      >
                        <Star className="h-4 w-4" />
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
      <div className="flex items-center justify-between py-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(proofsMeta.page - 1)}
          disabled={proofsMeta.page <= 1}
          className="gap-1 pl-2.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {Array.from({ length: proofsMeta.pageCount }, (_, i) => (
            <Button
              key={i + 1}
              variant={proofsMeta.page === i + 1 ? "secondary" : "ghost"}
              className={`h-8 w-8 p-0 ${proofsMeta.page === i + 1 ? "bg-purple-100 text-purple-700 font-bold" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => handlePageChange(proofsMeta.page + 1)}
          disabled={proofsMeta.page >= proofsMeta.pageCount}
          className="gap-1 pr-2.5"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {selectedProof && (
        <ProofDetailModal
          isOpen={!!selectedProof}
          onClose={() => setSelectedProof(null)}
          proof={selectedProof}
          onActionComplete={handleActionComplete}
        />
      )}

      {feedbackState.isOpen && (
        <ActionFeedbackModal
          isOpen={feedbackState.isOpen}
          onClose={() =>
            setFeedbackState((prev) => ({ ...prev, isOpen: false }))
          }
          type={feedbackState.type}
          message={feedbackState.message}
          subMessage={feedbackState.subMessage}
        />
      )}
    </div>
  );
}
