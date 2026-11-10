import { apiClient } from "./apiClient";

export interface Gig {
  id: string;
  gu2kGigId: string;
  title: string;
  location: string | null;
  status: string | null;
  category: string | null;
  companyName: string | null;
  completedAt: string | null;
  syncedAt: string;
}

export interface GetGigsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const gigService = {
  async getGigs(params: GetGigsParams = {}): Promise<{
    data: Gig[];
    meta: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);

    const qs = query.toString();
    return apiClient.get(`/gigs${qs ? `?${qs}` : ""}`);
  },

  async syncGigs(forceFull = false): Promise<{
    synced: number;
    source?: string;
  }> {
    return apiClient.post("/gigs/sync", { forceFull });
  },
};
