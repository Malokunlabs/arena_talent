import { apiClient } from "./apiClient";

export interface PiStatus {
  piScore: number;
  progressIndex: number;
  level: number;
  piToNextLevel: number;
  nextLevelPi: number | null;
}

export interface LevelEntry {
  level: number;
  piRequired: number;
}

export function getBarFillPercent(status: PiStatus): number {
  if (status.nextLevelPi === null) return 100;
  return Math.min((status.piScore / status.nextLevelPi) * 100, 100);
}

export function getPiSubLabel(status: PiStatus): string {
  if (status.nextLevelPi === null) return "Max level reached 🏆";
  return `${status.piToNextLevel} PI to Level ${status.level + 1}`;
}

export const piService = {
  async getMyPiStatus(): Promise<PiStatus> {
    return apiClient.get<PiStatus>("/pi/me");
  },

  async getLevels(): Promise<LevelEntry[]> {
    return apiClient.get<LevelEntry[]>("/pi/levels");
  },
};
