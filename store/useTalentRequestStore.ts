import { create } from "zustand";
import { talentService, TalentRequest } from "@/services/talentService";

interface TalentRequestState {
  requests: TalentRequest[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };

  fetchReceivedRequests: (params?: {
    page?: number;
    limit?: number;
  }) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
}

export const useTalentRequestStore = create<TalentRequestState>((set) => ({
  requests: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },

  fetchReceivedRequests: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await talentService.getReceivedTalentRequests(params);
      set({
        requests: result?.data ? result.data : (result?.items ? result.items : (Array.isArray(result) ? result : [])),
        pagination: result?.meta || { total: result?.total || 0, page: result?.page || 1, limit: result?.limit || 20 },
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch received requests",
      });
    }
  },

  updateStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      await talentService.updateTalentRequestStatus(id, status);
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === id ? { ...r, status } : r,
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to update status",
      });
      throw error;
    }
  },
}));
