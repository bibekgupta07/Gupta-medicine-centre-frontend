import api from "@/lib/api";
import { DashboardData } from "@/types";

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    const res = await api.get("/api/admin/dashboard");
    return res.data;
  },
};
