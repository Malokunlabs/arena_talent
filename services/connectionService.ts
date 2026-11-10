import { apiClient } from "./apiClient";
import { ArenaLevelSummary } from "./levelService";

export interface ConnectionTalent {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  location: string | null;
  skills: string[];
  isAvailable: boolean;
  followerCount: number;
  verificationStatus: string;
  avatarUrl: string | null;
  totalProofs: number;
  level: ArenaLevelSummary;
}

export interface ConnectionRequestItem {
  id: string;
  status: string;
  createdAt: string;
  requester: ConnectionTalent;
  recipient?: ConnectionTalent;
}

export interface PeopleYouMayKnowItem {
  talent: ConnectionTalent;
  sharedGigsCount: number;
  sharedGigs: { id: string; title: string }[];
  reason: string;
}

export const connectionService = {
  async getConnections(): Promise<ConnectionTalent[]> {
    return apiClient.get("/connections");
  },

  async getIncomingRequests(limit = 20): Promise<ConnectionRequestItem[]> {
    return apiClient.get(`/connections/requests?limit=${limit}`);
  },

  async getSuggestions(limit = 10): Promise<PeopleYouMayKnowItem[]> {
    return apiClient.get(`/connections/suggestions?limit=${limit}`);
  },

  async sendRequest(userId: string): Promise<ConnectionRequestItem> {
    return apiClient.post(`/connections/request/${userId}`, {});
  },

  async acceptRequest(requestId: string): Promise<ConnectionRequestItem> {
    return apiClient.post(`/connections/requests/${requestId}/accept`, {});
  },

  async declineRequest(requestId: string): Promise<ConnectionRequestItem> {
    return apiClient.post(`/connections/requests/${requestId}/decline`, {});
  },

  async removeConnection(userId: string): Promise<{ removed: boolean }> {
    return apiClient.delete(`/connections/${userId}`);
  },
};
