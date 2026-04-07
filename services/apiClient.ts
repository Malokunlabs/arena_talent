import { API_BASE_URL } from "@/lib/config";
import { tokenStorage } from "./authService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

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

      // Redirect to login page if in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw new Error("Session expired. Please login again.");
    }

    let result: ApiResponse<T>;
    try {
      result = await response.json();
    } catch {
      result = {
        status: response.status,
        message: "Failed to parse response",
        data: {} as T,
      };
    }

    if (!response.ok) {
      const errorMessage = result.message || "API request failed";
      // Extract validation errors from data if available
      const errorData = result.data as Record<string, unknown> | null;
      const validationErrors: string[] = Array.isArray(errorData?.errors)
        ? (errorData.errors as string[])
        : [];

      toast({
        title: errorMessage,
        description:
          validationErrors.length > 0
            ? validationErrors.join("\n")
            : (errorData?.error as string | undefined) || errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage);
    }

    if (result.message && options.method !== "GET") {
      toast({
        title: "Success",
        description: result.message,
      });
    }

    // Refined heuristic: Only unwrap "data" if it looks like a standard API wrapper
    // (i.e., it also has "status" or "message" at the top level)
    const resultAsObject = result as unknown as Record<string, unknown>;
    const isWrapped =
      result.data !== undefined &&
      (resultAsObject.status !== undefined ||
        resultAsObject.message !== undefined);

    return isWrapped ? result.data : (result as unknown as T);
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
