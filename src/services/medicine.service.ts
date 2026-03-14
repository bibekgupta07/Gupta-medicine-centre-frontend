import api from "@/lib/api";
import { Medicine, Category } from "@/types";

export const medicineService = {
  getAll: async (params?: { page?: number; search?: string; category_id?: string }) => {
    const res = await api.get("/api/medicines/", { params });
    return res.data;
  },

  getById: async (id: string): Promise<Medicine> => {
    const res = await api.get(`/api/medicines/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>): Promise<Medicine> => {
    const res = await api.post("/api/admin/medicines", data);
    return res.data;
  },

  update: async (id: string, data: Record<string, unknown>): Promise<Medicine> => {
    const res = await api.put(`/api/admin/medicines/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/medicines/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get("/api/categories/");
    return res.data;
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    const res = await api.post("/api/admin/categories", data);
    return res.data;
  },

  updateCategory: async (id: string, data: { name?: string; description?: string; is_active?: boolean }): Promise<Category> => {
    const res = await api.put(`/api/admin/categories/${id}`, data);
    return res.data;
  },
};
