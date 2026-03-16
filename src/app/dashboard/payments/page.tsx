"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { Payment } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refundModal, setRefundModal] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAll({ page, page_size: 20, status: statusFilter || undefined });
      setPayments(data.payments);
      setTotalPages(Math.ceil((data.total || data.payments.length) / 20));
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModal || !refundReason.trim()) {
      toast.error("Please provide a refund reason");
      return;
    }
    setRefundLoading(true);
    try {
      await paymentService.refund(refundModal.id, refundReason);
      toast.success("Refund processed");
      setRefundModal(null);
      setRefundReason("");
      loadData();
    } catch {
      toast.error("Refund failed");
    } finally {
      setRefundLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Payment ID",
      render: (p: Payment) => <span className="font-mono text-xs">{p.id.slice(-8)}</span>,
    },
    {
      key: "order_id",
      label: "Order",
      render: (p: Payment) => <span className="font-mono text-xs">{p.order_id.slice(-8)}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      render: (p: Payment) => <span className="font-medium">{formatCurrency(p.amount)}</span>,
    },
    {
      key: "payment_method",
      label: "Method",
      render: (p: Payment) => <span className="capitalize font-medium">{p.payment_method}</span>,
    },
    { key: "status", label: "Status", render: (p: Payment) => <Badge status={p.status} /> },
    {
      key: "transaction_id",
      label: "Txn ID",
      render: (p: Payment) =>
        p.transaction_id ? (
          <span className="font-mono text-xs">{p.transaction_id}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (p: Payment) => <span className="text-xs text-gray-500">{formatDateTime(p.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (p: Payment) =>
        p.status === "completed" ? (
          <button
            onClick={() => setRefundModal(p)}
            className="text-xs text-orange-600 hover:underline font-medium"
          >
            Refund
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payments</h2>

      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="input-field w-48"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>

      <DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payments" />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={!!refundModal}
        onClose={() => { setRefundModal(null); setRefundReason(""); }}
        title="Process Refund"
      >
        {refundModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>Payment: <span className="font-mono">{refundModal.id.slice(-8)}</span></p>
              <p>Amount: <span className="font-bold">{formatCurrency(refundModal.amount)}</span></p>
              <p>Method: <span className="capitalize">{refundModal.payment_method}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Explain why this refund is being processed..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefund}
                disabled={refundLoading || !refundReason.trim()}
                className="btn-danger flex-1 disabled:opacity-50"
              >
                {refundLoading ? "Processing..." : `Refund ${formatCurrency(refundModal.amount)}`}
              </button>
              <button
                onClick={() => { setRefundModal(null); setRefundReason(""); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
