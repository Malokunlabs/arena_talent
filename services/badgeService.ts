import { apiClient } from "./apiClient";

export type BadgeTier = "BEGINNER" | "INTERMEDIATE" | "PROFESSIONAL";
export type BadgeApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPEALED"
  | "APPROVED"
  | "REJECTED"
  | "REVOKED";

export interface FormField {
  id: string;
  label: string;
  type: "short_text" | "long_text" | "file_upload" | "select";
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  validation?: {
    minFiles?: number;
    maxSizeMb?: number;
    accept?: string[];
    minWords?: number;
    maxWords?: number;
  };
}

export interface BadgeTierInfo {
  id: string;
  tier: BadgeTier;
  requirements: {
    minGigsInCategory?: number;
    minRating?: number;
    minCompletionRate?: number;
    minOnTimeRate?: number;
    maxDisputeRate?: number;
    minAssessmentScore?: number;
  };
  privileges: {
    description: string;
    items: string[];
  };
}

export interface SkillBadge {
  id: string;
  name: string;
  slug: string;
  description: string;
  scopeOfWork: string;
  assessmentMethod: string;
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
  formSchema: FormField[];
  tiers: BadgeTierInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  required: number;
  actual: number | null;
  passed: boolean;
  unit?: string;
  displayRequired?: string;
  displayActual?: string;
}

export interface BadgeApplication {
  id: string;
  userId: string;
  badgeId: string;
  badge: SkillBadge;
  submissionData: Record<string, unknown>;
  status: BadgeApplicationStatus;
  appliedForTier: BadgeTier;
  currentTier: BadgeTier | null;
  assessmentScore: number | null;
  rejectedReason: string | null;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  appealNote: string | null;
  appealedAt: string | null;
  appealUpheld: boolean | null;
  appealDecisionNote: string | null;
  appealResolvedBy: string | null;
  appealResolvedAt: string | null;
  revokedBy: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  revocationNote: string | null;
  checklist: ChecklistItem[];
  tierProgressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyApplicationsResponse {
  all: BadgeApplication[];
  pending: BadgeApplication[];
  verified: BadgeApplication[];
}

export interface BadgeDashboard {
  myApplications: BadgeApplication[];
  badges: SkillBadge[];
}

const badgeService = {
  /** All available badges */
  listBadges(): Promise<SkillBadge[]> {
    return apiClient.get<SkillBadge[]>("/skill-badges");
  },

  /** Get one badge by slug */
  getBadge(slug: string): Promise<SkillBadge> {
    return apiClient.get<SkillBadge>(`/skill-badges/${slug}`);
  },

  /** User badge dashboard — composed from two real endpoints */
  async getDashboard(): Promise<BadgeDashboard> {
    const [badges, appsResponse] = await Promise.all([
      apiClient.get<SkillBadge[]>("/skill-badges"),
      apiClient.get<MyApplicationsResponse>("/skill-badges/me/applications"),
    ]);
    // Backend returns { all, pending, verified } — flatten to all applications
    const myApplications = Array.isArray(appsResponse)
      ? appsResponse
      : appsResponse?.all ?? [];
    return { badges, myApplications };
  },

  /** Get user's single application by badge slug */
  getMyApplication(slug: string): Promise<BadgeApplication> {
    return apiClient.get<BadgeApplication>(`/skill-badges/${slug}/application`);
  },

  /** Submit badge application */
  submitApplication(
    slug: string,
    data: { submissionData: Record<string, unknown>; appliedForTier?: BadgeTier }
  ): Promise<BadgeApplication> {
    return apiClient.post<BadgeApplication>(`/skill-badges/${slug}/apply`, data);
  },

  /** Appeal a rejection */
  appealApplication(
    slug: string,
    appealNote: string
  ): Promise<BadgeApplication> {
    return apiClient.post<BadgeApplication>(`/skill-badges/${slug}/appeal`, {
      appealNote,
    });
  },
};

export default badgeService;
