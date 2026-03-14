"use client";

import { useEffect, useState } from "react";
import { deliveryService } from "@/services/delivery.service";
import { DeliveryAgent, DeliveryZone } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Plus, Truck, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryPage() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"agents" | "zones">("agents");
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [a, z] = await Promise.all([deliveryService.getAgents(), deliveryService.getZones()]);
      setAgents(Array.isArray(a) ? a : []);
      setZones(Array.isArray(z) ? z : []);
    } catch { toast.error("Failed to load delivery data"); }
    finally { setLoading(false); }
  };

  const agentColumns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "vehicle_type", label: "Vehicle", render: (a: DeliveryAgent) => <span className="capitalize">{a.vehicle_type}</span> },
    { key: "is_available", label: "Available", render: (a: DeliveryAgent) => <Badge status={a.is_available ? "active" : "inactive"} /> },
    { key: "total_deliveries", label: "Deliveries" },
    { key: "rating", label: "Rating", render: (a: DeliveryAgent) => `${a.rating}/5` },
  ];

  const zoneColumns = [
    { key: "name", label: "Zone Name" },
    { key: "base_charge", label: "Base Charge", render: (z: DeliveryZone) => `Rs. ${z.base_charge}` },
    { key: "per_km_charge", label: "Per km", render: (z: DeliveryZone) => `Rs. ${z.per_km_charge}` },
    { key: "min_order_free_delivery", label: "Free Above", render: (z: DeliveryZone) => `Rs. ${z.min_order_free_delivery}` },
    { key: "estimated_time_minutes", label: "Est. Time", render: (z: DeliveryZone) => `${z.estimated_time_minutes} min` },
    { key: "is_active", label: "Status", render: (z: DeliveryZone) => <Badge status={z.is_active ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Management</h2>
        <button onClick={() => tab === "agents" ? setShowAgentModal(true) : setShowZoneModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add {tab === "agents" ? "Agent" : "Zone"}
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("agents")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "agents" ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-700"}`}>
          <Truck size={16} /> Agents ({agents.length})
        </button>
        <button onClick={() => setTab("zones")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "zones" ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-700"}`}>
          <MapPin size={16} /> Zones ({zones.length})
        </button>
      </div>

      {tab === "agents" ? (
        <DataTable columns={agentColumns} data={agents} loading={loading} emptyMessage="No delivery agents" />
      ) : (
        <DataTable columns={zoneColumns} data={zones} loading={loading} emptyMessage="No delivery zones" />
      )}

      <Modal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} title="Add Delivery Agent">
        <AgentForm onSuccess={() => { setShowAgentModal(false); loadData(); }} />
      </Modal>
      <Modal isOpen={showZoneModal} onClose={() => setShowZoneModal(false)} title="Add Delivery Zone">
        <ZoneForm onSuccess={() => { setShowZoneModal(false); loadData(); }} />
      </Modal>
    </div>
  );
}

function AgentForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle_type: "bike", vehicle_number: "" });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await deliveryService.createAgent(form); toast.success("Agent added"); onSuccess(); }
    catch { toast.error("Failed"); } finally { setLoading(false); }
  };
  const u = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={(e) => u("name", e.target.value)} className="input-field" required /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input value={form.phone} onChange={(e) => u("phone", e.target.value)} className="input-field" required /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={(e) => u("email", e.target.value)} className="input-field" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label><select value={form.vehicle_type} onChange={(e) => u("vehicle_type", e.target.value)} className="input-field"><option value="bike">Bike</option><option value="scooter">Scooter</option><option value="car">Car</option><option value="van">Van</option></select></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label><input value={form.vehicle_number} onChange={(e) => u("vehicle_number", e.target.value)} className="input-field" /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? "Saving..." : "Add Agent"}</button>
    </form>
  );
}

function ZoneForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", base_charge: "50", per_km_charge: "10", min_order_free_delivery: "500", estimated_time_minutes: "30" });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await deliveryService.createZone({ ...form, base_charge: Number(form.base_charge), per_km_charge: Number(form.per_km_charge), min_order_free_delivery: Number(form.min_order_free_delivery), estimated_time_minutes: Number(form.estimated_time_minutes) }); toast.success("Zone added"); onSuccess(); }
    catch { toast.error("Failed"); } finally { setLoading(false); }
  };
  const u = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label><input value={form.name} onChange={(e) => u("name", e.target.value)} className="input-field" required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Base Charge</label><input type="number" value={form.base_charge} onChange={(e) => u("base_charge", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Per km Charge</label><input type="number" value={form.per_km_charge} onChange={(e) => u("per_km_charge", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above</label><input type="number" value={form.min_order_free_delivery} onChange={(e) => u("min_order_free_delivery", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Time (min)</label><input type="number" value={form.estimated_time_minutes} onChange={(e) => u("estimated_time_minutes", e.target.value)} className="input-field" /></div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? "Saving..." : "Add Zone"}</button>
    </form>
  );
}
