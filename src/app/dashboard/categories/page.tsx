"use client";

import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await categoryService.getAllAdmin();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this category?")) return;
    try {
      await categoryService.delete(id);
      toast.success("Category deactivated");
      loadData();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.update(category.id, { is_active: !category.is_active });
      toast.success(`Category ${category.is_active ? "deactivated" : "activated"}`);
      loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      key: "sort_order",
      label: "#",
      render: (c: Category) => (
        <span className="flex items-center gap-1 text-gray-400">
          <GripVertical size={14} />
          {c.sort_order}
        </span>
      ),
    },
    {
      key: "name",
      label: "Category",
      render: (c: Category) => (
        <div>
          <p className="font-medium text-gray-900">{c.name}</p>
          {c.description && (
            <p className="text-xs text-gray-500 truncate max-w-[300px]">{c.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "image",
      label: "Image",
      render: (c: Category) =>
        c.image ? (
          <img
            src={c.image.startsWith("http") ? c.image : `${process.env.NEXT_PUBLIC_API_URL}${c.image}`}
            alt={c.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <span className="text-gray-400 text-xs">No image</span>
        ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (c: Category) => (
        <button onClick={() => handleToggleStatus(c)}>
          <Badge status={c.is_active ? "active" : "inactive"} />
        </button>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (c: Category) => (
        <span className="text-xs text-gray-500">{formatDate(c.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (c: Category) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(c);
              setShowModal(true);
            }}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <Edit2 size={16} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage medicine categories. {categories.filter((c) => c.is_active).length} active of{" "}
            {categories.length} total.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} loading={loading} emptyMessage="No categories found" />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          category={editing}
          onSuccess={() => {
            setShowModal(false);
            setEditing(null);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({
  category,
  onSuccess,
}: {
  category: Category | null;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    image: category?.image || "",
    sort_order: category?.sort_order?.toString() || "0",
    is_active: category?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        image: form.image || undefined,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (category) {
        await categoryService.update(category.id, payload);
        toast.success("Category updated");
      } else {
        await categoryService.create(payload);
        toast.success("Category created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="input-field"
          required
          placeholder="e.g. Tablets, Syrups, First Aid"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="input-field"
          rows={3}
          placeholder="Brief description of this category"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          value={form.image}
          onChange={(e) => update("image", e.target.value)}
          className="input-field"
          placeholder="https://... or /uploads/..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => update("sort_order", e.target.value)}
            className="input-field"
            min="0"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}
