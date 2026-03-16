import api from "@/lib/api";
import { Prescription, PrescriptionStatus } from "@/types";

interface PrescriptionListResponse {
  prescriptions: Prescription[];
  total: number;
  page: number;
  page_size: number;
}

export const prescriptionService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PrescriptionListResponse> => {
    const res = await api.get("/api/admin/prescriptions", { params });
    const data = res.data;
    if (Array.isArray(data)) return { prescriptions: data, total: data.length, page: 1, page_size: data.length };
    return { prescriptions: data.prescriptions || data.items || [], total: data.total || 0, page: data.page || 1, page_size: data.page_size || 20 };
  },

  review: async (
    id: string,
    data: { status: PrescriptionStatus; admin_notes?: string }
  ): Promise<Prescription> => {
    const res = await api.put(`/api/admin/prescriptions/${id}/review`, data);
    return res.data;
  },
};
