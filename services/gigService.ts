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

export interface GetGigsResponse {
  data: Gig[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount?: number;
  };
}

export const gigService = {
  async getGigs(params: GetGigsParams = {}): Promise<GetGigsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.status?.trim()) query.set("status", params.status.trim());

    const qs = query.toString();
    return apiClient.get<GetGigsResponse>(`/gigs${qs ? `?${qs}` : ""}`);
  },

  async syncGigs(
    forceFull = false,
  ): Promise<{ synced: number; source?: string }> {
    return apiClient.post("/gigs/sync", { forceFull }, { silent: true });
  },
};
