"use client";

import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-sm text-gray-500">Welcome back, <span className="font-medium text-gray-900">{user?.full_name || "Admin"}</span></h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-800">
              {user?.full_name?.charAt(0) || "A"}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.full_name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
