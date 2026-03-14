import api from "@/lib/api";
import { Order } from "@/types";

export const orderService = {
  getAll: async (params?: { page?: number; status?: string; search?: string }) => {
    const res = await api.get("/api/admin/orders", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Order> => {
    const res = await api.get(`/api/admin/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const res = await api.put(`/api/admin/orders/${id}/status`, { status });
    return res.data;
  },
};
