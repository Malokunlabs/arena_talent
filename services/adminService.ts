import { API_BASE_URL } from "@/lib/config";
import { apiClient } from "@/services/apiClient";
import { tokenStorage } from "@/services/authService";
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
  _count?: {
    proofs: number;
    connectionRequestsSent: number;
    connectionRequestsReceived: number;
  };
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

export interface AdminConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  email: string;
  avatarUrl?: string | null;
  location?: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
}

export type ConnectionRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface AdminConnectionItem {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  updatedAt: string;
  requester: AdminConnectionUser;
  recipient: AdminConnectionUser;
}

export interface AdminConnectionFilter {
  page?: number;
  limit?: number;
  status?: ConnectionRequestStatus;
  search?: string;
  userId?: string;
}

export interface AdminConnectionListResponse {
  data: AdminConnectionItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

export interface TalentConnectionsResponse {
  user: AdminTalent;
  data: AdminConnectionItem[];
  summary: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    sent: number;
    received: number;
  };
}

export interface AdminUserGigItem {
  id: string;
  completedAt?: string | null;
  source: string;
  createdAt: string;
  gig: {
    id: string;
    gu2kGigId: string;
    title: string;
    companyName?: string | null;
    category?: string | null;
    location?: string | null;
    status?: string | null;
  };
}

export interface AdminTalentActivity {
  id: string;
  type: "JOINED" | "PROOF_POSTED" | "CONNECTION" | "ENGAGEMENT";
  title: string;
  description: string;
  status?: string;
  createdAt: string;
  proofId?: string;
  peerId?: string;
  peerName?: string;
  isFeatured?: boolean;
  direction?: "SENT" | "RECEIVED";
}

export interface AdminTalentDetailResponse {
  user: AdminTalent & {
    gu2kId?: string | null;
    coverUrl?: string | null;
    cvUrl?: string | null;
    skills?: string[];
    totalGigs?: number;
    followerCount?: number;
    isAvailable?: boolean;
    isPublic?: boolean;
    levelProgress?: {
      totalProofs: number;
      currentLevel: { name: string; color?: string | null };
      nextLevel?: { name: string } | null;
      proofsToNextLevel: number;
      progressPercent: number;
    };
  };
  stats: {
    totalProofs: number;
    approvedProofs: number;
    pendingProofs: number;
    featuredProofs: number;
    totalLikesReceived: number;
    totalViewsReceived: number;
    totalSalutesReceived: number;
    acceptedConnections: number;
    pendingConnectionsSent: number;
    pendingConnectionsReceived: number;
    totalConnectionRequests: number;
    followersCount: number;
    followingCount: number;
    completedGigsCount: number;
    recommendationsCount: number;
  };
  proofs: AdminProof[];
  connections: {
    data: AdminConnectionItem[];
    summary: {
      total: number;
      pending: number;
      accepted: number;
      declined: number;
      sent: number;
      received: number;
    };
  };
  userGigs: AdminUserGigItem[];
  activities: AdminTalentActivity[];
}

export interface DashboardStats {
  proofs: {
    total: number;
    featured: number;
    shadowLimited: number;
    byStatus: { status: string; count: number }[];
  };
  talents: {
    total: number;
    available: number;
    verified: number;
    newThisWeek: number;
  };
  connections: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
  gigs?: {
    total: number;
  };
}

export interface AdminAnalyticsPayload {
  topProofs: {
    id: string;
    title: string;
    creator: string;
    salutes: number;
    likes: number;
  }[];
  weeklyActivity: {
    weekLabel: string;
    proofCount: number;
    newTalentsCount: number;
  }[];
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
  isFeatured?: boolean;
  shadowLimited?: boolean;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get("/admin/dashboard");
  },

  async getAnalytics(): Promise<AdminAnalyticsPayload> {
    return apiClient.get("/admin/dashboard/analytics");
  },

  async exportReport(
    reportType: "arena-metrics" | "user-engagement",
  ): Promise<void> {
    const token = tokenStorage.getToken();
    const res = await fetch(
      `${API_BASE_URL}/admin/dashboard/export/${reportType}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) {
      throw new Error("Failed to export report");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      reportType === "arena-metrics"
        ? "arena-metrics-report.csv"
        : "user-engagement-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getProofs(filter: ProofFilter = {}): Promise<ProofResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.status && filter.status !== "All") {
      params.append("status", filter.status);
    }
    if (filter.search) params.append("search", filter.search);
    if (filter.isFeatured !== undefined) {
      params.append("isFeatured", String(filter.isFeatured));
    }
    if (filter.shadowLimited !== undefined) {
      params.append("shadowLimited", String(filter.shadowLimited));
    }

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

  async deleteProof(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiClient.delete(`/admin/proofs/${id}`);
  },

  // Users & Connections Directory
  async getTalents(filter: TalentFilter = {}): Promise<TalentListResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.search) params.append("search", filter.search);
    if (filter.verificationStatus) {
      params.append("verificationStatus", filter.verificationStatus);
    }
    if (filter.isEmailVerified !== undefined) {
      params.append("isEmailVerified", String(filter.isEmailVerified));
    }
    return apiClient.get(`/admin/talents?${params.toString()}`);
  },

  async getConnections(
    filter: AdminConnectionFilter = {},
  ): Promise<AdminConnectionListResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.append("page", filter.page.toString());
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.status) params.append("status", filter.status);
    if (filter.search) params.append("search", filter.search);
    if (filter.userId) params.append("userId", filter.userId);
    return apiClient.get(`/admin/talents/connections?${params.toString()}`);
  },

  async getTalentConnections(userId: string): Promise<TalentConnectionsResponse> {
    return apiClient.get(`/admin/talents/${userId}/connections`);
  },

  async getTalentDetail(userId: string): Promise<AdminTalentDetailResponse> {
    return apiClient.get(`/admin/talents/${userId}`);
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
