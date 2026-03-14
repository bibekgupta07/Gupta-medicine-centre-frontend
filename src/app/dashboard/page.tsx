"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import StatsCard from "@/components/ui/StatsCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingCart,
  IndianRupee,
  Pill,
  Clock,
  FileText,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const PIE_COLORS = ["#fbbf24", "#3b82f6", "#6366f1", "#8b5cf6", "#22c55e", "#ef4444"];

// Match backend's actual response shape
interface DashboardData {
  stats: {
    total_users: number;
    total_medicines: number;
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    pending_prescriptions: number;
    low_stock_medicines: number;
    active_categories: number;
  };
  order_breakdown: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recent_activities: { type: string; message: string; timestamp: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setData(res);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!data) return <p className="text-center mt-20 text-gray-500">Failed to load dashboard</p>;

  const { stats, order_breakdown, recent_activities } = data;

  // Convert order_breakdown object to array for pie chart
  const orderStatusData = Object.entries(order_breakdown)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.total_users} icon={Users} color="blue" />
        <StatsCard title="Total Orders" value={stats.total_orders} icon={ShoppingCart} color="purple" />
        <StatsCard title="Revenue" value={formatCurrency(stats.total_revenue)} icon={IndianRupee} color="green" />
        <StatsCard title="Medicines" value={stats.total_medicines} icon={Pill} color="orange" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Orders" value={stats.pending_orders} icon={Clock} color="orange" />
        <StatsCard title="Pending Prescriptions" value={stats.pending_prescriptions} icon={FileText} color="blue" />
        <StatsCard title="Low Stock Items" value={stats.low_stock_medicines} icon={AlertTriangle} color="red" />
        <StatsCard title="Active Categories" value={stats.active_categories} icon={Layers} color="green" />
      </div>

      {orderStatusData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ status, count }: { status: string; count: number }) => `${status}: ${count}`}
              >
                {orderStatusData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {recent_activities && recent_activities.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recent_activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className={`badge mt-0.5 ${
                  activity.type === "order" ? "bg-blue-100 text-blue-800" :
                  activity.type === "user" ? "bg-green-100 text-green-800" :
                  "bg-purple-100 text-purple-800"
                }`}>
                  {activity.type}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
