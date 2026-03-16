"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { User } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { Search, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLES = [
  { value: "", label: "All Roles" },
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "delivery", label: "Delivery" },
  { value: "finance", label: "Finance" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll({
        page,
        page_size: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.users);
      setTotalPages(Math.ceil((data.total || data.users.length) / 20));
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleStatus(user.id, !user.is_active);
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`);
      loadUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "User",
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-medium text-primary-800">{u.full_name?.charAt(0) || "?"}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.full_name}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (u: User) => u.phone || "-" },
    {
      key: "role",
      label: "Role",
      render: (u: User) => (
        <span className="badge bg-blue-100 text-blue-800 capitalize">{u.role}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (u: User) => <Badge status={u.is_active ? "active" : "inactive"} />,
    },
    {
      key: "city",
      label: "Location",
      render: (u: User) => u.city ? `${u.city}${u.state ? `, ${u.state}` : ""}` : "-",
    },
    {
      key: "created_at",
      label: "Joined",
      render: (u: User) => <span className="text-gray-500 text-xs">{formatDate(u.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => setEditingUser(u)}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Edit user"
          >
            <Edit2 size={16} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleToggleStatus(u)}
            className="p-1.5 rounded hover:bg-gray-100"
            title={u.is_active ? "Deactivate" : "Activate"}
          >
            {u.is_active ? (
              <ToggleRight size={20} className="text-green-600" />
            ) : (
              <ToggleLeft size={20} className="text-gray-400" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); loadUsers(); } }}
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field w-48"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        {editingUser && (
          <UserEditForm
            user={editingUser}
            onSuccess={() => { setEditingUser(null); loadUsers(); }}
          />
        )}
      </Modal>
    </div>
  );
}

function UserEditForm({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user.full_name,
    phone: user.phone || "",
    role: user.role,
    is_active: user.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.update(user.id, form);
      toast.success("User updated");
      onSuccess();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })}
          className="input-field"
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="delivery">Delivery</option>
          <option value="finance">Finance</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="user-active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="user-active" className="text-sm text-gray-700">Active</label>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : "Update User"}
      </button>
    </form>
  );
}
