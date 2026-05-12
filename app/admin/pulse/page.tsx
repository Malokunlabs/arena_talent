"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService, Pulse, CreatePulseData } from "@/services/adminService";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trash2,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case "LIVE":
      return "bg-green-100 text-green-700 border-green-200";
    case "CLOSED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function statusDot(status: string) {
  switch (status) {
    case "LIVE":
      return "bg-green-500";
    case "CLOSED":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Default options per type
const DEFAULT_OPTIONS: Record<string, string[]> = {
  POLL: ["Option 1", "Option 2", "Option 3", "Option 4"],
  EMOJI: ["😊", "😐", "😢", "😡"],
  BRAND: ["Option 1", "Option 2"],
};

// ─── Create Pulse Modal ──────────────────────────────────────────────────────

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePulseModal({ isOpen, onClose, onSuccess }: CreateModalProps) {
  const [form, setForm] = useState<CreatePulseData>({
    type: "POLL",
    question: "",
    audience: "",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    description: "",
    status: "DRAFT",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setForm({
        type: "POLL",
        question: "",
        audience: "",
        options: [...DEFAULT_OPTIONS["POLL"]],
        description: "",
        status: "DRAFT",
        expiresAt: "",
      });
    }
  }, [isOpen]);

  const handleTypeChange = (type: "POLL" | "EMOJI" | "BRAND") => {
    setForm((f) => ({ ...f, type, options: [...DEFAULT_OPTIONS[type]] }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm((f) => {
      const opts = [...f.options];
      opts[index] = value;
      return { ...f, options: opts };
    });
  };

  const handleSubmit = async (status: "DRAFT" | "LIVE") => {
    setSaving(true);
    try {
      await adminService.createPulse({
        ...form,
        status,
        expiresAt: form.expiresAt || undefined,
        description: form.description || undefined,
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Create New Pulse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                handleTypeChange(v as "POLL" | "EMOJI" | "BRAND")
              }
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Select options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POLL">Poll</SelectItem>
                <SelectItem value="EMOJI">Emoji</SelectItem>
                <SelectItem value="BRAND">Brand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Question
            </label>
            <Input
              placeholder="What would you like to ask?"
              value={form.question}
              onChange={(e) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
              className="bg-gray-50"
            />
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Audience
            </label>
            <Input
              placeholder="e.g. Talents in Lagos"
              value={form.audience}
              onChange={(e) =>
                setForm((f) => ({ ...f, audience: e.target.value }))
              }
              className="bg-gray-50"
            />
          </div>

          {/* Options */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Options</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="bg-gray-50"
                    placeholder={`Option ${i + 1}`}
                  />
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          options: f.options.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    options: [...f.options, `Option ${f.options.length + 1}`],
                  }))
                }
                className="text-sm text-[#7300E5] font-medium hover:underline"
              >
                + Add option
              </button>
            </div>
          </div>

          {/* Description (optional) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Short description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="bg-gray-50"
            />
          </div>

          {/* Expires At (optional) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Expires at{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiresAt: e.target.value }))
              }
              className="bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              className="flex-1 bg-[#7300E5] hover:bg-[#6200c4] text-white rounded-full font-semibold"
              disabled={saving || !form.question || !form.audience}
              onClick={() => handleSubmit("LIVE")}
            >
              Create Pulse
            </Button>
            <Button
              variant="outline"
              className="rounded-full font-semibold"
              disabled={saving || !form.question || !form.audience}
              onClick={() => handleSubmit("DRAFT")}
            >
              Save to draft
            </Button>
            <Button
              variant="ghost"
              className="rounded-full font-semibold text-gray-500"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Success Modal ───────────────────────────────────────────────────────────

// ─── Details / Edit Modal ───────────────────────────────────────────────────

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pulse: Pulse | null;
  onUpdate: () => void;
}

function PulseDetailsModal({
  isOpen,
  onClose,
  pulse,
  onUpdate,
}: DetailsModalProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [form, setForm] = useState<Partial<CreatePulseData & { status: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && pulse) {
      setMode("view");
      setForm({
        type: pulse.type as "POLL" | "EMOJI" | "BRAND",
        question: pulse.question,
        audience: pulse.audience,
        options: [...pulse.options],
        description: pulse.description,
        status: pulse.status,
        expiresAt: pulse.expiresAt ? pulse.expiresAt.slice(0, 16) : "",
      });
    }
  }, [isOpen, pulse]);

  const handleSave = async () => {
    if (!pulse) return;
    setSaving(true);
    try {
      await adminService.updatePulse(pulse.id, form);
      onUpdate();
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    // Placeholder as requested
    alert("Delete API coming soon!");
  };

  if (!pulse) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between pr-8">
            {mode === "view" ? "Pulse Details" : "Edit Pulse"}
            <Badge className={`${statusColor(pulse.status)} border-none ml-4`}>
              {pulse.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {mode === "view" ? (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Type</p>
                <Badge variant="secondary" className="bg-purple-50 text-[#7300E5] border-none font-bold">
                  {pulse.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Responses</p>
                <p className="font-bold text-lg">{pulse.totalResponses}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Question</p>
              <p className="text-lg font-semibold text-gray-900 leading-tight">
                {pulse.question}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Audience</p>
              <p className="font-medium text-gray-700">{pulse.audience}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Options</p>
              <div className="grid grid-cols-1 gap-2">
                {pulse.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100 italic">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {pulse.description && (
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  &ldquo;{pulse.description}&rdquo;
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Expires</p>
                <p className="text-xs font-semibold">{fmt(pulse.expiresAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setMode("edit")}
                  className="bg-[#7300E5] hover:bg-[#6200c4] text-white rounded-xl font-bold px-6"
                >
                  Edit Pulse
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDelete}
                  className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 font-bold"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as "DRAFT" | "LIVE" | "CLOSED" })}
              >
                <SelectTrigger className="bg-gray-50 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Question</label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="bg-gray-50 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Audience</label>
              <Input
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className="bg-gray-50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Options</label>
              <div className="space-y-2">
                {form.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const next = [...(form.options || [])];
                        next[i] = e.target.value;
                        setForm({ ...form, options: next });
                      }}
                      className="bg-gray-100 border-none rounded-xl"
                    />
                    {(form.options || []).length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            options: (form.options || []).filter((_, idx) => idx !== i),
                          });
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      options: [...(form.options || []), ""],
                    })
                  }
                  className="text-xs text-[#7300E5] font-bold hover:underline"
                >
                  + Add option
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Expires At</label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="bg-gray-50 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#7300E5] hover:bg-[#6200c4] text-white rounded-xl font-bold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode("view")}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Pulse Created</h2>
            <p className="text-sm text-gray-500">
              A new pulse has been created successfully.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-6 font-semibold"
            onClick={onClose}
          >
            Back to pulse manager
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PulseManagerPage() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageCount: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchPulses = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const res = await adminService.getPulses({
          page,
          limit: 20,
          status: status === "All" ? undefined : (status as "DRAFT" | "LIVE" | "CLOSED"),
          search: search || undefined,
        });
        setPulses(res.data);
        setMeta({
          page: res.meta.page || 1,
          pageCount: res.meta.pageCount || 1,
          total: res.meta.total,
        });
      } catch {
        // errors handled by apiClient toast
      } finally {
        setIsLoading(false);
      }
    },
    [search, status],
  );

  useEffect(() => {
    fetchPulses(1);
  }, [fetchPulses]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= meta.pageCount) fetchPulses(p);
  };

  const handleSuccess = () => {
    setShowCreate(false);
    setShowSuccess(true);
    fetchPulses(1);
  };

  const handleUpdateStatus = async (id: string, status: "LIVE" | "CLOSED") => {
    try {
      await adminService.updatePulseStatus(id, status);
      fetchPulses(meta.page);
    } catch {
      // errors handled by apiClient toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pulse Manager</h1>
        <p className="text-muted-foreground">
          Review and moderate community proofs
        </p>
      </div>

      {/* Toolbar */}
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
            <SelectTrigger className="w-full md:w-[160px] bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0 bg-white">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            className="bg-[#7300E5] hover:bg-[#6200c4] text-white rounded-full font-semibold gap-2 whitespace-nowrap"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Create Pulse
          </Button>
        </div>
      </div>

      {/* Table */}
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
              <TableHead>Pulse ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-gray-400"
                >
                  Loading pulses…
                </TableCell>
              </TableRow>
            ) : pulses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-gray-400"
                >
                  No pulses found.
                </TableCell>
              </TableRow>
            ) : (
              pulses.map((pulse) => (
                <TableRow 
                  key={pulse.id} 
                  className="hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => {
                    setSelectedPulse(pulse);
                    setShowDetails(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-500 text-xs">
                    #{pulse.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700">
                      {pulse.type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">
                    {pulse.question}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pulse.totalResponses}
                  </TableCell>
                  <TableCell className="text-sm">{pulse.audience}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-1 font-normal ${statusColor(pulse.status)}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 inline-block ${statusDot(pulse.status)}`}
                      />
                      {pulse.status.charAt(0) +
                        pulse.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {fmt(pulse.expiresAt)}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {pulse.status === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(pulse.id, "LIVE")}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="gap-1 pl-2.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {Array.from({ length: Math.min(meta.pageCount, 10) }, (_, i) => (
            <Button
              key={i + 1}
              variant={meta.page === i + 1 ? "secondary" : "ghost"}
              className={`h-8 w-8 p-0 ${meta.page === i + 1 ? "bg-purple-100 text-purple-700 font-bold" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page >= meta.pageCount}
          className="gap-1 pr-2.5"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Modals */}
      <CreatePulseModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleSuccess}
      />
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <PulseDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        pulse={selectedPulse}
        onUpdate={() => fetchPulses(meta.page)}
      />
    </div>
  );
}


