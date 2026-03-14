import api from "@/lib/api";
import { DashboardStats } from "@/types";

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/api/admin/dashboard");
    return res.data;
  },
};
