import api from "@/lib/api";
import { AuthTokens, LoginRequest, User } from "@/types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthTokens> => {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get("/api/users/me");
    return res.data;
  },
};
