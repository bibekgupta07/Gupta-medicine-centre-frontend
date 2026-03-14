"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { Pill } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await authService.login({ email, password });
      setTokens(tokens.access_token, tokens.refresh_token);
      const user = await authService.getProfile();
      if (user.role !== "admin") {
        toast.error("Access denied. Admin only.");
        useAuthStore.getState().logout();
        return;
      }
      setUser(user);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string | Array<{msg: string}> } } };
      const detail = error.response?.data?.detail;
      const message = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <Pill className="text-primary-700" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gupta Medicine Centre</h1>
            <p className="text-gray-500 mt-1">Admin Dashboard Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
