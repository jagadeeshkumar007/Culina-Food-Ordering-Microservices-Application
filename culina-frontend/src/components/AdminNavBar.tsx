"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminNavbar() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <nav className="bg-white sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <h1
          onClick={() => router.push("/admin")}
          className="text-2xl font-bold text-orange-600 cursor-pointer"
        >
          Culina Admin
        </h1>

        {/* LINKS */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/admin/chef-approvals")}
            className="text-gray-700 hover:text-orange-600 cursor-pointer"
          >
            Chef Approvals
          </button>

          <button
            onClick={() => router.push("/admin/chefs")}
            className="text-gray-700 hover:text-orange-600 cursor-pointer"
          >
            Chefs
          </button>

          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
