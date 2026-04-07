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

export interface CreatePulseDto {
  type: PulseType;
  question: string;
  description?: string;
  options: string[];
  audience?: string;
  expiresAt?: string;
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

  // Admin Endpoints
  async getPulses(): Promise<Pulse[]> {
    return apiClient.get<Pulse[]>("/pulse");
  },

  async createPulse(data: CreatePulseDto): Promise<Pulse> {
    return apiClient.post<Pulse>("/pulse", data);
  },

  async updatePulseStatus(id: string, status: PulseStatus): Promise<Pulse> {
    return apiClient.patch<Pulse>(`/pulse/${id}`, { status });
  },
};
