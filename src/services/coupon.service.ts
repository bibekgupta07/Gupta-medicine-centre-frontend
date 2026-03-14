import api from "@/lib/api";
import { Coupon } from "@/types";

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
    const res = await api.get("/api/admin/coupons/");
    return res.data;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    const res = await api.post("/api/admin/coupons/", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const res = await api.put(`/api/admin/coupons/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/coupons/${id}`);
  },
};
