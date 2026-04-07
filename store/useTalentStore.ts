/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  talentService,
  Talent,
  TalentProfile,
  GetTalentsParams,
} from "@/services/talentService";

interface TalentState {
  talents: Talent[];
  selectedTalentProfile: TalentProfile | null;
  isLoading: boolean;
  isSendingRequest: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  fetchTalents: (params?: GetTalentsParams) => Promise<void>;
  fetchTalentByUsername: (username: string) => Promise<void>;
  clearSelectedTalent: () => void;
  sendTalentRequest: (data: any) => Promise<void>;
}

export const useTalentStore = create<TalentState>((set) => ({
  talents: [],
  selectedTalentProfile: null,
  isLoading: false,
  isSendingRequest: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  fetchTalents: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await talentService.getTalents(params);
      set({
        talents: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch talents",
      });
    }
  },

  sendTalentRequest: async (data: any) => {
    set({ isSendingRequest: true, error: null });
    try {
      await talentService.createTalentRequest(data);
      set({ isSendingRequest: false });
    } catch (error: any) {
      set({
        isSendingRequest: false,
        error: error.message || "Failed to send talent request",
      });
      throw error;
    }
  },

  fetchTalentByUsername: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await talentService.getTalentByUsername(username);
      set({ selectedTalentProfile: result, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch talent profile",
      });
    }
  },

  clearSelectedTalent: () => set({ selectedTalentProfile: null }),
}));
