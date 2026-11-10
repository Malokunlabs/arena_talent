import { apiClient } from "./apiClient";
import { RecommendationItem } from "./talentService";

export interface CreateRecommendationPayload {
  recipientId: string;
  gigId?: string;
  authorRole?: string;
  content: string;
}

export const recommendationService = {
  async getMyRecommendations(): Promise<RecommendationItem[]> {
    return apiClient.get("/recommendations/me");
  },

  async getForUser(userId: string): Promise<RecommendationItem[]> {
    return apiClient.get(`/recommendations/user/${userId}`);
  },

  async create(
    payload: CreateRecommendationPayload,
  ): Promise<RecommendationItem> {
    return apiClient.post("/recommendations", payload);
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    return apiClient.delete(`/recommendations/${id}`);
  },
};
