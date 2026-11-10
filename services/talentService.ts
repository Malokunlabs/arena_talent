import { apiClient } from "./apiClient";
import { Proof } from "./proofService";
import { ArenaLevelSummary, UserLevelProgress } from "./levelService";
import { Gig } from "./gigService";
import { ConnectionTalent } from "./connectionService";

export interface RecommendationItem {
  id: string;
  author: ConnectionTalent;
  authorRole: string | null;
  basedOnGig: Gig | null;
  content: string;
  createdAt: string;
}

export interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  location: string;
  skills: string[];
  rating?: number;
  isAvailable: boolean;
  email?: string;
  phone?: string;
  bio?: string;
  totalGigs?: number;
  totalProofs?: number;
  level?: ArenaLevelSummary;
  followerCount?: number;
  verificationStatus?: string;
  avatarUrl?: string;
  coverUrl?: string | null;
  cvUrl?: string | null;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TalentStats {
  totalProofs: number;
  totalSalutes: number;
  recommendationsCount?: number;
  totalGigs: number;
  verifiedProofs?: number;
  followerCount?: number;
  rating?: number;
  totalPendingJobRequests?: number;
  totalCompletedJobRequests?: number;
}

export interface TalentProfile {
  talent: Talent;
  stats: TalentStats;
  levelProgress?: UserLevelProgress;
  recommendations?: RecommendationItem[];
  proofs: Proof[];
}

export type OverviewPeriod = "this_month" | "all_time";

export interface OverviewStatCard {
  count: number;
  previousCount: number;
  growthPercent: number;
  comparisonText: string;
  period: OverviewPeriod;
  sparkline: number[];
}

export interface ProofActivityPoint {
  label: string;
  count: number;
}

export interface TalentOverviewPayload {
  salutesReceived: OverviewStatCard;
  proofsShared: OverviewStatCard;
  gigsCompleted: OverviewStatCard;
  proofActivity: {
    period: OverviewPeriod;
    points: ProofActivityPoint[];
  };
  progressIndexBreakdown: UserLevelProgress;
  pendingConnectionRequestsCount: number;
}

export interface GetOverviewParams {
  period?: OverviewPeriod;
  salutesPeriod?: OverviewPeriod;
  proofsPeriod?: OverviewPeriod;
  gigsPeriod?: OverviewPeriod;
  activityPeriod?: OverviewPeriod;
}

export interface GetTalentsParams {
  page?: number;
  limit?: number;
  location?: string;
  skills?: string;
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
    if (params.availableOnly !== undefined)
      query.append("availableOnly", params.availableOnly.toString());

    return apiClient.get(`/talents?${query.toString()}`);
  },

  async getTalentByUsername(
    username: string,
    search?: string,
  ): Promise<TalentProfile> {
    const qs = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";
    return apiClient.get(`/talents/${username}${qs}`);
  },

  async getMyProfile(search?: string): Promise<TalentProfile> {
    const qs = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";
    return apiClient.get(`/talents/me${qs}`);
  },

  async getMyOverview(
    params: GetOverviewParams = {},
  ): Promise<TalentOverviewPayload> {
    const query = new URLSearchParams();
    if (params.period) query.set("period", params.period);
    if (params.salutesPeriod) query.set("salutesPeriod", params.salutesPeriod);
    if (params.proofsPeriod) query.set("proofsPeriod", params.proofsPeriod);
    if (params.gigsPeriod) query.set("gigsPeriod", params.gigsPeriod);
    if (params.activityPeriod)
      query.set("activityPeriod", params.activityPeriod);

    const qs = query.toString();
    return apiClient.get<TalentOverviewPayload>(
      `/overview${qs ? `?${qs}` : ""}`,
    );
  },

  async toggleFollow(id: string): Promise<{ following: boolean; followerCount?: number }> {
    return apiClient.post(`/talents/${id}/follow`, {});
  },
};
