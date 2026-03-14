import api from "@/lib/api";
import { User } from "@/types";

export const userService = {
  getAll: async (params?: { page?: number; search?: string; role?: string }) => {
    const res = await api.get("/api/admin/users", { params });
    return res.data;
  },

  getById: async (id: string): Promise<User> => {
    const res = await api.get(`/api/admin/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id: string, is_active: boolean): Promise<User> => {
    const res = await api.put(`/api/admin/users/${id}`, { is_active });
    return res.data;
  },
};
