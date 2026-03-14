"use client";

import { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventory.service";
import { MedicineBatch, Supplier } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Package, Users, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<MedicineBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"batches" | "suppliers" | "expiry">("batches");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [b, s, e] = await Promise.all([
        inventoryService.getBatches(),
        inventoryService.getSuppliers(),
        inventoryService.getExpiryAlerts(),
      ]);
      setBatches(Array.isArray(b) ? b : b.batches || []);
      setSuppliers(Array.isArray(s) ? s : s.suppliers || []);
      setExpiryAlerts(Array.isArray(e) ? e : e.alerts || e.batches || []);
    } catch { toast.error("Failed to load inventory data"); }
    finally { setLoading(false); }
  };

  const batchColumns = [
    { key: "medicine_name", label: "Medicine" },
    { key: "batch_number", label: "Batch #", render: (b: MedicineBatch) => <span className="font-mono text-xs">{b.batch_number}</span> },
    { key: "quantity", label: "Qty" },
    { key: "purchase_price", label: "Cost", render: (b: MedicineBatch) => formatCurrency(b.purchase_price) },
    { key: "manufacturing_date", label: "Mfg Date", render: (b: MedicineBatch) => formatDate(b.manufacturing_date) },
    { key: "expiry_date", label: "Expiry", render: (b: MedicineBatch) => {
      const isExpiring = new Date(b.expiry_date) < new Date(Date.now() + 90 * 86400000);
      return <span className={isExpiring ? "text-red-600 font-medium" : ""}>{formatDate(b.expiry_date)}</span>;
    }},
  ];

  const supplierColumns = [
    { key: "name", label: "Name" },
    { key: "contact_person", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "is_active", label: "Status", render: (s: Supplier) => <Badge status={s.is_active ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab("batches")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "batches" ? "bg-primary-700 text-white" : "bg-gray-100"}`}><Package size={16} /> Batches</button>
        <button onClick={() => setTab("suppliers")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "suppliers" ? "bg-primary-700 text-white" : "bg-gray-100"}`}><Users size={16} /> Suppliers</button>
        <button onClick={() => setTab("expiry")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "expiry" ? "bg-red-600 text-white" : "bg-gray-100"}`}><AlertTriangle size={16} /> Expiry Alerts ({expiryAlerts.length})</button>
      </div>
      {tab === "batches" && <DataTable columns={batchColumns} data={batches} loading={loading} />}
      {tab === "suppliers" && <DataTable columns={supplierColumns} data={suppliers} loading={loading} />}
      {tab === "expiry" && <DataTable columns={batchColumns} data={expiryAlerts} loading={loading} emptyMessage="No expiry alerts" />}
    </div>
  );
}
