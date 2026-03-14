"use client";

import { useEffect, useState } from "react";
import { prescriptionService } from "@/services/prescription.service";
import { Prescription } from "@/types";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/utils";
import { Eye, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { loadData(); }, [statusFilter]);

  const loadData = async () => {
    try {
      const data = await prescriptionService.getAll({ status: statusFilter || undefined });
      setPrescriptions(Array.isArray(data) ? data : data.prescriptions || data.items || []);
    } catch { toast.error("Failed to load prescriptions"); }
    finally { setLoading(false); }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await prescriptionService.review(id, { status, admin_notes: notes });
      toast.success(`Prescription ${status}`);
      setSelected(null);
      setNotes("");
      loadData();
    } catch { toast.error("Failed to review prescription"); }
  };

  const columns = [
    { key: "id", label: "ID", render: (p: Prescription) => <span className="font-mono text-xs">{p.id.slice(-8)}</span> },
    { key: "user_name", label: "Patient", render: (p: Prescription) => p.user_name || "N/A" },
    { key: "status", label: "Status", render: (p: Prescription) => <Badge status={p.status} /> },
    { key: "ocr_text", label: "OCR", render: (p: Prescription) => p.ocr_text ? <span className="text-xs text-gray-500 truncate max-w-[200px] block">{p.ocr_text.slice(0, 50)}...</span> : "-" },
    { key: "created_at", label: "Date", render: (p: Prescription) => <span className="text-xs text-gray-500">{formatDateTime(p.created_at)}</span> },
    { key: "actions", label: "Actions", render: (p: Prescription) => (
      <div className="flex gap-2">
        <button onClick={() => { setSelected(p); setNotes(""); }} className="p-1.5 rounded hover:bg-gray-100"><Eye size={16} className="text-blue-600" /></button>
        {p.status === "pending" && (
          <>
            <button onClick={() => handleReview(p.id, "approved")} className="p-1.5 rounded hover:bg-green-50"><Check size={16} className="text-green-600" /></button>
            <button onClick={() => handleReview(p.id, "rejected")} className="p-1.5 rounded hover:bg-red-50"><X size={16} className="text-red-600" /></button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <DataTable columns={columns} data={prescriptions} loading={loading} />
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Prescription Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <img src={`${process.env.NEXT_PUBLIC_API_URL}${selected.image_url}`} alt="Prescription" className="w-full max-h-96 object-contain rounded-lg border" />
            {selected.ocr_text && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">OCR Extracted Text</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selected.ocr_text}</p>
              </div>
            )}
            {selected.status === "pending" && (
              <div className="space-y-3">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" rows={2} placeholder="Admin notes (optional)" />
                <div className="flex gap-2">
                  <button onClick={() => handleReview(selected.id, "approved")} className="btn-primary flex-1">Approve</button>
                  <button onClick={() => handleReview(selected.id, "rejected")} className="btn-danger flex-1">Reject</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
