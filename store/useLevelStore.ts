import { create } from "zustand";
import {
  levelService,
  ArenaLevel,
  UserLevelProgress,
} from "@/services/levelService";

interface LevelState {
  levels: ArenaLevel[];
  myProgress: UserLevelProgress | null;
  isLoading: boolean;

  fetchLevels: () => Promise<void>;
  fetchMyLevelProgress: () => Promise<void>;
  clearLevelProgress: () => void;
}

export const useLevelStore = create<LevelState>((set) => ({
  levels: [],
  myProgress: null,
  isLoading: false,

  fetchLevels: async () => {
    try {
      const levels = await levelService.getPublicLevels();
      if (Array.isArray(levels)) {
        set({ levels });
      }
    } catch {
      // silent
    }
  },

  fetchMyLevelProgress: async () => {
    set({ isLoading: true });
    try {
      const myProgress = await levelService.getMyLevelProgress();
      set({
        myProgress,
        levels: myProgress.levels ?? [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  clearLevelProgress: () => {
    set({ myProgress: null });
  },
}));
