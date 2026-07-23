import { apiClient } from "./apiClient";

export interface ReviewItem {
  id: string;
  ratedUserId: string;
  reviewerId: string | null;
  qualityScore: number;
  professionalismScore: number;
  onTimeScore: number;
  collaborationScore: number;
  creativityScore: number;
  overallScore: number;
  comment: string | null;
  isPublic: boolean;
  isVerified: boolean;
  reviewerRole: "CLIENT" | "COLLABORATOR";
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export interface RatingBreakdown {
  avgQuality: number;
  avgProfessionalism: number;
  avgOnTime: number;
  avgCollaboration: number;
  avgCreativity: number;
  avgOverall: number;
  reviewCount: number;
}

export interface PublicReviewsResult {
  data: ReviewItem[];
  breakdown: RatingBreakdown | null;
  meta: { page: number; limit: number; total: number };
}

export const reviewService = {
  getForUser(
    userId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PublicReviewsResult> {
    const q = new URLSearchParams();
    if (params.page) q.append("page", params.page.toString());
    if (params.limit) q.append("limit", params.limit.toString());
    return apiClient.get<PublicReviewsResult>(
      `/reviews/user/${userId}?${q.toString()}`,
    );
  },
};
