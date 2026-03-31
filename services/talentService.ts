import { apiClient } from "./apiClient";

export interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  location: string;
  skills: string[];
  rating: number;
  isAvailable: boolean;
  email?: string;
  phone?: string;
  bio?: string;
  totalGigs?: number;
  avatarUrl?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  piScore?: number;
  progressIndex?: number;
  piToNextLevel?: number;
  nextLevelPi?: number | null;
}

export interface TalentStats {
  totalProofs: number;
  totalSalutes: number;
  rating: number;
  totalGigs: number;
}

export interface TalentProfile {
  talent: Talent;
  stats: TalentStats;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proofs: any[]; // We can use the Proof type from proofService if needed
}

export interface GetTalentsParams {
  page?: number;
  limit?: number;
  location?: string;
  skills?: string;
  minimumRating?: number;
  availableOnly?: boolean;
}

export const talentService = {
  async getTalents(params: GetTalentsParams = {}): Promise<{
    data: Talent[];
    meta: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.location) query.append("location", params.location);
    if (params.skills) query.append("skills", params.skills);
    if (params.minimumRating)
      query.append("minimumRating", params.minimumRating.toString());
    if (params.availableOnly !== undefined)
      query.append("availableOnly", params.availableOnly.toString());

    return apiClient.get(`/talents?${query.toString()}`);
  },

  async getTalentByUsername(username: string): Promise<TalentProfile> {
    return apiClient.get(`/talents/${username}`);
  },

  async createTalentRequest(data: CreateTalentRequest): Promise<void> {
    return apiClient.post("/talent-requests", data);
  },

  async getReceivedTalentRequests(params: { page?: number; limit?: number } = {}): Promise<{
    data: TalentRequest[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    
    return apiClient.get(`/talent-requests?${query.toString()}`);
  },

  async updateTalentRequestStatus(id: string, status: string): Promise<void> {
    return apiClient.patch(`/talent-requests/${id}/status`, { status });
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
  phone?: string;
  city?: string;
  location?: string;
  timeline?: string;
  requesterName?: string;
  requesterEmail?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTalentRequest {
  talentId: string;
  companyName: string;
  email: string;
  requestType: string;
  projectBrief: string;
  budgetMin: number;
  budgetMax: number;
  phone?: string;
  city?: string;
  location?: string;
  timeline?: string;
  requesterName?: string;
  requesterEmail?: string;
  notes?: string;
}
