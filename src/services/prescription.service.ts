import api from "@/lib/api";
import { Prescription } from "@/types";

export const prescriptionService = {
  getAll: async (params?: { page?: number; status?: string }) => {
    const res = await api.get("/api/admin/prescriptions", { params });
    return res.data;
  },

  review: async (id: string, data: { status: "approved" | "rejected"; admin_notes?: string }): Promise<Prescription> => {
    const res = await api.put(`/api/admin/prescriptions/${id}/review`, data);
    return res.data;
  },
};
