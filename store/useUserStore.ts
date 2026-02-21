import { create } from "zustand";
import {
  userService,
  UserProfile,
  UpdateUserData,
} from "@/services/userService";

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchUser: () => Promise<void>;
  updateUser: (data: UpdateUserData) => Promise<boolean>;
  clearUser: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchUser: async () => {
    const { lastFetch, user } = get();
    const now = Date.now();

    // Return cached data if still valid
    if (user && lastFetch && now - lastFetch < CACHE_DURATION) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const userData = await userService.getUserProfile();
      set({
        user: userData,
        isLoading: false,
        lastFetch: now,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch user profile",
      });
    }
  },

  updateUser: async (data: UpdateUserData) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await userService.updateUserProfile(data);
      set({
        user: updatedUser,
        isLoading: false,
        lastFetch: Date.now(),
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to update profile",
      });
      return false;
    }
  },

  clearUser: () => {
    set({
      user: null,
      isLoading: false,
      error: null,
      lastFetch: null,
    });
  },
}));
