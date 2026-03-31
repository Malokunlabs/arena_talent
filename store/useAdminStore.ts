import { create } from "zustand";
import {
  adminService,
  DashboardStats,
  AdminProof,
  ProofFilter,
  KanbanColumn,
  CollaborationKanbanColumn,
} from "@/services/adminService";
import { apiClient } from "@/services/apiClient";

interface AdminState {
  stats: DashboardStats | null;
  proofs: AdminProof[];
  proofsMeta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchDashboardStats: () => Promise<void>;
  fetchProofs: (filter?: ProofFilter) => Promise<void>;
  approveProof: (id: string, message?: string) => Promise<void>;
  rejectProof: (id: string, reason: string, message?: string) => Promise<void>;
  featureProof: (
    id: string,
    isFeatured: boolean,
    message?: string,
  ) => Promise<void>;
  shadowLimitProof: (
    id: string,
    shadowLimited: boolean,
    message?: string,
  ) => Promise<void>;
  fetchKanbanBoard: () => Promise<void>;
  updateRequestStatus: (id: string, status: string) => Promise<void>;
  kanbanBoard: KanbanColumn[];
  collaborationKanbanBoard: CollaborationKanbanColumn[];
  fetchCollaborationKanbanBoard: () => Promise<void>;
  updateCollaborationRequestStatus: (id: string, status: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  proofs: [],
  proofsMeta: {
    page: 1,
    limit: 20,
    total: 0,
    pageCount: 0,
  },
  kanbanBoard: [],
  collaborationKanbanBoard: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await adminService.getDashboardStats();
      set({ stats, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch dashboard stats",
      });
    }
  },

  fetchProofs: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getProofs(filter);
      set({
        proofs: response.data,
        proofsMeta: response.meta,
        isLoading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch proofs",
      });
    }
  },

  approveProof: async (id, message) => {
    try {
      const updatedProof = await adminService.approveProof(id, message);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Approve failed", error);
    }
  },

  rejectProof: async (id, reason, message) => {
    try {
      const updatedProof = await adminService.rejectProof(id, reason, message);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Reject failed", error);
    }
  },

  featureProof: async (id, isFeatured, message) => {
    try {
      const updatedProof = await adminService.featureProof(
        id,
        isFeatured,
        message,
      );
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Feature failed", error);
    }
  },

  shadowLimitProof: async (id, shadowLimited, message) => {
    try {
      const updatedProof = await adminService.shadowLimitProof(
        id,
        shadowLimited,
        message,
      );
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Shadow limit failed", error);
    }
  },

  fetchKanbanBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await adminService.getTalentRequestsKanban();
      set({ kanbanBoard: board, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch kanban board",
      });
    }
  },

  updateRequestStatus: async (id, status) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await adminService.updateTalentRequest(id, { status: status as any });
      await get().fetchKanbanBoard();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Update request failed", error);
    }
  },

  fetchCollaborationKanbanBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await adminService.getCollaborationRequestsKanban();
      set({ collaborationKanbanBoard: board, isLoading: false });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch collaboration kanban board",
      });
    }
  },

  updateCollaborationRequestStatus: async (id, status) => {
    try {
      // We might need a specific admin update method for collab requests if generic one isn't enough
      // For now using the service directly if it exists, or adding it.
      await apiClient.patch(`/admin/collaboration-requests/${id}`, { status });
      await get().fetchCollaborationKanbanBoard();
    } catch (error: unknown) {
      console.error("Update collab request failed", error);
    }
  },
}));
