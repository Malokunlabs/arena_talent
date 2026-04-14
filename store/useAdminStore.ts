import { create } from "zustand";
import {
  adminService,
  DashboardStats,
  AdminProof,
  ProofFilter,
  KanbanColumn,
  CollaborationKanbanColumn,
  AdminTalent,
  TalentListResponse,
  TalentFilter,
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
  flagProof: (id: string, message?: string) => Promise<void>;
  quickFeatureProof: (id: string) => Promise<void>;
  toggleFeatureProof: (id: string, isFeatured: boolean) => Promise<void>;
  toggleShadowLimitProof: (id: string, shadowLimited: boolean) => Promise<void>;
  fetchKanbanBoard: () => Promise<void>;
  updateRequestStatus: (id: string, status: string) => Promise<void>;
  kanbanBoard: KanbanColumn[];
  collaborationKanbanBoard: CollaborationKanbanColumn[];
  fetchCollaborationKanbanBoard: () => Promise<void>;
  updateCollaborationRequestStatus: (id: string, status: string) => Promise<void>;
  // Talent Directory
  talents: AdminTalent[];
  talentsMeta: TalentListResponse["meta"];
  fetchTalents: (filter?: TalentFilter) => Promise<void>;
  verifyTalent: (id: string) => Promise<void>;
  unverifyTalent: (id: string) => Promise<void>;
  deleteTalent: (id: string) => Promise<void>;
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
  talents: [],
  talentsMeta: { page: 1, limit: 20, total: 0, pageCount: 0 },
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await adminService.getDashboardStats();
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch dashboard stats",
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
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch proofs",
      });
    }
  },

  approveProof: async (id, message) => {
    try {
      const updatedProof = await adminService.approveProof(id, message);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Approve failed", error);
    }
  },

  rejectProof: async (id, reason, message) => {
    try {
      const updatedProof = await adminService.rejectProof(id, reason, message);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Reject failed", error);
    }
  },

  flagProof: async (id, message) => {
    try {
      const updatedProof = await adminService.flagProof(id, message);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Flag failed", error);
    }
  },

  quickFeatureProof: async (id) => {
    try {
      const updatedProof = await adminService.quickFeatureProof(id);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Quick feature failed", error);
    }
  },

  toggleFeatureProof: async (id, isFeatured) => {
    try {
      const updatedProof = await adminService.toggleFeatureProof(
        id,
        isFeatured,
      );
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Feature toggle failed", error);
    }
  },

  toggleShadowLimitProof: async (id, shadowLimited) => {
    try {
      const updatedProof = await adminService.toggleShadowLimitProof(
        id,
        shadowLimited,
      );
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updatedProof : p)),
      }));
    } catch (error: unknown) {
      console.error("Shadow limit toggle failed", error);
    }
  },

  fetchKanbanBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await adminService.getTalentRequestsKanban();
      set({ kanbanBoard: board, isLoading: false });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: (error as Error).message || "Failed to fetch kanban board",
      });
    }
  },

  updateRequestStatus: async (id, status) => {
    try {
      await adminService.updateTalentRequest(id, { status: status as never });
      await get().fetchKanbanBoard();
    } catch (error: unknown) {
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
      await apiClient.patch(`/admin/collaboration-requests/${id}`, { status });
      await get().fetchCollaborationKanbanBoard();
    } catch (error: unknown) {
      console.error("Update collab request failed", error);
    }
  },

  fetchTalents: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getTalents(filter);
      set({ talents: response.data, talentsMeta: response.meta, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, error: (error as Error).message || "Failed to fetch talents" });
    }
  },

  verifyTalent: async (id) => {
    try {
      const updated = await adminService.verifyTalent(id);
      set((state) => ({
        talents: state.talents.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error: unknown) {
      console.error("Verify talent failed", error);
    }
  },

  unverifyTalent: async (id) => {
    try {
      const updated = await adminService.unverifyTalent(id);
      set((state) => ({
        talents: state.talents.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error: unknown) {
      console.error("Unverify talent failed", error);
    }
  },

  deleteTalent: async (id) => {
    try {
      await adminService.deleteTalent(id);
      set((state) => ({
        talents: state.talents.filter((t) => t.id !== id),
        talentsMeta: {
          ...state.talentsMeta,
          total: state.talentsMeta.total - 1,
        },
      }));
    } catch (error: unknown) {
      console.error("Delete talent failed", error);
    }
  },
}));
