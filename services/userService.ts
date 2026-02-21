import { apiClient } from "./apiClient";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  async getUserProfile(): Promise<UserProfile> {
    return apiClient.get("/auth/profile");
  },

  async updateUserProfile(data: UpdateUserData): Promise<UserProfile> {
    // Check if apiClient supports PATCH or if we need to implement it
    return apiClient.patch("/auth/profile", data);
  },
};
