import { apiClient } from "./apiClient";

export type CollaborationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";

export interface CollaborationRequest {
  id: string;
  fromUserId: string;
  toUserId?: string;
  title: string;
  description: string;
  roles: string[];
  city: string;
  startDate: string;
  tags: string[];
  status: CollaborationStatus;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    username?: string;
    email?: string;
  };
  toUser?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    username?: string;
    email?: string;
  };
}

export interface CreateCollaborationRequest {
  toUserId?: string;
  title: string;
  description: string;
  roles: string[];
  city: string;
  startDate: string;
  tags: string[];
}

export const collaborationService = {
  async submitRequest(data: CreateCollaborationRequest): Promise<CollaborationRequest> {
    return apiClient.post("/collaboration-requests", data);
  },

  async getRequests(params: { page?: number; limit?: number } = {}): Promise<{
    data: CollaborationRequest[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    return apiClient.get(`/collaboration-requests?${query.toString()}`);
  },

  async updateStatus(id: string, status: CollaborationStatus): Promise<CollaborationRequest> {
    return apiClient.patch(`/collaboration-requests/${id}`, { status });
  },
};
