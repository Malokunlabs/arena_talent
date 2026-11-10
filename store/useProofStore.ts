import { create } from "zustand";
import {
  proofService,
  Proof,
  CreateProofData,
  UpdateProofData,
} from "@/services/proofService";
import { useLevelStore } from "./useLevelStore";
import { toast } from "sonner";

interface ProofState {
  proofs: Proof[];
  proofsOfTheWeek: Proof[];
  userProofs: Proof[];
  bookmarkedProofs: Proof[];
  activeFilter: string;
  searchQuery: string;
  isLoading: boolean;
  isPosting: boolean;
  isWeeklyLoading: boolean;
  error: string | null;

  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  fetchProofs: (params?: {
    filter?: string;
    search?: string;
    location?: string;
  }) => Promise<void>;
  fetchProofsOfTheWeek: (limit?: number) => Promise<void>;
  fetchBookmarkedProofs: () => Promise<void>;
  createProof: (data: CreateProofData) => Promise<boolean>;
  updateProof: (id: string, data: UpdateProofData) => Promise<boolean>;
  deleteProof: (id: string) => Promise<boolean>;
  addUserProof: (proof: Proof) => void;
  saluteProof: (id: string) => Promise<void>;
  recordView: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  fetchUserProofs: () => Promise<void>;
  shareProof: (
    id: string,
    platform?:
      | "twitter"
      | "whatsapp"
      | "instagram"
      | "tiktok"
      | "youtube"
      | "copy_link",
  ) => Promise<string | null>;
}

const recordedViewIds = new Set<string>();

export const useProofStore = create<ProofState>((set, get) => ({
  proofs: [],
  proofsOfTheWeek: [],
  userProofs: [],
  bookmarkedProofs: [],
  activeFilter: "all",
  searchQuery: "",
  isLoading: false,
  isPosting: false,
  isWeeklyLoading: false,
  error: null,

  setActiveFilter: (filter: string) => {
    set({ activeFilter: filter });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  fetchProofs: async (params = {}) => {
    const filter = params.filter ?? get().activeFilter ?? "all";
    const search = params.search ?? get().searchQuery ?? "";
    set({ isLoading: true, error: null });
    try {
      const result = await proofService.getProofs({
        filter,
        search,
        location: params.location,
        limit: 25,
      });
      const list = Array.isArray(result) ? result : result.data || [];
      set({ proofs: list, isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch proofs",
      });
    }
  },

  fetchProofsOfTheWeek: async (limit = 5) => {
    set({ isWeeklyLoading: true });
    try {
      const res = await proofService.getProofsOfTheWeek(limit);
      const list = Array.isArray(res)
        ? res
        : (res as { data?: Proof[] })?.data || [];
      set({ proofsOfTheWeek: list, isWeeklyLoading: false });
    } catch {
      set({ isWeeklyLoading: false });
    }
  },

  fetchBookmarkedProofs: async () => {
    try {
      const res = await proofService.getBookmarkedProofs({ limit: 50 });
      set({ bookmarkedProofs: res.data || [] });
    } catch {
      // silent
    }
  },

  createProof: async (data: CreateProofData) => {
    set({ isPosting: true, error: null });
    try {
      const newProof = await proofService.createProof(data);
      set((state) => ({
        proofs: [newProof, ...state.proofs],
        userProofs: [newProof, ...state.userProofs],
        isPosting: false,
      }));
      useLevelStore.getState().fetchMyLevelProgress();
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.message || "Failed to share proof";
      set({
        isPosting: false,
        error: message,
      });
      toast.error(message);
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
        proofsOfTheWeek: state.proofsOfTheWeek.map((p) =>
          p.id === id ? updated : p,
        ),
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
        proofsOfTheWeek: state.proofsOfTheWeek.filter((p) => p.id !== id),
      }));
      useLevelStore.getState().fetchMyLevelProgress();
      return true;
    } catch (error) {
      console.error("Failed to delete proof:", error);
      return false;
    }
  },

  saluteProof: async (id: string) => {
    set((state) => {
      const updateProof = (p: Proof) =>
        p.id === id
          ? {
              ...p,
              hasSaluted: true,
              salutesCount: (p.salutesCount || 0) + 1,
            }
          : p;

      return {
        proofs: state.proofs.map(updateProof),
        userProofs: state.userProofs.map(updateProof),
        proofsOfTheWeek: state.proofsOfTheWeek.map(updateProof),
      };
    });

    try {
      const res = await proofService.saluteProof(id);
      if (res && typeof res.salutesCount === "number") {
        set((state) => {
          const syncProof = (p: Proof) =>
            p.id === id ? { ...p, salutesCount: res.salutesCount } : p;
          return {
            proofs: state.proofs.map(syncProof),
            userProofs: state.userProofs.map(syncProof),
            proofsOfTheWeek: state.proofsOfTheWeek.map(syncProof),
          };
        });
      }
    } catch {
      set((state) => {
        const revertProof = (p: Proof) =>
          p.id === id
            ? {
                ...p,
                salutesCount: Math.max((p.salutesCount || 1) - 1, 0),
              }
            : p;

        return {
          proofs: state.proofs.map(revertProof),
          userProofs: state.userProofs.map(revertProof),
          proofsOfTheWeek: state.proofsOfTheWeek.map(revertProof),
        };
      });
    }
  },

  recordView: async (id: string) => {
    if (!id || recordedViewIds.has(id)) return;
    recordedViewIds.add(id);

    try {
      const res = await proofService.recordView(id);
      if (res && typeof res.viewsCount === "number") {
        set((state) => {
          const syncView = (p: Proof) =>
            p.id === id ? { ...p, viewsCount: res.viewsCount } : p;
          return {
            proofs: state.proofs.map(syncView),
            userProofs: state.userProofs.map(syncView),
            bookmarkedProofs: state.bookmarkedProofs.map(syncView),
            proofsOfTheWeek: state.proofsOfTheWeek.map(syncView),
          };
        });
      }
    } catch {
      recordedViewIds.delete(id);
    }
  },

  toggleLike: async (id: string) => {
    set((state) => {
      const updateItem = (p: Proof) => {
        if (p.id !== id) return p;
        const nextLiked = !p.hasLiked;
        const nextCount = Math.max(
          (p.likesCount || 0) + (nextLiked ? 1 : -1),
          0,
        );
        return { ...p, hasLiked: nextLiked, likesCount: nextCount };
      };
      return {
        proofs: state.proofs.map(updateItem),
        userProofs: state.userProofs.map(updateItem),
        proofsOfTheWeek: state.proofsOfTheWeek.map(updateItem),
      };
    });

    try {
      const res = await proofService.toggleLike(id);
      set((state) => {
        const syncItem = (p: Proof) =>
          p.id === id
            ? { ...p, hasLiked: res.liked, likesCount: res.likesCount }
            : p;
        return {
          proofs: state.proofs.map(syncItem),
          userProofs: state.userProofs.map(syncItem),
          proofsOfTheWeek: state.proofsOfTheWeek.map(syncItem),
        };
      });
    } catch {
      // Revert on failure
      get().fetchProofs();
    }
  },

  toggleBookmark: async (id: string) => {
    set((state) => {
      const updateItem = (p: Proof) => {
        if (p.id !== id) return p;
        const nextBookmarked = !p.isBookmarked;
        const nextCount = Math.max(
          (p.bookmarksCount || 0) + (nextBookmarked ? 1 : -1),
          0,
        );
        return {
          ...p,
          isBookmarked: nextBookmarked,
          bookmarksCount: nextCount,
        };
      };
      return {
        proofs: state.proofs.map(updateItem),
        userProofs: state.userProofs.map(updateItem),
        proofsOfTheWeek: state.proofsOfTheWeek.map(updateItem),
      };
    });

    try {
      const res = await proofService.toggleBookmark(id);
      set((state) => {
        const syncItem = (p: Proof) =>
          p.id === id
            ? {
                ...p,
                isBookmarked: res.bookmarked,
                bookmarksCount: res.bookmarksCount,
              }
            : p;
        return {
          proofs: state.proofs.map(syncItem),
          userProofs: state.userProofs.map(syncItem),
          proofsOfTheWeek: state.proofsOfTheWeek.map(syncItem),
        };
      });
      toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed bookmark");
    } catch {
      get().fetchProofs();
    }
  },

  fetchUserProofs: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await proofService.getMyProofs({ limit: 50 });
      set({ userProofs: result.data || [], isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch user proofs",
      });
    }
  },

  shareProof: async (id: string, platform = "copy_link") => {
    try {
      const res = await proofService.shareProof(id, platform);
      const urlToCopy =
        res?.shareUrl || `${window.location.origin}/proofs/${id}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(urlToCopy);
      }
      toast.success("Proof link copied to clipboard!");
      return urlToCopy;
    } catch {
      const fallback =
        typeof window !== "undefined"
          ? `${window.location.origin}/proofs/${id}`
          : "";
      if (fallback && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(fallback);
        toast.success("Proof link copied to clipboard!");
      }
      return fallback;
    }
  },
}));
