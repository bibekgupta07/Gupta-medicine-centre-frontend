"use client";

import { useState } from "react";
import { notificationService } from "@/services/notification.service";
import { Bell, Send, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [tab, setTab] = useState<"send" | "broadcast">("send");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (tab === "send") {
        await notificationService.sendToUser({ user_id: userId, title, message, type });
        toast.success("Notification sent");
      } else {
        await notificationService.broadcast({ title, message, type });
        toast.success("Broadcast sent");
      }
      setTitle(""); setMessage(""); setUserId("");
    } catch { toast.error("Failed to send"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
      <div className="flex gap-2">
        <button onClick={() => setTab("send")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "send" ? "bg-primary-700 text-white" : "bg-gray-100"}`}><Send size={16} /> Send to User</button>
        <button onClick={() => setTab("broadcast")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "broadcast" ? "bg-primary-700 text-white" : "bg-gray-100"}`}><Globe size={16} /> Broadcast</button>
      </div>
      <div className="card max-w-2xl">
        <div className="flex items-center gap-3 mb-6"><Bell className="text-primary-700" size={24} /><h3 className="text-lg font-semibold">{tab === "send" ? "Send Notification" : "Broadcast to All"}</h3></div>
        <form onSubmit={handleSend} className="space-y-4">
          {tab === "send" && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label><input value={userId} onChange={(e) => setUserId(e.target.value)} className="input-field" required placeholder="Enter user ID" /></div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required placeholder="Notification title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-field" rows={4} required placeholder="Notification message" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={type} onChange={(e) => setType(e.target.value)} className="input-field"><option value="info">Info</option><option value="order">Order Update</option><option value="promotion">Promotion</option><option value="reminder">Reminder</option></select></div>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Sending..." : tab === "send" ? "Send Notification" : "Send Broadcast"}</button>
        </form>
      </div>
    </div>
  );
}
