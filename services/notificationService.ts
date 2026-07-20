import { apiClient } from "./apiClient";

export interface NotificationItem {
  id: string;
  userId: string | null;
  isAdmin: boolean;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // User notifications
  getUserNotifications(): Promise<NotificationItem[]> {
    return apiClient.get<NotificationItem[]>("/notifications");
  },

  getUserUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>("/notifications/unread-count");
  },

  markAsRead(id: string): Promise<NotificationItem> {
    return apiClient.patch<NotificationItem>(`/notifications/${id}/read`, {});
  },

  markAllUserRead(): Promise<{ count: number }> {
    return apiClient.patch<{ count: number }>("/notifications/read-all", {});
  },

  // Admin notifications
  getAdminNotifications(): Promise<NotificationItem[]> {
    return apiClient.get<NotificationItem[]>("/notifications/admin");
  },

  getAdminUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>("/notifications/admin/unread-count");
  },

  markAllAdminRead(): Promise<{ count: number }> {
    return apiClient.patch<{ count: number }>("/notifications/admin/read-all", {});
  },
};
