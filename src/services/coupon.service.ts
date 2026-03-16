import api from "@/lib/api";
import { Coupon, CouponCreate } from "@/types";

interface CouponListResponse {
  coupons: Coupon[];
  total: number;
}

export const couponService = {
  getAll: async (params?: { page?: number; page_size?: number }): Promise<CouponListResponse> => {
    const res = await api.get("/api/admin/coupons/", { params });
    const data = res.data;
    if (Array.isArray(data)) return { coupons: data, total: data.length };
    return { coupons: data.coupons || data.items || [], total: data.total || 0 };
  },

  create: async (data: CouponCreate): Promise<Coupon> => {
    const res = await api.post("/api/admin/coupons/", data);
    return res.data;
  },

  update: async (id: string, data: Partial<CouponCreate>): Promise<Coupon> => {
    const res = await api.put(`/api/admin/coupons/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/coupons/${id}`);
  },
};
