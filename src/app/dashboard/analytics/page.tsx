"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import StatsCard from "@/components/ui/StatsCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface AnalyticsData {
  revenue_summary?: { total_revenue: number; total_orders: number; average_order_value: number; period_revenue: { period: string; revenue: number; orders: number }[] };
  top_medicines?: { name: string; sold: number; revenue: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [revRes, topRes] = await Promise.all([
        api.get("/api/admin/analytics/revenue-summary").catch(() => ({ data: null })),
        api.get("/api/admin/analytics/top-medicines").catch(() => ({ data: null })),
      ]);
      setData({ revenue_summary: revRes.data, top_medicines: Array.isArray(topRes.data) ? topRes.data : topRes.data?.medicines || [] });
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  const rev = data.revenue_summary;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      {rev && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard title="Total Revenue" value={formatCurrency(rev.total_revenue)} icon={DollarSign} color="green" />
            <StatsCard title="Total Orders" value={rev.total_orders} icon={ShoppingCart} color="blue" />
            <StatsCard title="Avg Order Value" value={formatCurrency(rev.average_order_value)} icon={TrendingUp} color="purple" />
          </div>

          {rev.period_revenue && rev.period_revenue.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={rev.period_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {data.top_medicines && data.top_medicines.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Selling Medicines</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.top_medicines} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Bar dataKey="sold" fill="#2e7d32" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
