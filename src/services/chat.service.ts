import api from "@/lib/api";
import { ChatRoom, Message } from "@/types";

interface ChatRoomListResponse {
  rooms: ChatRoom[];
  total: number;
}

interface MessageListResponse {
  messages: Message[];
  total: number;
}

export const chatService = {
  getRooms: async (params?: { page?: number; page_size?: number }): Promise<ChatRoomListResponse> => {
    const res = await api.get("/api/admin/chat/rooms", { params });
    const data = res.data;
    if (Array.isArray(data)) return { rooms: data, total: data.length };
    return { rooms: data.rooms || data.items || [], total: data.total || 0 };
  },

  getMessages: async (roomId: string, params?: { page?: number; page_size?: number }): Promise<MessageListResponse> => {
    const res = await api.get(`/api/chat/room/${roomId}/messages`, { params });
    const data = res.data;
    if (Array.isArray(data)) return { messages: data, total: data.length };
    return { messages: data.messages || data.items || [], total: data.total || 0 };
  },

  sendMessage: async (roomId: string, content: string): Promise<Message> => {
    const res = await api.post(`/api/chat/room/${roomId}/message`, null, {
      params: { content },
    });
    return res.data;
  },

  markAsRead: async (roomId: string): Promise<void> => {
    await api.put(`/api/chat/room/${roomId}/read`);
  },
};
