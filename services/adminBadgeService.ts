import { apiClient } from "./apiClient";
import {
  type BadgeApplication,
  type BadgeApplicationStatus,
} from "./badgeService";

export interface AdminBadgeStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewTimeHours: number;
  totalApproved: number;
  tierUpgradesThisWeek: number;
  atRiskCount: number;
  approvedThisWeek: number;
}

export interface AdminApplicationsResponse {
  data: AdminBadgeApplication[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminBadgeApplication extends BadgeApplication {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatarUrl?: string;
    location?: string;
    phone?: string;
    bio?: string;
    piScore?: number;
    totalGigs?: number;
    rating?: number;
    onTimePercent?: number;
    disputeRate?: number;
    education?: string;
    experience?: string;
    languages?: string;
    timezone?: string;
    createdAt?: string;
  };
}

export interface AdminBadgeListQuery {
  status?: BadgeApplicationStatus;
  badgeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApproveApplicationDto {
  assessmentScore: number;
  tier: "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL";
  adminNote?: string;
}

export interface RejectApplicationDto {
  rejectedReason: string;
  adminNote: string;
}

export interface RevokeBadgeDto {
  revocationReason:
    | "METRICS_DROPPED"
    | "POLICY_VIOLATION"
    | "FRAUDULENT_SUBMISSION"
    | "OTHER";
  revocationNote?: string;
}

export interface ResolveAppealDto {
  appealDecisionNote: string;
  assessmentScore?: number;
  tier?: "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL";
}

const adminBadgeService = {
  getStats(): Promise<AdminBadgeStats> {
    return apiClient.get<AdminBadgeStats>("/admin/skill-badges/stats");
  },

  listApplications(
    query: AdminBadgeListQuery
  ): Promise<AdminApplicationsResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.badgeId) params.set("badgeId", query.badgeId);
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    return apiClient.get<AdminApplicationsResponse>(
      `/admin/skill-badges/applications?${params.toString()}`
    );
  },

  getDetail(id: string): Promise<AdminBadgeApplication> {
    return apiClient.get<AdminBadgeApplication>(
      `/admin/skill-badges/applications/${id}`
    );
  },

  approve(id: string, dto: ApproveApplicationDto): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/approve`,
      dto
    );
  },

  reject(id: string, dto: RejectApplicationDto): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/reject`,
      dto
    );
  },

  setUnderReview(id: string): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/under-review`,
      {}
    );
  },

  revoke(id: string, dto: RevokeBadgeDto): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/revoke`,
      dto
    );
  },

  upholdRejection(
    id: string,
    dto: ResolveAppealDto
  ): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/uphold-rejection`,
      dto
    );
  },

  approveAppeal(
    id: string,
    dto: ResolveAppealDto
  ): Promise<BadgeApplication> {
    return apiClient.patch<BadgeApplication>(
      `/admin/skill-badges/applications/${id}/approve-appeal`,
      dto
    );
  },
};

export default adminBadgeService;
