"use client";

import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="input-field pl-10"
          />
        </div>
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
