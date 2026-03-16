import api from "@/lib/api";
import { Category, CategoryCreate, CategoryUpdate } from "@/types";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get("/api/categories/");
    return res.data;
  },

  getAllAdmin: async (): Promise<Category[]> => {
    const res = await api.get("/api/admin/categories");
    return res.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const res = await api.post("/api/admin/categories", data);
    return res.data;
  },

  update: async (id: string, data: CategoryUpdate): Promise<Category> => {
    const res = await api.put(`/api/admin/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/categories/${id}`);
  },
};
