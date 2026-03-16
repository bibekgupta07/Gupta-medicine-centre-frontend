"use client";

import { useEffect, useState } from "react";
import { prescriptionService } from "@/services/prescription.service";
import { Prescription } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/utils";
import { Eye, Check, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [notes, setNotes] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getAll({ page, page_size: 20, status: statusFilter || undefined });
      setPrescriptions(data.prescriptions);
      setTotalPages(Math.ceil((data.total || data.prescriptions.length) / 20));
    } catch {
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setReviewLoading(true);
    try {
      await prescriptionService.review(id, { status, admin_notes: notes || undefined });
      toast.success(`Prescription ${status}`);
      setSelected(null);
      setNotes("");
      loadData();
    } catch {
      toast.error("Failed to review prescription");
    } finally {
      setReviewLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (p: Prescription) => <span className="font-mono text-xs">{p.id.slice(-8)}</span>,
    },
    {
      key: "user_name",
      label: "Patient",
      render: (p: Prescription) => (
        <span className="font-medium">{p.user_name || "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p: Prescription) => <Badge status={p.status} />,
    },
    {
      key: "ocr_text",
      label: "OCR Preview",
      render: (p: Prescription) =>
        p.ocr_text ? (
          <span className="text-xs text-gray-500 truncate max-w-[200px] block">
            {p.ocr_text.slice(0, 60)}...
          </span>
        ) : (
          <span className="text-xs text-gray-400">No OCR data</span>
        ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (p: Prescription) => (
        <span className="text-xs text-gray-500">{formatDateTime(p.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p: Prescription) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setSelected(p); setNotes(""); }}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <Eye size={16} className="text-blue-600" />
          </button>
          {p.status === "pending" && (
            <>
              <button
                onClick={() => handleReview(p.id, "approved")}
                className="p-1.5 rounded hover:bg-green-50"
                title="Quick approve"
              >
                <Check size={16} className="text-green-600" />
              </button>
              <button
                onClick={() => handleReview(p.id, "rejected")}
                className="p-1.5 rounded hover:bg-red-50"
                title="Quick reject"
              >
                <X size={16} className="text-red-600" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText size={16} />
          {prescriptions.filter((p) => p.status === "pending").length} pending review
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-48"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable columns={columns} data={prescriptions} loading={loading} emptyMessage="No prescriptions" />

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Prescription Details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Patient</p>
                <p className="font-medium">{selected.user_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <Badge status={selected.status} />
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p>{formatDateTime(selected.created_at)}</p>
              </div>
              {selected.reviewed_by && (
                <div>
                  <p className="text-gray-500">Reviewed by</p>
                  <p>{selected.reviewed_by}</p>
                </div>
              )}
            </div>

            {/* Prescription Image */}
            <div className="border rounded-lg overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${selected.image_url}`}
                alt="Prescription"
                className="w-full max-h-96 object-contain bg-gray-50"
              />
            </div>

            {/* OCR Text */}
            {selected.ocr_text && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">OCR Extracted Text</p>
                <pre className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap font-mono text-xs">
                  {selected.ocr_text}
                </pre>
              </div>
            )}

            {/* Admin Notes */}
            {selected.admin_notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes</p>
                <p className="text-sm bg-yellow-50 p-3 rounded-lg">{selected.admin_notes}</p>
              </div>
            )}

            {/* Review Actions */}
            {selected.status === "pending" && (
              <div className="space-y-3 border-t pt-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={2}
                  placeholder="Admin notes (optional)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(selected.id, "approved")}
                    disabled={reviewLoading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {reviewLoading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReview(selected.id, "rejected")}
                    disabled={reviewLoading}
                    className="btn-danger flex-1 disabled:opacity-50"
                  >
                    {reviewLoading ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
