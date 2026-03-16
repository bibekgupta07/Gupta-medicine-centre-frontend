import api from "@/lib/api";
import {
  RevenueSummary,
  DailySalesReport,
  DrugInteraction,
  GenericSubstitute,
} from "@/types";

export const analyticsService = {
  // --- Revenue & Sales ---
  getRevenue: async (days = 30): Promise<RevenueSummary> => {
    const res = await api.get("/api/admin/analytics/revenue", { params: { days } });
    return res.data;
  },

  getSalesReports: async (days = 30): Promise<{ reports: DailySalesReport[]; total: number }> => {
    const res = await api.get("/api/admin/analytics/sales-reports", { params: { days } });
    return res.data;
  },

  generateDailyReport: async (): Promise<DailySalesReport> => {
    const res = await api.post("/api/admin/analytics/generate-report");
    return res.data;
  },

  // --- Drug Interactions ---
  getInteractions: async (): Promise<DrugInteraction[]> => {
    const res = await api.get("/api/admin/analytics/interactions");
    return res.data;
  },

  createInteraction: async (data: {
    medicine_a_name: string;
    medicine_b_name: string;
    severity: string;
    description: string;
    recommendation: string;
    source?: string;
  }): Promise<DrugInteraction> => {
    const res = await api.post("/api/admin/analytics/interactions", data);
    return res.data;
  },

  // --- Generic Substitutes ---
  getSubstitutes: async (medicineId: string): Promise<GenericSubstitute[]> => {
    const res = await api.get(`/api/medicines/${medicineId}/substitutes`);
    return res.data;
  },

  createSubstitute: async (data: {
    branded_medicine_id: string;
    branded_name: string;
    generic_medicine_id: string;
    generic_name: string;
    branded_price: number;
    generic_price: number;
    savings_percentage: number;
    notes?: string;
  }): Promise<GenericSubstitute> => {
    const res = await api.post("/api/admin/analytics/substitutes", data);
    return res.data;
  },

  verifySubstitute: async (id: string): Promise<GenericSubstitute> => {
    const res = await api.put(`/api/admin/analytics/substitutes/${id}/verify`);
    return res.data;
  },
};
