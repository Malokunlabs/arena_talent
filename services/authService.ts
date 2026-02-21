import { API_BASE_URL } from "@/lib/config";

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
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    const result = await response.json();

    // Store token if provided
    if (result.accessToken) {
      tokenStorage.setToken(result.accessToken);
    }

    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    const result = await response.json();

    // Store token
    if (result.accessToken) {
      tokenStorage.setToken(result.accessToken);
    }

    return result;
  },

  logout(): void {
    tokenStorage.removeToken();
  },
};
