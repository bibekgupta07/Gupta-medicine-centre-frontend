"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { Order } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, Eye } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll({ status: statusFilter || undefined, search: search || undefined });
      setOrders(Array.isArray(data) ? data : data.orders || data.items || []);
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
      key: "id",
      label: "Order ID",
      render: (o: Order) => <span className="font-mono text-xs">{o.id.slice(-8)}</span>,
    },
    { key: "user_name", label: "Customer", render: (o: Order) => o.user_name || o.user_email || "N/A" },
    {
      key: "items",
      label: "Items",
      render: (o: Order) => <span>{o.items?.length || 0} items</span>,
    },
    {
      key: "final_amount",
      label: "Amount",
      render: (o: Order) => <span className="font-medium">{formatCurrency(o.final_amount)}</span>,
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
          {o.status === "pending" && (
            <button onClick={() => handleStatusUpdate(o.id, "confirmed")} className="text-xs btn-primary py-1 px-2">
              Confirm
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
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            className="input-field pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders found" />

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id.slice(-8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.user_name || "N/A"}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user_email}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge status={selectedOrder.status} />
                <p className="text-sm text-gray-500 mt-2">Payment: {selectedOrder.payment_method || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              <div className="border rounded-lg divide-y">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between p-3 text-sm">
                    <span>{item.medicine_name} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedOrder.total_amount)}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(selectedOrder.discount_amount)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(selectedOrder.delivery_charge)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCurrency(selectedOrder.final_amount)}</span></div>
            </div>

            {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
              <div className="flex gap-2 pt-2">
                {selectedOrder.status === "pending" && (
                  <button onClick={() => handleStatusUpdate(selectedOrder.id, "confirmed")} className="btn-primary">Confirm</button>
                )}
                {selectedOrder.status === "confirmed" && (
                  <button onClick={() => handleStatusUpdate(selectedOrder.id, "processing")} className="btn-primary">Process</button>
                )}
                {selectedOrder.status === "processing" && (
                  <button onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")} className="btn-primary">Ship</button>
                )}
                {selectedOrder.status === "shipped" && (
                  <button onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")} className="btn-primary">Deliver</button>
                )}
                <button onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")} className="btn-danger">Cancel</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
