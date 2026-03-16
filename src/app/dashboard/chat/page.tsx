"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { chatService } from "@/services/chat.service";
import { socketManager } from "@/lib/socket";
import { webrtcManager, CallInfo } from "@/lib/webrtc";
import { useAuthStore } from "@/store/auth";
import { ChatRoom, Message } from "@/types";
import { formatDateTime } from "@/lib/utils";
import CallModal from "@/components/call/CallModal";
import { Send, MessageSquare, Phone, Video, Wifi, WifiOff, Paperclip, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [outgoingCallType, setOutgoingCallType] = useState<"audio" | "video">("audio");
  const [outgoingUserId, setOutgoingUserId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect Socket.IO
  useEffect(() => {
    socketManager.connect();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleNewMessage = (data: unknown) => {
      const msg = data as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setRooms((prev) =>
        prev.map((r) =>
          r.id === msg.room_id
            ? { ...r, last_message: msg.content, last_message_at: msg.created_at }
            : r
        )
      );
    };

    const handleTyping = (data: unknown) => {
      const d = data as { room_id: string; user_name: string };
      setTypingUsers((prev) => Array.from(new Set([...prev, d.user_name])));
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== d.user_name));
      }, 3000);
    };

    socketManager.on("connect", handleConnect);
    socketManager.on("disconnect", handleDisconnect);
    socketManager.on("new_message", handleNewMessage);
    socketManager.on("typing", handleTyping);

    webrtcManager.init();
    webrtcManager.onIncomingCall = (info) => {
      setIncomingCall(info);
      setShowCallModal(true);
    };

    loadRooms();

    return () => {
      socketManager.off("connect", handleConnect);
      socketManager.off("disconnect", handleDisconnect);
      socketManager.off("new_message", handleNewMessage);
      socketManager.off("typing", handleTyping);
      socketManager.disconnect();
    };
  }, []);

  const loadRooms = async () => {
    try {
      const data = await chatService.getRooms();
      setRooms(data.rooms);
    } catch {
      toast.error("Failed to load chat rooms");
    } finally {
      setLoading(false);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    socketManager.joinRoom(room.id);
    try {
      const data = await chatService.getMessages(room.id);
      setMessages(data.messages);
      // Mark as read
      chatService.markAsRead(room.id).catch(() => {});
      // Update unread count
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, unread_count: 0 } : r)));
    } catch {
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedRoom) return;
    socketManager.sendMessage(selectedRoom.id, newMessage.trim());
    setNewMessage("");
    if (user) socketManager.stopTyping(selectedRoom.id, user.full_name);
  }, [newMessage, selectedRoom, user]);

  const handleTypingInput = () => {
    if (!selectedRoom || !user) return;
    socketManager.sendTyping(selectedRoom.id, user.full_name);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedRoom && user) socketManager.stopTyping(selectedRoom.id, user.full_name);
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/api/chat/room/${selectedRoom.id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Message comes back from socket or API
      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
      toast.success("File sent");
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCall = (type: "audio" | "video") => {
    if (!selectedRoom) return;
    setOutgoingCallType(type);
    setOutgoingUserId(selectedRoom.customer_id);
    setShowCallModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Chat Support</h2>
        <div className="flex items-center gap-2 text-sm">
          {connected ? (
            <>
              <Wifi size={16} className="text-green-600" />
              <span className="text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-red-500" />
              <span className="text-red-500">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="card p-0 flex h-[calc(100vh-200px)] overflow-hidden">
        {/* Room List */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">
              Conversations ({rooms.length})
            </h3>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-2" />
              <p>No conversations yet</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedRoom?.id === room.id ? "bg-primary-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-800">
                        {room.customer_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{room.customer_name}</p>
                  </div>
                  {room.unread_count > 0 && (
                    <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                      {room.unread_count}
                    </span>
                  )}
                </div>
                {room.last_message && (
                  <p className="text-xs text-gray-500 mt-1 truncate ml-10">{room.last_message}</p>
                )}
                {room.last_message_at && (
                  <p className="text-[10px] text-gray-400 mt-0.5 ml-10">
                    {formatDateTime(room.last_message_at)}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="font-semibold">{selectedRoom.customer_name}</p>
                  {typingUsers.length > 0 && (
                    <p className="text-xs text-primary-600 animate-pulse">
                      {typingUsers.join(", ")} typing...
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startCall("audio")} className="p-2 rounded-lg hover:bg-gray-100" title="Audio Call">
                    <Phone size={18} className="text-gray-600" />
                  </button>
                  <button onClick={() => startCall("video")} className="p-2 rounded-lg hover:bg-gray-100" title="Video Call">
                    <Video size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_role === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender_role === "admin"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      } ${msg.is_deleted ? "opacity-50 italic" : ""}`}
                    >
                      {msg.sender_role !== "admin" && (
                        <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                      )}
                      {msg.is_deleted ? (
                        <p className="text-sm">Message deleted</p>
                      ) : (
                        <>
                          {(msg.message_type === "image" || msg.message_type === "file") && msg.file_url && (
                            <div className="mb-2">
                              {msg.message_type === "image" ? (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file_url}`}
                                  alt="Shared"
                                  className="max-w-full rounded"
                                />
                              ) : (
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL}${msg.file_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 underline"
                                >
                                  <Paperclip size={14} /> File attachment
                                </a>
                              )}
                            </div>
                          )}
                          {msg.message_type === "prescription" && msg.file_url && (
                            <div className="mb-2">
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${msg.file_url}`}
                                alt="Prescription"
                                className="max-w-full rounded"
                              />
                              <p className="text-xs mt-1 opacity-70">Prescription</p>
                            </div>
                          )}
                          {msg.content && <p className="text-sm">{msg.content}</p>}
                        </>
                      )}
                      <p
                        className={`text-[10px] mt-1 ${
                          msg.sender_role === "admin" ? "text-primary-100" : "text-gray-400"
                        }`}
                      >
                        {formatDateTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Attach file"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
                    ) : (
                      <Paperclip size={20} />
                    )}
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTypingInput();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button onClick={sendMessage} className="btn-primary" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CallModal
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setIncomingCall(null);
          setOutgoingUserId("");
        }}
        incomingCall={incomingCall}
        outgoingUserId={outgoingUserId || undefined}
        outgoingCallType={outgoingCallType}
      />
    </div>
  );
}
