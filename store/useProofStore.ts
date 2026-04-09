import { create } from "zustand";
import { proofService, Proof, CreateProofData, UpdateProofData } from "@/services/proofService";
import { usePiStore } from "./usePiStore";
import { toast } from "sonner";

interface ProofState {
  proofs: Proof[];
  userProofs: Proof[];
  isLoading: boolean;
  error: string | null;

  fetchProofs: (filter?: string) => Promise<void>;
  createProof: (data: CreateProofData) => Promise<boolean>;
  updateProof: (id: string, data: UpdateProofData) => Promise<boolean>;
  deleteProof: (id: string) => Promise<boolean>;
  addUserProof: (proof: Proof) => void;
  saluteProof: (id: string) => Promise<void>;
  fetchUserProofs: () => Promise<void>;
  shareProof: (id: string) => Promise<void>;
}

export const useProofStore = create<ProofState>((set) => ({
  proofs: [],
  userProofs: [],
  isLoading: false,
  error: null,

  fetchProofs: async (filter = "All") => {
    set({ isLoading: true, error: null });
    try {
      const result = await proofService.getProofs({ filter });
      set({ proofs: result.data || [], isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch proofs",
      });
    }
  },

  createProof: async (data: CreateProofData) => {
    set({ isLoading: true, error: null });
    try {
      const newProof = await proofService.createProof(data);
      // Optimistically update lists
      set((state) => ({
        proofs: [newProof, ...state.proofs],
        userProofs: [newProof, ...state.userProofs],
        isLoading: false,
      }));
      // Refresh PI after proof creation (+10 PI)
      await usePiStore.getState().refreshAfterProof(10);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to create proof",
      });
      return false;
    }
  },

  addUserProof: (proof: Proof) => {
    set((state) => ({ userProofs: [proof, ...state.userProofs] }));
  },

  updateProof: async (id, data) => {
    try {
      const updated = await proofService.updateProof(id, data);
      set((state) => ({
        proofs: state.proofs.map((p) => (p.id === id ? updated : p)),
        userProofs: state.userProofs.map((p) => (p.id === id ? updated : p)),
      }));
      return true;
    } catch (error) {
      console.error("Failed to update proof:", error);
      return false;
    }
  },

  deleteProof: async (id) => {
    try {
      await proofService.deleteProof(id);
      set((state) => ({
        proofs: state.proofs.filter((p) => p.id !== id),
        userProofs: state.userProofs.filter((p) => p.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete proof:", error);
      return false;
    }
  },

  saluteProof: async (id: string) => {
    // Optimistic update
    set((state) => {
      const updateProof = (p: Proof) =>
        p.id === id ? { ...p, salutesCount: (p.salutesCount || 0) + 1 } : p;

      return {
        proofs: state.proofs.map(updateProof),
        userProofs: state.userProofs.map(updateProof),
      };
    });

    try {
      await proofService.saluteProof(id);
    } catch (error) {
      // Revert on error
      set((state) => {
        const revertProof = (p: Proof) =>
          p.id === id ? { ...p, salutesCount: (p.salutesCount || 1) - 1 } : p;

        return {
          proofs: state.proofs.map(revertProof),
          userProofs: state.userProofs.map(revertProof),
        };
      });
      console.error("Failed to salute proof:", error);
    }
  },

  fetchUserProofs: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await proofService.getMyProofs();
      set({ userProofs: result.data || [], isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch user proofs",
      });
    }
  },

  shareProof: async (id: string) => {
    try {
      const piStatus = await proofService.shareProof(id);
      // Response IS PiStatus — update store directly
      usePiStore.getState().updatePiStatus(piStatus);
      toast.success(`+3 PI earned! You're at ${piStatus.piScore} PI`);
    } catch (error) {
      console.error("Failed to share proof:", error);
    }
  },
}));
