import { apiClient } from "@/services/apiClient";
import { Proof } from "@/services/proofService";

export interface AdminTalent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  isEmailVerified: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface TalentListResponse {
  data: AdminTalent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

export interface TalentFilter {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  isEmailVerified?: boolean;
}

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

  async updateProofStatus(
    id: string,
    data: { status: string; message?: string; reason?: string },
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/status`, data);
  },

  async approveProof(id: string, message?: string): Promise<AdminProof> {
    return this.updateProofStatus(id, {
      status: "APPROVED",
      message: message || "Great work! Your proof is now live.",
    });
  },

  async rejectProof(
    id: string,
    reason: string,
    message?: string,
  ): Promise<AdminProof> {
    return this.updateProofStatus(id, {
      status: "REJECTED",
      reason,
      message: message || "Content does not meet guidelines",
    });
  },

  async flagProof(id: string, message?: string): Promise<AdminProof> {
    return this.updateProofStatus(id, {
      status: "FLAGGED",
      message: message || "This post contains potentially sensitive content.",
    });
  },

  async quickFeatureProof(id: string): Promise<AdminProof> {
    return this.updateProofStatus(id, { status: "FEATURE" });
  },

  async toggleFeatureProof(
    id: string,
    isFeatured: boolean,
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/feature`, { isFeatured });
  },

  async toggleShadowLimitProof(
    id: string,
    shadowLimited: boolean,
  ): Promise<AdminProof> {
    return apiClient.patch(`/admin/proofs/${id}/shadow-limit`, {
      shadowLimited,
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
    return apiClient.get(`/admin/pulses?${params.toString()}`);
  },

  async createPulse(data: CreatePulseData): Promise<Pulse> {
    return apiClient.post("/admin/pulses", data);
  },

  async updatePulse(id: string, data: Partial<CreatePulseData & { status: string }>): Promise<Pulse> {
    return apiClient.patch(`/admin/pulses/${id}`, data);
  },

  async updatePulseStatus(id: string, status: "DRAFT" | "LIVE" | "CLOSED"): Promise<Pulse> {
    return apiClient.patch(`/admin/pulses/${id}`, { status });
  },

  // Talent Directory
  async getTalents(filter: TalentFilter = {}): Promise<TalentListResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.search) params.append("search", filter.search);
    if (filter.verificationStatus) params.append("verificationStatus", filter.verificationStatus);
    if (filter.isEmailVerified !== undefined) params.append("isEmailVerified", String(filter.isEmailVerified));
    return apiClient.get(`/admin/talents?${params.toString()}`);
  },

  async verifyTalent(id: string): Promise<AdminTalent> {
    return apiClient.patch(`/admin/talents/${id}/verify`, {});
  },

  async unverifyTalent(id: string): Promise<AdminTalent> {
    return apiClient.patch(`/admin/talents/${id}/unverify`, {});
  },

  async deleteTalent(id: string): Promise<void> {
    return apiClient.delete(`/admin/talents/${id}`);
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
  roles?: string[];
  tags?: string[];
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
  status: "DRAFT" | "LIVE" | "CLOSED";
  expiresAt?: string;
}

export interface PulseFilter {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
