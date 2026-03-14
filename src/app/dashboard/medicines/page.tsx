"use client";

import { useEffect, useState } from "react";
import { medicineService } from "@/services/medicine.service";
import { Medicine, Category } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [medsData, catsData] = await Promise.all([
        medicineService.getAll(),
        medicineService.getCategories(),
      ]);
      setMedicines(Array.isArray(medsData) ? medsData : medsData.medicines || medsData.items || []);
      setCategories(Array.isArray(catsData) ? catsData : catsData.categories || []);
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await medicineService.delete(id);
      toast.success("Medicine deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || m.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const columns = [
    {
      key: "name",
      label: "Medicine",
      render: (m: Medicine) => (
        <div>
          <p className="font-medium text-gray-900">{m.name}</p>
          <p className="text-xs text-gray-500">{m.generic_name || m.manufacturer}</p>
        </div>
      ),
    },
    { key: "category_name", label: "Category" },
    {
      key: "price",
      label: "Price",
      render: (m: Medicine) => (
        <div>
          <p className="font-medium">{formatCurrency(m.price)}</p>
          {m.discount_percentage > 0 && (
            <p className="text-xs text-green-600">-{m.discount_percentage}%</p>
          )}
        </div>
      ),
    },
    {
      key: "stock_quantity",
      label: "Stock",
      render: (m: Medicine) => (
        <span className={m.stock_quantity < 10 ? "text-red-600 font-medium" : ""}>
          {m.stock_quantity}
        </span>
      ),
    },
    {
      key: "requires_prescription",
      label: "Rx",
      render: (m: Medicine) => m.requires_prescription ? (
        <Badge status="required" />
      ) : (
        <span className="text-gray-400 text-xs">OTC</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (m: Medicine) => <Badge status={m.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (m: Medicine) => (
        <div className="flex gap-2">
          <button onClick={() => setEditingMedicine(m)} className="p-1.5 rounded hover:bg-gray-100">
            <Edit2 size={16} className="text-blue-600" />
          </button>
          <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-gray-100">
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Medicines</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No medicines found" />

      <Modal
        isOpen={showAddModal || !!editingMedicine}
        onClose={() => { setShowAddModal(false); setEditingMedicine(null); }}
        title={editingMedicine ? "Edit Medicine" : "Add Medicine"}
        size="lg"
      >
        <MedicineForm
          medicine={editingMedicine}
          categories={categories}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingMedicine(null);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}

function MedicineForm({
  medicine,
  categories,
  onSuccess,
}: {
  medicine: Medicine | null;
  categories: Category[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: medicine?.name || "",
    generic_name: medicine?.generic_name || "",
    manufacturer: medicine?.manufacturer || "",
    category_id: medicine?.category_id || "",
    description: medicine?.description || "",
    price: medicine?.price?.toString() || "",
    discount_percentage: medicine?.discount_percentage?.toString() || "0",
    stock_quantity: medicine?.stock_quantity?.toString() || "",
    requires_prescription: medicine?.requires_prescription || false,
    dosage_form: medicine?.dosage_form || "",
    strength: medicine?.strength || "",
    pack_size: medicine?.pack_size || "",
    side_effects: medicine?.side_effects || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        generic_name: form.generic_name || null,
        manufacturer: form.manufacturer || null,
        category_id: form.category_id,
        description: form.description || null,
        price: parseFloat(form.price),
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        requires_prescription: form.requires_prescription,
        dosage_form: form.dosage_form || null,
        strength: form.strength || null,
        pack_size: form.pack_size || null,
        side_effects: form.side_effects || null,
      };
      if (medicine) {
        await medicineService.update(medicine.id, payload);
        toast.success("Medicine updated");
      } else {
        await medicineService.create(payload);
        toast.success("Medicine added");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
          <input value={form.generic_name} onChange={(e) => update("generic_name", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer *</label>
          <input value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} className="input-field" required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
          <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
          <input type="number" value={form.discount_percentage} onChange={(e) => update("discount_percentage", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
          <input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
          <input value={form.dosage_form} onChange={(e) => update("dosage_form", e.target.value)} className="input-field" placeholder="e.g. Tablet, Syrup" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
          <input value={form.strength} onChange={(e) => update("strength", e.target.value)} className="input-field" placeholder="e.g. 500mg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size</label>
          <input value={form.pack_size} onChange={(e) => update("pack_size", e.target.value)} className="input-field" placeholder="e.g. 10 tablets" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects</label>
        <textarea value={form.side_effects} onChange={(e) => update("side_effects", e.target.value)} className="input-field" rows={2} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rx"
          checked={form.requires_prescription}
          onChange={(e) => update("requires_prescription", e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="rx" className="text-sm text-gray-700">Requires Prescription</label>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : medicine ? "Update Medicine" : "Add Medicine"}
      </button>
    </form>
  );
}
