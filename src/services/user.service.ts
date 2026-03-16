import api from "@/lib/api";
import { User } from "@/types";

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export const userService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<UserListResponse> => {
    const res = await api.get("/api/admin/users", { params });
    const data = res.data;
    if (Array.isArray(data)) return { users: data, total: data.length, page: 1, page_size: data.length };
    return { users: data.users || data.items || [], total: data.total || 0, page: data.page || 1, page_size: data.page_size || 20 };
  },

  update: async (id: string, data: {
    role?: string;
    is_active?: boolean;
    full_name?: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.put(`/api/admin/users/${id}`, data);
    return res.data;
  },

  toggleStatus: async (id: string, is_active: boolean): Promise<User> => {
    const res = await api.put(`/api/admin/users/${id}`, { is_active });
    return res.data;
  },
};
