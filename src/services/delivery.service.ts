import api from "@/lib/api";
import { DeliveryAgent, DeliveryZone } from "@/types";

interface AgentListResponse {
  agents: DeliveryAgent[];
  total: number;
}

export const deliveryService = {
  getAgents: async (params?: {
    page?: number;
    page_size?: number;
    available_only?: boolean;
  }): Promise<AgentListResponse> => {
    const res = await api.get("/api/admin/delivery/agents/", { params });
    const data = res.data;
    if (Array.isArray(data)) return { agents: data, total: data.length };
    return { agents: data.agents || data.items || [], total: data.total || 0 };
  },

  createAgent: async (data: {
    name: string;
    phone: string;
    email?: string;
    vehicle_type: string;
    vehicle_number?: string;
  }): Promise<DeliveryAgent> => {
    const res = await api.post("/api/admin/delivery/agents/", data);
    return res.data;
  },

  updateAgent: async (id: string, data: Partial<DeliveryAgent>): Promise<DeliveryAgent> => {
    const res = await api.put(`/api/admin/delivery/agents/${id}`, data);
    return res.data;
  },

  getZones: async (): Promise<DeliveryZone[]> => {
    const res = await api.get("/api/admin/delivery/zones/");
    const data = res.data;
    return Array.isArray(data) ? data : data.zones || [];
  },

  createZone: async (data: {
    name: string;
    base_charge: number;
    per_km_charge: number;
    min_order_free_delivery: number;
    estimated_time_minutes: number;
  }): Promise<DeliveryZone> => {
    const res = await api.post("/api/admin/delivery/zones/", data);
    return res.data;
  },

  updateZone: async (id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone> => {
    const res = await api.put(`/api/admin/delivery/zones/${id}`, data);
    return res.data;
  },

  assignAgent: async (orderId: string, agentId: string): Promise<DeliveryAgent> => {
    const res = await api.post("/api/admin/delivery/assign", {
      order_id: orderId,
      agent_id: agentId,
    });
    return res.data;
  },

  completeDelivery: async (agentId: string): Promise<DeliveryAgent> => {
    const res = await api.post(`/api/admin/delivery/complete/${agentId}`);
    return res.data;
  },
};
