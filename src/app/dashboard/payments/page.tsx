"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { Payment } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { loadData(); }, [statusFilter]);

  const loadData = async () => {
    try {
      const data = await paymentService.getAll({ status: statusFilter || undefined });
      setPayments(Array.isArray(data) ? data : data.payments || data.items || []);
    } catch { toast.error("Failed to load payments"); }
    finally { setLoading(false); }
  };

  const handleRefund = async (id: string) => {
    const reason = prompt("Refund reason:");
    if (!reason) return;
    try {
      await paymentService.refund(id, { reason });
      toast.success("Refund processed");
      loadData();
    } catch { toast.error("Refund failed"); }
  };

  const columns = [
    { key: "id", label: "Payment ID", render: (p: Payment) => <span className="font-mono text-xs">{p.id.slice(-8)}</span> },
    { key: "order_id", label: "Order", render: (p: Payment) => <span className="font-mono text-xs">{p.order_id.slice(-8)}</span> },
    { key: "amount", label: "Amount", render: (p: Payment) => <span className="font-medium">{formatCurrency(p.amount)}</span> },
    { key: "payment_method", label: "Method", render: (p: Payment) => <span className="capitalize">{p.payment_method}</span> },
    { key: "status", label: "Status", render: (p: Payment) => <Badge status={p.status} /> },
    { key: "transaction_id", label: "Txn ID", render: (p: Payment) => p.transaction_id || "-" },
    { key: "created_at", label: "Date", render: (p: Payment) => <span className="text-xs text-gray-500">{formatDateTime(p.created_at)}</span> },
    { key: "actions", label: "", render: (p: Payment) => p.status === "completed" ? (
      <button onClick={() => handleRefund(p.id)} className="text-xs text-orange-600 hover:underline">Refund</button>
    ) : null },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>
      <DataTable columns={columns} data={payments} loading={loading} />
    </div>
  );
}
