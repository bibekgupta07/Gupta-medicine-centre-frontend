"use client";

import { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventory.service";
import { MedicineBatch, Supplier, PurchaseOrder } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Package, Users, AlertTriangle, ClipboardList, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "batches" | "suppliers" | "expiry" | "purchase-orders";

export default function InventoryPage() {
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<MedicineBatch[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("batches");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [b, s, e, po] = await Promise.allSettled([
        inventoryService.getBatches(),
        inventoryService.getSuppliers(),
        inventoryService.getExpiryAlerts(),
        inventoryService.getPurchaseOrders(),
      ]);
      if (b.status === "fulfilled") setBatches(b.value.batches);
      if (s.status === "fulfilled") setSuppliers(s.value.suppliers);
      if (e.status === "fulfilled") setExpiryAlerts(e.value);
      if (po.status === "fulfilled") setPurchaseOrders(po.value.purchase_orders);
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const batchColumns = [
    { key: "medicine_name", label: "Medicine" },
    {
      key: "batch_number",
      label: "Batch #",
      render: (b: MedicineBatch) => <span className="font-mono text-xs">{b.batch_number}</span>,
    },
    { key: "quantity", label: "Qty" },
    {
      key: "purchase_price",
      label: "Cost",
      render: (b: MedicineBatch) => formatCurrency(b.purchase_price),
    },
    {
      key: "manufacturing_date",
      label: "Mfg Date",
      render: (b: MedicineBatch) => formatDate(b.manufacturing_date),
    },
    {
      key: "expiry_date",
      label: "Expiry",
      render: (b: MedicineBatch) => {
        const daysUntil = Math.ceil(
          (new Date(b.expiry_date).getTime() - Date.now()) / 86400000
        );
        const isExpiring = daysUntil < 90;
        const isExpired = daysUntil < 0;
        return (
          <span
            className={
              isExpired
                ? "text-red-700 font-bold"
                : isExpiring
                ? "text-red-600 font-medium"
                : ""
            }
          >
            {formatDate(b.expiry_date)}
            {isExpired && " (EXPIRED)"}
            {!isExpired && isExpiring && ` (${daysUntil}d)`}
          </span>
        );
      },
    },
  ];

  const supplierColumns = [
    { key: "name", label: "Name", render: (s: Supplier) => <span className="font-medium">{s.name}</span> },
    { key: "contact_person", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email", render: (s: Supplier) => s.email || "-" },
    { key: "address", label: "Address", render: (s: Supplier) => s.address ? <span className="text-xs truncate max-w-[200px] block">{s.address}</span> : "-" },
    {
      key: "is_active",
      label: "Status",
      render: (s: Supplier) => <Badge status={s.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      label: "",
      render: (s: Supplier) => (
        <button
          onClick={() => { setEditingSupplier(s); setShowSupplierModal(true); }}
          className="p-1.5 rounded hover:bg-gray-100"
        >
          <Edit2 size={16} className="text-blue-600" />
        </button>
      ),
    },
  ];

  const poColumns = [
    {
      key: "id",
      label: "PO ID",
      render: (po: PurchaseOrder) => <span className="font-mono text-xs">{po.id.slice(-8)}</span>,
    },
    { key: "supplier_name", label: "Supplier", render: (po: PurchaseOrder) => po.supplier_name || po.supplier_id.slice(-8) },
    {
      key: "items",
      label: "Items",
      render: (po: PurchaseOrder) => `${po.items?.length || 0} items`,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (po: PurchaseOrder) => <span className="font-medium">{formatCurrency(po.total_amount)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (po: PurchaseOrder) => <Badge status={po.status} />,
    },
    {
      key: "created_at",
      label: "Date",
      render: (po: PurchaseOrder) => <span className="text-xs text-gray-500">{formatDate(po.created_at)}</span>,
    },
  ];

  const tabs = [
    { key: "batches" as const, label: "Batches", icon: Package, count: batches.length },
    { key: "suppliers" as const, label: "Suppliers", icon: Users, count: suppliers.length },
    { key: "purchase-orders" as const, label: "Purchase Orders", icon: ClipboardList, count: purchaseOrders.length },
    { key: "expiry" as const, label: "Expiry Alerts", icon: AlertTriangle, count: expiryAlerts.length, danger: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        {(tab === "batches" || tab === "suppliers") && (
          <button
            onClick={() =>
              tab === "batches" ? setShowBatchModal(true) : (() => { setEditingSupplier(null); setShowSupplierModal(true); })()
            }
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add {tab === "batches" ? "Batch" : "Supplier"}
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? t.danger
                  ? "bg-red-600 text-white"
                  : "bg-primary-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <t.icon size={16} /> {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "batches" && (
        <DataTable columns={batchColumns} data={batches} loading={loading} emptyMessage="No batches recorded" />
      )}
      {tab === "suppliers" && (
        <DataTable columns={supplierColumns} data={suppliers} loading={loading} emptyMessage="No suppliers" />
      )}
      {tab === "purchase-orders" && (
        <DataTable columns={poColumns} data={purchaseOrders} loading={loading} emptyMessage="No purchase orders" />
      )}
      {tab === "expiry" && (
        <DataTable columns={batchColumns} data={expiryAlerts} loading={loading} emptyMessage="No expiry alerts - all good!" />
      )}

      {/* Batch Modal */}
      <Modal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)} title="Add Batch" size="lg">
        <BatchForm
          onSuccess={() => {
            setShowBatchModal(false);
            loadData();
          }}
        />
      </Modal>

      {/* Supplier Modal */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => { setShowSupplierModal(false); setEditingSupplier(null); }}
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
      >
        <SupplierForm
          supplier={editingSupplier}
          onSuccess={() => {
            setShowSupplierModal(false);
            setEditingSupplier(null);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}

function BatchForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    medicine_id: "",
    batch_number: "",
    quantity: "",
    manufacturing_date: "",
    expiry_date: "",
    purchase_price: "",
    barcode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryService.createBatch({
        medicine_id: form.medicine_id,
        batch_number: form.batch_number,
        quantity: parseInt(form.quantity),
        manufacturing_date: form.manufacturing_date,
        expiry_date: form.expiry_date,
        purchase_price: parseFloat(form.purchase_price),
        barcode: form.barcode || undefined,
      });
      toast.success("Batch added");
      onSuccess();
    } catch {
      toast.error("Failed to add batch");
    } finally {
      setLoading(false);
    }
  };

  const u = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine ID *</label>
        <input value={form.medicine_id} onChange={(e) => u("medicine_id", e.target.value)} className="input-field" required placeholder="Medicine ID" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
          <input value={form.batch_number} onChange={(e) => u("batch_number", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input type="number" value={form.quantity} onChange={(e) => u("quantity", e.target.value)} className="input-field" required min="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
          <input type="number" value={form.purchase_price} onChange={(e) => u("purchase_price", e.target.value)} className="input-field" required step="0.01" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
          <input value={form.barcode} onChange={(e) => u("barcode", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mfg Date *</label>
          <input type="date" value={form.manufacturing_date} onChange={(e) => u("manufacturing_date", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
          <input type="date" value={form.expiry_date} onChange={(e) => u("expiry_date", e.target.value)} className="input-field" required />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : "Add Batch"}
      </button>
    </form>
  );
}

function SupplierForm({ supplier, onSuccess }: { supplier: Supplier | null; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: supplier?.name || "",
    contact_person: supplier?.contact_person || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        contact_person: form.contact_person,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
      };
      if (supplier) {
        await inventoryService.updateSupplier(supplier.id, payload);
        toast.success("Supplier updated");
      } else {
        await inventoryService.createSupplier(payload);
        toast.success("Supplier added");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  const u = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input value={form.name} onChange={(e) => u("name", e.target.value)} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
        <input value={form.contact_person} onChange={(e) => u("contact_person", e.target.value)} className="input-field" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input value={form.phone} onChange={(e) => u("phone", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={form.email} onChange={(e) => u("email", e.target.value)} className="input-field" type="email" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea value={form.address} onChange={(e) => u("address", e.target.value)} className="input-field" rows={2} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : supplier ? "Update Supplier" : "Add Supplier"}
      </button>
    </form>
  );
}
