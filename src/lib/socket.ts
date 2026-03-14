import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("Socket.IO connected");
      this.socket?.emit("authenticate", { token });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    // Re-register all listeners on reconnect
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.on(event, cb));
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  joinRoom(roomId: string) {
    this.socket?.emit("join_room", { room_id: roomId });
  }

  sendMessage(roomId: string, content: string, messageType = "text") {
    this.socket?.emit("send_message", {
      room_id: roomId,
      content,
      message_type: messageType,
    });
  }

  sendTyping(roomId: string, userName: string) {
    this.socket?.emit("typing", { room_id: roomId, user_name: userName });
  }

  stopTyping(roomId: string, userName: string) {
    this.socket?.emit("stop_typing", { room_id: roomId, user_name: userName });
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();
