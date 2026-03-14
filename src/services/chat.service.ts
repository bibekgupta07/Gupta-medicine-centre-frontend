import api from "@/lib/api";
import { ChatRoom, Message } from "@/types";

export const chatService = {
  getRooms: async (): Promise<ChatRoom[]> => {
    const res = await api.get("/api/admin/chat/rooms");
    return res.data;
  },

  getMessages: async (roomId: string, params?: { page?: number }): Promise<Message[]> => {
    const res = await api.get(`/api/chat/room/${roomId}/messages`, { params });
    return res.data;
  },

  sendMessage: async (roomId: string, content: string): Promise<Message> => {
    const res = await api.post(`/api/chat/room/${roomId}/message`, null, { params: { content } });
    return res.data;
  },
};
