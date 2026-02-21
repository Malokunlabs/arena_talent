import { API_BASE_URL } from "@/lib/config";
import { tokenStorage } from "./authService";
import { useAuthStore } from "@/store/useAuthStore";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (response.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }

    return response.json();
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
