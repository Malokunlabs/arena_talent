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
};
