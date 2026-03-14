import api from "@/lib/api";

export const notificationService = {
  sendToUser: async (data: { user_id: string; title: string; message: string; type?: string }) => {
    const res = await api.post("/api/admin/notifications", data);
    return res.data;
  },

  broadcast: async (data: { title: string; message: string; type?: string }) => {
    const res = await api.post("/api/admin/notifications", data);
    return res.data;
  },
};
