import api from "@/lib/api";
import { MedicineBatch, Supplier, PurchaseOrder } from "@/types";

interface BatchListResponse {
  batches: MedicineBatch[];
  total: number;
}

interface SupplierListResponse {
  suppliers: Supplier[];
  total: number;
}

interface PurchaseOrderListResponse {
  purchase_orders: PurchaseOrder[];
  total: number;
}

export const inventoryService = {
  // --- Batches ---
  getBatches: async (params?: {
    medicine_id?: string;
    page?: number;
    page_size?: number;
  }): Promise<BatchListResponse> => {
    const res = await api.get("/api/admin/inventory/batches/", { params });
    const data = res.data;
    if (Array.isArray(data)) return { batches: data, total: data.length };
    return { batches: data.batches || data.items || [], total: data.total || 0 };
  },

  createBatch: async (data: {
    medicine_id: string;
    batch_number: string;
    quantity: number;
    manufacturing_date: string;
    expiry_date: string;
    purchase_price: number;
    supplier_id?: string;
    barcode?: string;
  }): Promise<MedicineBatch> => {
    const res = await api.post("/api/admin/inventory/batches/", data);
    return res.data;
  },

  updateBatch: async (id: string, data: Partial<MedicineBatch>): Promise<MedicineBatch> => {
    const res = await api.put(`/api/admin/inventory/batches/${id}`, data);
    return res.data;
  },

  getExpiryAlerts: async (days = 90): Promise<MedicineBatch[]> => {
    const res = await api.get("/api/admin/inventory/expiring", { params: { days } });
    const data = res.data;
    return Array.isArray(data) ? data : data.batches || data.alerts || [];
  },

  // --- Suppliers ---
  getSuppliers: async (): Promise<SupplierListResponse> => {
    const res = await api.get("/api/admin/inventory/suppliers/");
    const data = res.data;
    if (Array.isArray(data)) return { suppliers: data, total: data.length };
    return { suppliers: data.suppliers || data.items || [], total: data.total || 0 };
  },

  createSupplier: async (data: {
    name: string;
    contact_person: string;
    phone: string;
    email?: string;
    address?: string;
  }): Promise<Supplier> => {
    const res = await api.post("/api/admin/inventory/suppliers/", data);
    return res.data;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const res = await api.put(`/api/admin/inventory/suppliers/${id}`, data);
    return res.data;
  },

  // --- Purchase Orders ---
  getPurchaseOrders: async (params?: {
    page?: number;
    page_size?: number;
    po_status?: string;
  }): Promise<PurchaseOrderListResponse> => {
    const res = await api.get("/api/admin/inventory/purchase-orders/", { params });
    const data = res.data;
    if (Array.isArray(data)) return { purchase_orders: data, total: data.length };
    return { purchase_orders: data.purchase_orders || data.items || [], total: data.total || 0 };
  },

  createPurchaseOrder: async (data: {
    supplier_id: string;
    items: { medicine_id: string; quantity: number; unit_price: number }[];
    notes?: string;
  }): Promise<PurchaseOrder> => {
    const res = await api.post("/api/admin/inventory/purchase-orders/", data);
    return res.data;
  },

  updatePurchaseOrder: async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const res = await api.put(`/api/admin/inventory/purchase-orders/${id}`, data);
    return res.data;
  },
};
