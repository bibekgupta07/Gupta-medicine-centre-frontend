import api from "@/lib/api";
import { Payment } from "@/types";

interface PaymentListResponse {
  payments: Payment[];
  total: number;
  page: number;
  page_size: number;
}

export const paymentService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<PaymentListResponse> => {
    const res = await api.get("/api/admin/payments/", { params });
    const data = res.data;
    if (Array.isArray(data)) return { payments: data, total: data.length, page: 1, page_size: data.length };
    return { payments: data.payments || data.items || [], total: data.total || 0, page: data.page || 1, page_size: data.page_size || 20 };
  },

  refund: async (paymentId: string, reason: string): Promise<Payment> => {
    const res = await api.post("/api/admin/payments/refund", {
      payment_id: paymentId,
      reason,
    });
    return res.data;
  },
};
