import { create } from "zustand";
import {
  collaborationService,
  CollaborationRequest,
  CreateCollaborationRequest,
  CollaborationStatus,
} from "@/services/collaborationService";

interface CollaborationState {
  requests: CollaborationRequest[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };

  fetchRequests: (params?: { page?: number; limit?: number }) => Promise<void>;
  submitRequest: (data: CreateCollaborationRequest) => Promise<void>;
  updateStatus: (id: string, status: CollaborationStatus) => Promise<void>;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  requests: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },

  fetchRequests: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await collaborationService.getRequests(params);
      set({
        requests: result?.data ? result.data : (Array.isArray(result) ? result : []),
        pagination: result?.meta || { total: 0, page: 1, limit: 20 },
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error:
          (error as Error).message || "Failed to fetch collaboration requests",
      });
    }
  },

  submitRequest: async (data: CreateCollaborationRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await collaborationService.submitRequest(data);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      set({
        isSubmitting: false,
        error:
          (error as Error).message || "Failed to submit collaboration request",
      });
      throw error;
    }
  },

  updateStatus: async (id: string, status: CollaborationStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await collaborationService.updateStatus(id, status);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
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
