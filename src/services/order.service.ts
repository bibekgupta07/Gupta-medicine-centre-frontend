import api from "@/lib/api";
import { Order } from "@/types";

interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

export const orderService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<OrderListResponse> => {
    const res = await api.get("/api/admin/orders", { params });
    const data = res.data;
    if (Array.isArray(data)) return { orders: data, total: data.length, page: 1, page_size: data.length };
    return { orders: data.orders || data.items || [], total: data.total || 0, page: data.page || 1, page_size: data.page_size || 20 };
  },

  getById: async (id: string): Promise<Order> => {
    const res = await api.get(`/api/admin/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<Order> => {
    const res = await api.put(`/api/admin/orders/${id}/status`, { status, notes });
    return res.data;
  },
};
