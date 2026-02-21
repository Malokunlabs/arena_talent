import { create } from "zustand";
import { proofService, Proof, CreateProofData } from "@/services/proofService";

interface ProofState {
  proofs: Proof[];
  userProofs: Proof[];
  isLoading: boolean;
  error: string | null;

  fetchProofs: (filter?: string) => Promise<void>;
  createProof: (data: CreateProofData) => Promise<boolean>;
  addUserProof: (proof: Proof) => void;
  saluteProof: (id: string) => Promise<void>;
  fetchUserProofs: () => Promise<void>;
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
      set({ proofs: result.data, isLoading: false });
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
      set({ userProofs: result.data, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch user proofs",
      });
    }
  },
}));
