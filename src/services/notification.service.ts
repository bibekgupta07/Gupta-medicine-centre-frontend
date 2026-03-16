import api from "@/lib/api";
import { Notification, NotificationCreate } from "@/types";

export const notificationService = {
  send: async (data: NotificationCreate): Promise<Notification> => {
    const res = await api.post("/api/admin/notifications", data);
    return res.data;
  },

  sendToUser: async (data: { user_id: string; title: string; message: string; type?: string }): Promise<Notification> => {
    const res = await api.post("/api/admin/notifications", data);
    return res.data;
  },

  broadcast: async (data: { title: string; message: string; type?: string }): Promise<Notification> => {
    const res = await api.post("/api/admin/notifications", data);
    return res.data;
  },
};
