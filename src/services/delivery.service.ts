import api from "@/lib/api";
import { DeliveryAgent, DeliveryZone } from "@/types";

export const deliveryService = {
  getAgents: async (): Promise<DeliveryAgent[]> => {
    const res = await api.get("/api/admin/delivery/agents/");
    return res.data;
  },

  createAgent: async (data: Partial<DeliveryAgent>): Promise<DeliveryAgent> => {
    const res = await api.post("/api/admin/delivery/agents/", data);
    return res.data;
  },

  updateAgent: async (id: string, data: Partial<DeliveryAgent>): Promise<DeliveryAgent> => {
    const res = await api.put(`/api/admin/delivery/agents/${id}`, data);
    return res.data;
  },

  getZones: async (): Promise<DeliveryZone[]> => {
    const res = await api.get("/api/admin/delivery/zones/");
    return res.data;
  },

  createZone: async (data: Partial<DeliveryZone>): Promise<DeliveryZone> => {
    const res = await api.post("/api/admin/delivery/zones/", data);
    return res.data;
  },

  assignAgent: async (orderId: string, agentId: string) => {
    const res = await api.post(`/api/admin/delivery/assign`, { order_id: orderId, agent_id: agentId });
    return res.data;
  },
};
