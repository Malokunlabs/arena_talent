import { create } from "zustand";
import { pulseService, Pulse } from "@/services/pulseService";

interface PulseState {
  activePulse: Pulse | null;
  isLoading: boolean;
  error: string | null;
  fetchActivePulse: () => Promise<void>;
  clearPulse: () => void;
}

export const usePulseStore = create<PulseState>((set) => ({
  activePulse: null,
  isLoading: false,
  error: null,
  fetchActivePulse: async () => {
    set({ isLoading: true, error: null });
    try {
      const pulse = await pulseService.getActivePulse();
      set({ activePulse: pulse, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false, activePulse: null });
    }
  },
  clearPulse: () => set({ activePulse: null }),
}));
