import { create } from "zustand";
import { piService, PiStatus } from "@/services/piService";
import { toast } from "sonner";

interface PiState {
  piStatus: PiStatus | null;
  isLoading: boolean;
  showLevelUp: boolean;
  newLevel: number | null;

  fetchPiStatus: () => Promise<void>;
  updatePiStatus: (newStatus: PiStatus) => void;
  refreshAfterProof: (piAwarded?: number) => Promise<void>;
  dismissLevelUp: () => void;
}

export const usePiStore = create<PiState>((set, get) => ({
  piStatus: null,
  isLoading: false,
  showLevelUp: false,
  newLevel: null,

  fetchPiStatus: async () => {
    set({ isLoading: true });
    try {
      const status = await piService.getMyPiStatus();
      set({ piStatus: status, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updatePiStatus: (newStatus: PiStatus) => {
    const prev = get().piStatus;
    const leveledUp = prev !== null && newStatus.level > prev.level;

    set({
      piStatus: newStatus,
      showLevelUp: leveledUp,
      newLevel: leveledUp ? newStatus.level : get().newLevel,
    });
  },

  refreshAfterProof: async (piAwarded = 10) => {
    try {
      const prev = get().piStatus;
      const newStatus = await piService.getMyPiStatus();
      const leveledUp = prev !== null && newStatus.level > prev.level;

      set({
        piStatus: newStatus,
        showLevelUp: leveledUp,
        newLevel: leveledUp ? newStatus.level : get().newLevel,
      });

      toast.success(`+${piAwarded} PI earned! You're at ${newStatus.piScore} PI`);

      if (leveledUp) {
        // LevelUpModal is driven by showLevelUp state
        toast.success(`🎉 You reached Level ${newStatus.level}!`);
      }
    } catch {
      // Silent fail — PI refresh is non-critical
    }
  },

  dismissLevelUp: () => {
    set({ showLevelUp: false, newLevel: null });
  },
}));
