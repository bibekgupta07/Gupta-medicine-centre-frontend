import api from "@/lib/api";
import { MedicineBatch, Supplier } from "@/types";

export const inventoryService = {
  getBatches: async (params?: { medicine_id?: string; expiring_soon?: boolean }) => {
    const res = await api.get("/api/admin/inventory/batches/", { params });
    return res.data;
  },

  createBatch: async (data: Partial<MedicineBatch>): Promise<MedicineBatch> => {
    const res = await api.post("/api/admin/inventory/batches/", data);
    return res.data;
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await api.get("/api/admin/inventory/suppliers/");
    return res.data;
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const res = await api.post("/api/admin/inventory/suppliers/", data);
    return res.data;
  },

  getExpiryAlerts: async () => {
    const res = await api.get("/api/admin/inventory/expiring");
    return res.data;
  },
};
