"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { User } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll({ search: search || undefined, role: roleFilter || undefined });
      setUsers(Array.isArray(data) ? data : data.users || data.items || []);
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
        <div>
          <p className="font-medium text-gray-900">{u.full_name}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    { key: "phone", label: "Phone" },
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
      render: (u: User) => u.city ? `${u.city}, ${u.state || ""}` : "-",
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
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="input-field pl-10"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-48">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="delivery">Delivery</option>
          <option value="finance">Finance</option>
        </select>
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" />
    </div>
  );
}
