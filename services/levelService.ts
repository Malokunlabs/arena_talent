import { apiClient } from "./apiClient";

export interface ArenaLevelSummary {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  iconKey: string | null;
  color: string;
  minProofs: number;
  maxProofs: number | null;
}

export interface ArenaLevel extends ArenaLevelSummary {
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  info?: {
    requirementText?: string;
    perks?: string[];
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelBadgeProgressItem extends ArenaLevel {
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface UserLevelProgress {
  title: string;
  subtitle: string;
  totalProofs: number;
  currentLevel: ArenaLevel;
  nextLevel: ArenaLevel | null;
  proofsToNextLevel: number;
  progressPercent: number;
  indexLabel: string;
  levels: LevelBadgeProgressItem[];
}

export const levelService = {
  async getPublicLevels(): Promise<ArenaLevel[]> {
    return apiClient.get<ArenaLevel[]>("/levels");
  },

  async getMyLevelProgress(): Promise<UserLevelProgress> {
    return apiClient.get<UserLevelProgress>("/levels/me");
  },

  async getUserLevelProgress(userId: string): Promise<UserLevelProgress> {
    return apiClient.get<UserLevelProgress>(`/levels/user/${userId}`);
  },
};
