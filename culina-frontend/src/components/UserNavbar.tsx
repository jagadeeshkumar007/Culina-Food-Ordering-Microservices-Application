"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function UserNavbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <nav className="bg-white sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4 items-center">
        {/* LOGO */}
        <h1
          onClick={() => router.push("/home")}
          className="text-2xl font-bold text-orange-600 cursor-pointer"
        >
          Culina
        </h1>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex-1">
          <input
            placeholder="Search for dishes, cuisines…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-black px-4 py-2 border rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-orange-600"
          />
        </form>

        {/* ACTIONS */}
        <button
          onClick={() => router.push("/orders")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          My Orders
        </button>

        <button
          onClick={() => router.push("/cart")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
        >
          Cart
        </button>

        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
