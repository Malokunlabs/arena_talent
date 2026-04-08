import { apiClient } from "./apiClient";

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  accessToken: string;
  loggedInUser?: {
    id: string;
    email: string;
    username?: string;
    avatarUrl?: string;
    role?: string;
  };
  user?: {
    id: string;
    email: string;
    username?: string;
    avatarUrl?: string;
    role?: string;
  };
}

// Token management utilities
const TOKEN_KEY = "arena_auth_token";

export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>("/auth/register", data);

    // Store token if provided
    if (result.accessToken) {
      tokenStorage.setToken(result.accessToken);
    }

    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>("/auth/login", data);

    // Store token
    if (result.accessToken) {
      tokenStorage.setToken(result.accessToken);
    }

    return result;
  },

  logout(): void {
    tokenStorage.removeToken();
  },

  async resendVerification(data: { email: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/resend-verification", data);
  },
};
