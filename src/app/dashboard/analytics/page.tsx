"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analytics.service";
import { RevenueSummary, DailySalesReport, DrugInteraction } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import StatsCard from "@/components/ui/StatsCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileText,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

type Tab = "overview" | "sales" | "interactions";
const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [reports, setReports] = useState<DailySalesReport[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revData, reportsData, interData] = await Promise.allSettled([
        analyticsService.getRevenue(days),
        analyticsService.getSalesReports(days),
        analyticsService.getInteractions(),
      ]);

      if (revData.status === "fulfilled") setRevenue(revData.value);
      if (reportsData.status === "fulfilled") {
        const r = reportsData.value;
        setReports(Array.isArray(r) ? r : r.reports || []);
      }
      if (interData.status === "fulfilled") setInteractions(interData.value);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await analyticsService.generateDailyReport();
      toast.success("Daily report generated successfully");
      loadData();
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input-field w-40"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last Year</option>
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} className={generatingReport ? "animate-spin" : ""} />
            {generatingReport ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {(
          [
            { key: "overview", label: "Revenue Overview", icon: DollarSign },
            { key: "sales", label: "Sales Reports", icon: FileText },
            { key: "interactions", label: "Drug Interactions", icon: AlertTriangle },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-primary-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Revenue Overview Tab */}
      {tab === "overview" && (
        <RevenueOverview revenue={revenue} />
      )}

      {/* Sales Reports Tab */}
      {tab === "sales" && (
        <SalesReportsTab reports={reports} />
      )}

      {/* Drug Interactions Tab */}
      {tab === "interactions" && (
        <InteractionsTab
          interactions={interactions}
          onAdd={() => setShowInteractionModal(true)}
          onReload={loadData}
        />
      )}

      <Modal
        isOpen={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        title="Add Drug Interaction"
        size="lg"
      >
        <InteractionForm
          onSuccess={() => {
            setShowInteractionModal(false);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}

// --- Revenue Overview ---
function RevenueOverview({ revenue }: { revenue: RevenueSummary | null }) {
  if (!revenue) {
    return (
      <div className="text-center py-12 text-gray-500">
        <DollarSign size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No revenue data available yet.</p>
        <p className="text-sm mt-1">Generate a report to see analytics.</p>
      </div>
    );
  }

  const paymentData = Object.entries(revenue.payment_method_breakdown || {}).map(
    ([method, amount]) => ({ name: method, value: amount })
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(revenue.total_revenue)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Total Orders"
          value={revenue.total_orders}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(revenue.average_order_value)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Daily Revenue Chart */}
      {revenue.daily_revenue && revenue.daily_revenue.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenue.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(d) => formatDate(d)}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        {revenue.top_selling_medicines && revenue.top_selling_medicines.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Selling Medicines</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue.top_selling_medicines.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="#2e7d32" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Method Breakdown */}
        {paymentData.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sales Reports ---
function SalesReportsTab({ reports }: { reports: DailySalesReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No sales reports generated yet.</p>
        <p className="text-sm mt-1">Click &quot;Generate Report&quot; to create today&apos;s report.</p>
      </div>
    );
  }

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (r: DailySalesReport) => (
        <span className="font-medium">{formatDate(r.date)}</span>
      ),
    },
    { key: "total_orders", label: "Orders" },
    {
      key: "total_revenue",
      label: "Revenue",
      render: (r: DailySalesReport) => (
        <span className="font-medium text-green-700">{formatCurrency(r.total_revenue)}</span>
      ),
    },
    { key: "total_items_sold", label: "Items Sold" },
    { key: "new_users", label: "New Users" },
    {
      key: "average_order_value",
      label: "Avg Order",
      render: (r: DailySalesReport) => formatCurrency(r.average_order_value),
    },
  ];

  return <DataTable columns={columns} data={reports} emptyMessage="No reports" />;
}

// --- Drug Interactions ---
function InteractionsTab({
  interactions,
  onAdd,
}: {
  interactions: DrugInteraction[];
  onAdd: () => void;
  onReload: () => void;
}) {
  const severityColors: Record<string, string> = {
    mild: "bg-yellow-100 text-yellow-800",
    moderate: "bg-orange-100 text-orange-800",
    severe: "bg-red-100 text-red-800",
    contraindicated: "bg-red-200 text-red-900",
  };

  const columns = [
    {
      key: "medicine_a_name",
      label: "Medicine A",
      render: (i: DrugInteraction) => (
        <span className="font-medium">{i.medicine_a_name}</span>
      ),
    },
    {
      key: "medicine_b_name",
      label: "Medicine B",
      render: (i: DrugInteraction) => (
        <span className="font-medium">{i.medicine_b_name}</span>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (i: DrugInteraction) => (
        <Badge
          status={i.severity}
          className={severityColors[i.severity] || ""}
        />
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (i: DrugInteraction) => (
        <span className="text-sm text-gray-600 truncate block max-w-[300px]">
          {i.description}
        </span>
      ),
    },
    {
      key: "recommendation",
      label: "Recommendation",
      render: (i: DrugInteraction) => (
        <span className="text-sm text-gray-600 truncate block max-w-[200px]">
          {i.recommendation}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Interaction
        </button>
      </div>
      <DataTable
        columns={columns}
        data={interactions}
        emptyMessage="No drug interactions recorded"
      />
    </div>
  );
}

// --- Interaction Form ---
function InteractionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    medicine_a_name: "",
    medicine_b_name: "",
    severity: "mild",
    description: "",
    recommendation: "",
    source: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await analyticsService.createInteraction(form);
      toast.success("Drug interaction added");
      onSuccess();
    } catch {
      toast.error("Failed to add interaction");
    } finally {
      setLoading(false);
    }
  };

  const u = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine A *</label>
          <input
            value={form.medicine_a_name}
            onChange={(e) => u("medicine_a_name", e.target.value)}
            className="input-field"
            required
            placeholder="e.g. Aspirin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine B *</label>
          <input
            value={form.medicine_b_name}
            onChange={(e) => u("medicine_b_name", e.target.value)}
            className="input-field"
            required
            placeholder="e.g. Warfarin"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
        <select
          value={form.severity}
          onChange={(e) => u("severity", e.target.value)}
          className="input-field"
        >
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
          <option value="contraindicated">Contraindicated</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => u("description", e.target.value)}
          className="input-field"
          rows={3}
          required
          placeholder="Describe the interaction..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation *</label>
        <textarea
          value={form.recommendation}
          onChange={(e) => u("recommendation", e.target.value)}
          className="input-field"
          rows={2}
          required
          placeholder="What should be done..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
        <input
          value={form.source}
          onChange={(e) => u("source", e.target.value)}
          className="input-field"
          placeholder="e.g. FDA, DrugBank"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Saving..." : "Add Interaction"}
      </button>
    </form>
  );
}
