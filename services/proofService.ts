import { apiClient } from "./apiClient";
import { Gig } from "./gigService";
import { ArenaLevelSummary } from "./levelService";

export interface ProofMediaItem {
  url: string;
  type: "image" | "video";
  duration?: number;
  thumbnailUrl?: string;
}

export interface ProofShareLinks {
  twitter: string;
  whatsapp: string;
  instagram: string;
  copyLink: string;
}

export interface Proof {
  id: string;
  mediaUrl: string;
  mediaUrls?: string[];
  mediaItems?: ProofMediaItem[];
  title: string;
  category: string;
  caption: string;
  tags: string[];
  gigId?: string | null;
  gig?: Gig | null;
  likesCount?: number;
  viewsCount?: number;
  salutesCount?: number;
  bookmarksCount?: number;
  sharesCount?: number;
  hasLiked?: boolean;
  hasSaluted?: boolean;
  isBookmarked?: boolean;
  shareUrl?: string;
  shareLinks?: ProofShareLinks;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  shadowLimited?: boolean;
  talent?: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string | null;
    avatarUrl?: string;
    location?: string | null;
    skills?: string[];
    badges?: string[];
    rating?: number;
    isAvailable?: boolean;
    piScore?: number;
    progressIndex?: number;
    followerCount?: number;
    verificationStatus?: string;
    onTimePercent?: number;
    totalProofs?: number;
    level?: ArenaLevelSummary;
  };
}

export interface CreateProofData {
  caption?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaItems?: ProofMediaItem[];
  gigId?: string;
  title?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateProofData {
  title?: string;
  category?: string;
  caption?: string;
  tags?: string[];
  gigId?: string | null;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaItems?: ProofMediaItem[];
}

export interface GetProofsParams {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
  location?: string;
  gigId?: string;
}

export const proofService = {
  async getProofs(params: GetProofsParams = {}): Promise<{
    data: Proof[];
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
    total?: number;
    page?: number;
    totalPages?: number;
  }> {
    const rawFilter = (params.filter || "all").toLowerCase();
    const mappedFilter =
      rawFilter === "my network" ? "network" : rawFilter;

    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      filter: mappedFilter,
    });

    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }
    if (params.location?.trim()) {
      query.set("location", params.location.trim());
    }
    if (params.gigId) {
      query.set("gigId", params.gigId);
    }

    return apiClient.get(`/proofs?${query.toString()}`);
  },

  async getProofsOfTheWeek(limit = 5): Promise<Proof[]> {
    return apiClient.get(`/proofs/of-the-week?limit=${limit}`);
  },

  async getBookmarkedProofs(
    params: { page?: number; limit?: number } = {},
  ): Promise<{
    data: Proof[];
    meta?: { page: number; limit: number; total: number };
  }> {
    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    }).toString();

    return apiClient.get(`/proofs/bookmarks?${query}`);
  },

  async getProofById(id: string): Promise<Proof> {
    return apiClient.get(`/proofs/${id}`);
  },

  async createProof(data: CreateProofData): Promise<Proof> {
    return apiClient.post("/proofs", data);
  },

  async updateProof(id: string, data: UpdateProofData): Promise<Proof> {
    return apiClient.patch(`/proofs/${id}`, data);
  },

  async deleteProof(id: string): Promise<void> {
    return apiClient.delete(`/proofs/${id}`);
  },

  async saluteProof(id: string): Promise<{ salutesCount?: number }> {
    return apiClient.post(`/proofs/${id}/salute`, {});
  },

  async recordView(id: string): Promise<{ id: string; viewsCount: number }> {
    return apiClient.post(`/proofs/${id}/view`, {});
  },

  async toggleLike(id: string): Promise<{ liked: boolean; likesCount: number }> {
    return apiClient.post(`/proofs/${id}/like`, {});
  },

  async toggleBookmark(
    id: string,
  ): Promise<{ bookmarked: boolean; bookmarksCount: number }> {
    return apiClient.post(`/proofs/${id}/bookmark`, {});
  },

  async getMyProofs(params: { page?: number; limit?: number } = {}): Promise<{
    data: Proof[];
    meta?: { page: number; limit: number; total: number };
    total?: number;
    page?: number;
    totalPages?: number;
  }> {
    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    }).toString();

    return apiClient.get(`/proofs/me?${query}`);
  },

  async shareProof(
    id: string,
    platform?:
      | "twitter"
      | "whatsapp"
      | "instagram"
      | "tiktok"
      | "youtube"
      | "copy_link",
  ): Promise<{
    proofId: string;
    platform: string;
    sharesCount: number;
    shareUrl: string;
    shareLinks: ProofShareLinks;
  }> {
    return apiClient.post(`/proofs/${id}/share`, platform ? { platform } : {});
  },
};
