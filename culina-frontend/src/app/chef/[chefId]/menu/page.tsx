"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/utils/ApiClient";

type Menu = {
  id: number;
  title: string;
};

export default function ChefMenusPage() {
  const { chefId } = useParams();
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    const api = useApi();
    const res = await api.get(`/chefs/menu/${chefId}/menus`);
    const data = await res.json();
    setMenus(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading menus…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-orange-600"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Menus
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-xl shadow p-6 text-gray-900"
          >
            <h2 className="text-xl font-semibold">
              {menu.title}
            </h2>

            <button
              onClick={() =>
                router.push(`menu/${menu.id}/items`)
              }
              className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
            >
              View Items
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
