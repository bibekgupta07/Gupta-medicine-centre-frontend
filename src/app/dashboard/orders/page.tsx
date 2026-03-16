"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { Order } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

const STATUS_BUTTON_LABEL: Record<string, string> = {
  pending: "Confirm",
  confirmed: "Process",
  processing: "Ship",
  shipped: "Deliver",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll({
        page,
        page_size: 20,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setOrders(data.orders);
      setTotalPages(Math.ceil((data.total || data.orders.length) / 20));
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order ${newStatus}`);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] });
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      key: "order_number",
      label: "Order #",
      render: (o: Order) => <span className="font-mono text-xs">{o.order_number || o.id.slice(-8)}</span>,
    },
    {
      key: "user_name",
      label: "Customer",
      render: (o: Order) => (
        <div>
          <p className="font-medium text-sm">{o.user_name || "Unknown"}</p>
          {o.user_email && <p className="text-xs text-gray-500">{o.user_email}</p>}
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (o: Order) => <span>{o.items?.length || 0} items</span>,
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (o: Order) => <span className="font-medium">{formatCurrency(o.total_amount)}</span>,
    },
    { key: "status", label: "Status", render: (o: Order) => <Badge status={o.status} /> },
    {
      key: "created_at",
      label: "Date",
      render: (o: Order) => <span className="text-gray-500 text-xs">{formatDateTime(o.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (o: Order) => (
        <div className="flex gap-2">
          <button onClick={() => setSelectedOrder(o)} className="p-1.5 rounded hover:bg-gray-100">
            <Eye size={16} className="text-blue-600" />
          </button>
          {NEXT_STATUS[o.status] && (
            <button
              onClick={() => handleStatusUpdate(o.id, NEXT_STATUS[o.status])}
              className="text-xs btn-primary py-1 px-2"
            >
              {STATUS_BUTTON_LABEL[o.status]}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                loadOrders();
              }
            }}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-48"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders found" />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.order_number || `#${selectedOrder?.id.slice(-8)}`}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.user_name || "N/A"}</p>
                {selectedOrder.user_email && <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>}
                {selectedOrder.user_phone && <p className="text-sm text-gray-500">{selectedOrder.user_phone}</p>}
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge status={selectedOrder.status} />
                <p className="text-sm text-gray-500 mt-2">Payment: <span className="capitalize">{selectedOrder.payment_method}</span></p>
                <Badge status={selectedOrder.payment_status} className="mt-1" />
              </div>
            </div>

            {(selectedOrder.delivery_street || selectedOrder.delivery_city) && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {[selectedOrder.delivery_street, selectedOrder.delivery_landmark, selectedOrder.delivery_city, selectedOrder.delivery_state, selectedOrder.delivery_pincode].filter(Boolean).join(", ")}
                  {selectedOrder.delivery_phone && <span className="block text-gray-500 mt-1">Phone: {selectedOrder.delivery_phone}</span>}
                </p>
              </div>
            )}

            {selectedOrder.admin_notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                <p className="text-sm bg-yellow-50 p-2 rounded">{selectedOrder.admin_notes}</p>
              </div>
            )}

            {selectedOrder.cancellation_reason && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Cancellation Reason</p>
                <p className="text-sm bg-red-50 p-2 rounded text-red-700">{selectedOrder.cancellation_reason}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              <div className="border rounded-lg divide-y">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between p-3 text-sm">
                    <div>
                      <span className="font-medium">{item.medicine_name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      <span className="text-gray-400 ml-2">@ {formatCurrency(item.price)}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
              <div className="flex gap-2 pt-2">
                {NEXT_STATUS[selectedOrder.status] && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, NEXT_STATUS[selectedOrder.status])}
                    className="btn-primary flex-1"
                  >
                    {STATUS_BUTTON_LABEL[selectedOrder.status]}
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")}
                  className="btn-danger"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
