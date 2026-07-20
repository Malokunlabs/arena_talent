import { apiClient } from "./apiClient";
import {
  type BadgeApplication,
  type BadgeApplicationStatus,
  type SkillBadge,
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

export interface CreateBadgeDto {
  name: string;
  iconKey?: string;
  scopeOfWork: string;
  assessmentMethod: string;
  isActive?: boolean;
  formSchema?: any[];
}

export type UpdateBadgeDto = Partial<CreateBadgeDto>;

const adminBadgeService = {
  async getStats(): Promise<AdminBadgeStats> {
    const raw = await apiClient.get<any>("/admin/skill-badges/stats");
    // Handle both old nested shape { pending: {...}, approved: {...} }
    // and new flat shape { pendingCount, totalApproved, ... }
    if (raw && typeof raw.pendingCount === "number") {
      return raw as AdminBadgeStats;
    }
    // Normalize old nested shape
    const p = raw?.pending ?? {};
    const a = raw?.approved ?? {};
    return {
      pendingCount: p.total ?? 0,
      approvedToday: p.approvedToday ?? 0,
      rejectedToday: p.rejectedToday ?? 0,
      avgReviewTimeHours: p.avgReviewTimeHours ?? 0,
      totalApproved: a.activeBadges ?? 0,
      tierUpgradesThisWeek: a.tierUpgrades ?? 0,
      atRiskCount: a.atRisk ?? 0,
      approvedThisWeek: a.thisWeek ?? 0,
    };
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

  // ---------------------------------------------------------------------------
  // Definitions
  // ---------------------------------------------------------------------------

  getBadgeDefinitions(): Promise<SkillBadge[]> {
    return apiClient.get<SkillBadge[]>("/admin/skill-badges/definitions");
  },

  createBadgeDefinition(dto: CreateBadgeDto): Promise<SkillBadge> {
    return apiClient.post<SkillBadge>("/admin/skill-badges/definitions", dto);
  },

  updateBadgeDefinition(id: string, dto: UpdateBadgeDto): Promise<SkillBadge> {
    return apiClient.patch<SkillBadge>(`/admin/skill-badges/definitions/${id}`, dto);
  },

  async uploadBadgeIcon(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "badges"); // Keep organized in 'badges' folder

    // Get the JWT token from storage for the upload request
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/media/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
};

export default adminBadgeService;
