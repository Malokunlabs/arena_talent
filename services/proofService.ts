import { apiClient } from "./apiClient";

export interface Proof {
  id: string;
  mediaUrl: string;
  title: string;
  category: string;
  caption: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  shadowLimited?: boolean;
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string | null;
    avatar?: string;
    location?: string | null;
    skills?: string[];
    badges?: string[];
    rating?: number;
    isAvailable?: boolean;
    piScore?: number;
    progressIndex?: number;
    followerCount?: number;
    verificationStatus?: string;
    onTimePercent?: number;
  };
  salutesCount?: number;
}

export interface CreateProofData {
  mediaUrl: string;
  title: string;
  category: string;
  caption: string;
  tags: string[];
}

export interface GetProofsParams {
  page?: number;
  limit?: number;
  filter?: string;
}

export const proofService = {
  async getProofs(params: GetProofsParams = {}): Promise<{
    data: Proof[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter = (params.filter || "All").toLowerCase();

    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      filter: filter,
    }).toString();

    return apiClient.get(`/proofs?${query}`);
  },

  async createProof(data: CreateProofData): Promise<Proof> {
    return apiClient.post("/proofs", data);
  },

  async saluteProof(id: string): Promise<void> {
    return apiClient.post(`/proofs/${id}/salute`, {});
  },

  async getMyProofs(params: { page?: number; limit?: number } = {}): Promise<{
    data: Proof[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
    }).toString();

    return apiClient.get(`/proofs/me?${query}`);
  },
};
