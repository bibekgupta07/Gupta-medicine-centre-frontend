import api from "@/lib/api";
import { Payment } from "@/types";

export const paymentService = {
  getAll: async (params?: { page?: number; status?: string }) => {
    const res = await api.get("/api/admin/payments/", { params });
    return res.data;
  },

  refund: async (paymentId: string, data: { reason: string }): Promise<Payment> => {
    const res = await api.post("/api/admin/payments/refund", { payment_id: paymentId, ...data });
    return res.data;
  },
};
