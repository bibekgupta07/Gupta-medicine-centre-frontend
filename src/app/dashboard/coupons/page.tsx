"use client";

import { useEffect, useState } from "react";
import { couponService } from "@/services/coupon.service";
import { Coupon } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await couponService.getAll();
      setCoupons(Array.isArray(data) ? data : data.coupons || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try { await couponService.delete(id); toast.success("Deleted"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  const columns = [
    { key: "code", label: "Code", render: (c: Coupon) => <span className="font-mono font-bold text-primary-700">{c.code}</span> },
    { key: "discount", label: "Discount", render: (c: Coupon) => c.discount_type === "percentage" ? `${c.discount_value}%` : formatCurrency(c.discount_value) },
    { key: "min_order_amount", label: "Min Order", render: (c: Coupon) => formatCurrency(c.min_order_amount) },
    { key: "usage", label: "Usage", render: (c: Coupon) => `${c.used_count}/${c.usage_limit}` },
    { key: "valid_until", label: "Expires", render: (c: Coupon) => formatDate(c.valid_until) },
    { key: "is_active", label: "Status", render: (c: Coupon) => <Badge status={c.is_active ? "active" : "inactive"} /> },
    { key: "actions", label: "Actions", render: (c: Coupon) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 rounded hover:bg-gray-100"><Edit2 size={16} className="text-blue-600" /></button>
        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={16} className="text-red-600" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Coupon</button>
      </div>
      <DataTable columns={columns} data={coupons} loading={loading} />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Coupon" : "Add Coupon"} size="md">
        <CouponForm coupon={editing} onSuccess={() => { setShowModal(false); loadData(); }} />
      </Modal>
    </div>
  );
}

function CouponForm({ coupon, onSuccess }: { coupon: Coupon | null; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: coupon?.code || "",
    description: coupon?.description || "",
    discount_type: coupon?.discount_type || "percentage",
    discount_value: coupon?.discount_value?.toString() || "",
    min_order_amount: coupon?.min_order_amount?.toString() || "0",
    max_discount: coupon?.max_discount?.toString() || "",
    usage_limit: coupon?.usage_limit?.toString() || "100",
    per_user_limit: coupon?.per_user_limit?.toString() || "1",
    valid_from: coupon?.valid_from?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    valid_until: coupon?.valid_until?.slice(0, 10) || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, discount_value: Number(form.discount_value), min_order_amount: Number(form.min_order_amount), max_discount: form.max_discount ? Number(form.max_discount) : undefined, usage_limit: Number(form.usage_limit), per_user_limit: Number(form.per_user_limit) };
      if (coupon) await couponService.update(coupon.id, payload);
      else await couponService.create(payload);
      toast.success(coupon ? "Updated" : "Created");
      onSuccess();
    } catch { toast.error("Failed to save"); }
    finally { setLoading(false); }
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} className="input-field" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.discount_type} onChange={(e) => update("discount_type", e.target.value)} className="input-field"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label><input type="number" value={form.discount_value} onChange={(e) => update("discount_value", e.target.value)} className="input-field" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label><input type="number" value={form.min_order_amount} onChange={(e) => update("min_order_amount", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label><input type="number" value={form.usage_limit} onChange={(e) => update("usage_limit", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label><input type="number" value={form.per_user_limit} onChange={(e) => update("per_user_limit", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label><input type="date" value={form.valid_from} onChange={(e) => update("valid_from", e.target.value)} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label><input type="date" value={form.valid_until} onChange={(e) => update("valid_until", e.target.value)} className="input-field" required /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field" rows={2} /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? "Saving..." : coupon ? "Update" : "Create"}</button>
    </form>
  );
}
