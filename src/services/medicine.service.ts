import api from "@/lib/api";
import { Medicine, MedicineCreate } from "@/types";

interface MedicineListResponse {
  medicines: Medicine[];
  total: number;
  page: number;
  page_size: number;
}

export const medicineService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category_id?: string;
  }): Promise<MedicineListResponse> => {
    const res = await api.get("/api/admin/medicines", { params });
    const data = res.data;
    if (Array.isArray(data)) return { medicines: data, total: data.length, page: 1, page_size: data.length };
    return { medicines: data.medicines || data.items || [], total: data.total || 0, page: data.page || 1, page_size: data.page_size || 20 };
  },

  getById: async (id: string): Promise<Medicine> => {
    const res = await api.get(`/api/medicines/${id}`);
    return res.data;
  },

  create: async (data: MedicineCreate): Promise<Medicine> => {
    const res = await api.post("/api/admin/medicines", data);
    return res.data;
  },

  update: async (id: string, data: Partial<MedicineCreate>): Promise<Medicine> => {
    const res = await api.put(`/api/admin/medicines/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/medicines/${id}`);
  },

  updateStock: async (id: string, quantity: number): Promise<Medicine> => {
    const res = await api.put(`/api/admin/medicines/${id}/stock`, null, { params: { quantity } });
    return res.data;
  },

  getLowStock: async (threshold = 10): Promise<Medicine[]> => {
    const res = await api.get("/api/admin/medicines/low-stock", { params: { threshold } });
    return res.data;
  },
};
