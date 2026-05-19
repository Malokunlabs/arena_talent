import { apiClient } from "./apiClient";

export type PulseType = "POLL" | "EMOJI" | "BRAND";
export type PulseStatus = "DRAFT" | "LIVE" | "CLOSED";

export interface Pulse {
  id: string;
  type: PulseType;
  question: string;
  description?: string;
  options: string[];
  status: PulseStatus;
  expiresAt?: string;
  audience?: string;
  responseCount?: number;
}

export interface PulseResponse {
  id: string;
  pulseId: string;
  userId: string;
  value: string;
  createdAt: string;
}

export interface DayProgress {
  day: string;
  date: string;
  completed: boolean;
  isToday: boolean;
}

export interface HistoryDay extends DayProgress {
  piEarned: number;
}

export interface Insight {
  type: string;
  title: string;
  text: string;
}

export interface PulseStats {
  currentStreak: number;
  streakActive: boolean;
  todayAvailablePi: number;
  todayEarnedPi: number;
  streakBonusAvailable: number;
  totalPotentialToday: number;
  totalQuestionsToday: number;
  answeredQuestionsToday: number;
  weekProgress: DayProgress[];
  last7DaysHistory: HistoryDay[];
  insights: Insight[];
}

 export const pulseService = {
  // User Endpoints
  async getActivePulse(): Promise<Pulse | null> {
    try {
      return await apiClient.get<Pulse>("/pulse/active");
    } catch {
      return null;
    }
  },

  async respondToPulse(id: string, value: string): Promise<PulseResponse> {
    return apiClient.post<PulseResponse>(`/pulse/${id}/respond`, { value });
  },

  async getPulseStats(): Promise<PulseStats> {
    return apiClient.get<PulseStats>("/pulse/stats");
  },
};
