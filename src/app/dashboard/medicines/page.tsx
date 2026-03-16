"use client";

import { useEffect, useState } from "react";
import { medicineService } from "@/services/medicine.service";
import { categoryService } from "@/services/category.service";
import { Medicine, Category } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

type Tab = "all" | "low-stock";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [lowStockMeds, setLowStockMeds] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showStockModal, setShowStockModal] = useState<Medicine | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, selectedCategory]);

  const loadCategories = async () => {
    try {
      const catsData = await categoryService.getAll();
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch {
      /* silent */
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [medsData, lowStock] = await Promise.allSettled([
        medicineService.getAll({
          page,
          page_size: 20,
          search: search || undefined,
          category_id: selectedCategory || undefined,
        }),
        medicineService.getLowStock(10),
      ]);

      if (medsData.status === "fulfilled") {
        setMedicines(medsData.value.medicines);
        setTotalPages(Math.ceil((medsData.value.total || medsData.value.medicines.length) / 20));
      }
      if (lowStock.status === "fulfilled") {
        setLowStockMeds(lowStock.value);
      }
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this medicine?")) return;
    try {
      await medicineService.delete(id);
      toast.success("Medicine deactivated");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStockUpdate = async (id: string, quantity: number) => {
    try {
      await medicineService.updateStock(id, quantity);
      toast.success("Stock updated");
      setShowStockModal(null);
      loadData();
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const displayMeds = tab === "low-stock" ? lowStockMeds : medicines;

  const columns = [
    {
      key: "name",
      label: "Medicine",
      render: (m: Medicine) => (
        <div className="flex items-center gap-3">
          {m.image ? (
            <img
              src={m.image.startsWith("http") ? m.image : `${process.env.NEXT_PUBLIC_API_URL}${m.image}`}
              alt={m.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package size={16} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{m.name}</p>
            <p className="text-xs text-gray-500">{m.generic_name || m.manufacturer}</p>
          </div>
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
        <button
          onClick={() => setShowStockModal(m)}
          className={`font-medium px-2 py-1 rounded hover:bg-gray-100 ${
            m.stock_quantity < 10
              ? "text-red-600"
              : m.stock_quantity < 50
              ? "text-orange-600"
              : "text-gray-900"
          }`}
        >
          {m.stock_quantity}
          {m.stock_quantity < 10 && <AlertTriangle size={12} className="inline ml-1" />}
        </button>
      ),
    },
    {
      key: "requires_prescription",
      label: "Rx",
      render: (m: Medicine) =>
        m.requires_prescription ? (
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

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "all" ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          <Package size={16} /> All Medicines
        </button>
        <button
          onClick={() => setTab("low-stock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "low-stock" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          <AlertTriangle size={16} /> Low Stock ({lowStockMeds.length})
        </button>
      </div>

      {tab === "all" && (
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="input-field w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <DataTable columns={columns} data={displayMeds} loading={loading} emptyMessage="No medicines found" />

      {tab === "all" && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Add/Edit Modal */}
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

      {/* Stock Update Modal */}
      <Modal
        isOpen={!!showStockModal}
        onClose={() => setShowStockModal(null)}
        title={`Update Stock: ${showStockModal?.name}`}
        size="sm"
      >
        {showStockModal && (
          <StockForm
            medicine={showStockModal}
            onSubmit={(qty) => handleStockUpdate(showStockModal.id, qty)}
          />
        )}
      </Modal>
    </div>
  );
}

function StockForm({ medicine, onSubmit }: { medicine: Medicine; onSubmit: (qty: number) => void }) {
  const [quantity, setQuantity] = useState(medicine.stock_quantity.toString());

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Current stock: <span className="font-bold">{medicine.stock_quantity}</span></p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="input-field"
          min="0"
        />
      </div>
      <button onClick={() => onSubmit(parseInt(quantity))} className="btn-primary w-full">
        Update Stock
      </button>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    medicine?.image
      ? medicine.image.startsWith("http")
        ? medicine.image
        : `${process.env.NEXT_PUBLIC_API_URL}${medicine.image}`
      : ""
  );
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = medicine?.image || undefined;

      // Upload image if new file selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        try {
          const uploadRes = await api.post("/api/admin/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          imageUrl = uploadRes.data.url || uploadRes.data.file_url || uploadRes.data.path;
        } catch {
          // If upload endpoint doesn't exist, continue without image
          console.warn("Image upload endpoint not available");
        }
      }

      const payload = {
        name: form.name,
        generic_name: form.generic_name || undefined,
        manufacturer: form.manufacturer || "",
        category_id: form.category_id,
        description: form.description || undefined,
        price: parseFloat(form.price),
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        requires_prescription: form.requires_prescription,
        dosage_form: form.dosage_form || undefined,
        strength: form.strength || undefined,
        pack_size: form.pack_size || undefined,
        side_effects: form.side_effects || undefined,
        ...(imageUrl && { image: imageUrl }),
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Image</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center border">
              <Package size={24} className="text-gray-400" />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>

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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
          <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className="input-field" required />
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
