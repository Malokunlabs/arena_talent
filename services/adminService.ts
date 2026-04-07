import { apiClient } from "@/services/apiClient";
import { Proof } from "@/services/proofService";

export interface DashboardStats {
  proofs: {
    total: number;
    featured: number;
    shadowLimited: number;
    byStatus: { status: string; count: number }[];
  };
  talentRequests: {
    total: number;
    overdue: number;
    byStatus: { status: string; count: number }[];
  };
  talents: {
    total: number;
    available: number;
    verified: number;
    newThisWeek: number;
  };
}

export interface AdminProof extends Proof {
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  isVerified: boolean;
  isFeatured: boolean;
  shadowLimited: boolean;
}

export interface ProofResponse {
  data: AdminProof[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

export interface ProofFilter {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get("/admin/dashboard");
  },

  async getProofs(filter: ProofFilter = {}): Promise<ProofResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.status && filter.status !== "All")
      params.append("status", filter.status);
    // Note: Search probably goes to a generic 'search' or 'q' param, assuming 'search' based on standard practices, or handle client side if API doesn't support.
    // The dummy.txt didn't explicitly show search param in the curl example but image has search. I'll add it.
    if (filter.search) params.append("search", filter.search);

    return apiClient.get(`/admin/proofs?${params.toString()}`);
  },

  async approveProof(id: string, message?: string): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/approve`, { message });
  },

  async rejectProof(
    id: string,
    reason: string,
    message?: string,
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/reject`, { reason, message });
  },

  async featureProof(
    id: string,
    isFeatured: boolean,
    message?: string,
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/feature`, {
      isFeatured,
      message,
    });
  },

  async shadowLimitProof(
    id: string,
    shadowLimited: boolean,
    message?: string,
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/shadow-limit`, {
      shadowLimited,
      message,
    });
  },

  async getTalentRequestsKanban(): Promise<KanbanColumn[]> {
    return apiClient.get("/admin/talent-requests/kanban");
  },

  async getCollaborationRequestsKanban(): Promise<CollaborationKanbanColumn[]> {
    return apiClient.get("/admin/collaboration-requests/kanban");
  },

  async updateTalentRequest(
    id: string,
    data: Partial<TalentRequest>,
  ): Promise<TalentRequest> {
    return apiClient.patch(`/admin/talent-requests/${id}`, data);
  },

  async getPulses(filter: PulseFilter = {}): Promise<PulseResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.status && filter.status !== "All")
      params.append("status", filter.status);
    if (filter.search) params.append("search", filter.search);
    return apiClient.get(`/pulse?${params.toString()}`);
  },

  async createPulse(data: CreatePulseData): Promise<Pulse> {
    return apiClient.post("/pulse", data);
  },

  async updatePulseStatus(id: string, status: "DRAFT" | "LIVE" | "CLOSED"): Promise<Pulse> {
    return apiClient.patch(`/pulse/${id}`, { status });
  },
};

export interface TalentRequest {
  id: string;
  talentId: string;
  companyName: string;
  email: string;
  requestType: string;
  projectBrief: string;
  budgetMin: number;
  budgetMax: number;
  location: string | null;
  city: string | null;
  timeline: string;
  status:
    | "NEW"
    | "TRIAGED"
    | "AWAITING_CREATOR"
    | "AWAITING_PAYMENT"
    | "IN_FULFILLMENT"
    | "COMPLETED"
    | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  status: string;
  items: TalentRequest[];
}

export interface CollaborationRequestAdmin {
  id: string;
  fromUserId: string;
  toUserId: string | null;
  title: string;
  description: string;
  status: string;
  city: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  toUser?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface CollaborationKanbanColumn {
  status: string;
  items: CollaborationRequestAdmin[];
}

export interface Pulse {
  id: string;
  type: "POLL" | "EMOJI" | "BRAND";
  question: string;
  description?: string;
  options: string[];
  audience: string;
  status: "DRAFT" | "LIVE" | "CLOSED";
  expiresAt?: string;
  totalResponses: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PulseResponse {
  data: Pulse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

export interface CreatePulseData {
  type: "POLL" | "EMOJI" | "BRAND";
  question: string;
  audience: string;
  options: string[];
  description?: string;
  status: "DRAFT" | "LIVE";
  expiresAt?: string;
}

export interface PulseFilter {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
