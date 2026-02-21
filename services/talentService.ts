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
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
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
};

export interface CreateTalentRequest {
  talentId: string;
  companyName: string;
  email: string;
  requestType: string;
  projectBrief: string;
  budgetMin: number;
  budgetMax: number;
  phone?: string;
  location?: string;
  timeline?: string;
}
