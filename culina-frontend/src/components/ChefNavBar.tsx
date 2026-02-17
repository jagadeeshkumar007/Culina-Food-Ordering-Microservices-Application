"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ChefNavbar() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <nav className="bg-white sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <h1
          onClick={() => router.push("/chef/dashboard")}
          className="text-2xl font-bold text-orange-600 cursor-pointer"
        >
          Culina Chef
        </h1>

        {/* LINKS */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/chef/dashboard")}
            className="text-gray-700 hover:text-orange-600 cursor-pointer"
          >
            Dashboard
          </button>

          <button
            onClick={() => router.push("/chef/menus")}
            className="text-gray-700 hover:text-orange-600 cursor-pointer"
          >
            Menus
          </button>

          <button
            onClick={() => router.push("/chef/orders")}
            className="text-gray-700 hover:text-orange-600 cursor-pointer"
          >
            Orders
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
