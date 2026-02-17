"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";

type Chef = {
  id: number;
  displayName: string;
  kitchenName: string;
  cuisineType: string;
  preparationTimeMinutes: number;
  description: string;
};

export default function AdminChefsPage() {
  const { user } = useAuth();
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChefs();
  }, []);

  async function fetchChefs() {
    const api = useApi();
    const res = await api.get("/admin/chefs?status=PENDING");
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log(data);
    setChefs(data);
    setLoading(false);
  }

  async function approveChef(id: number) {
    const api = useApi();
    await api.post(
      `/admin/chefs/${id}/approve`,
      {}
    );

    setChefs((prev) => prev.filter((c) => c.id !== id));
  }

  async function rejectChef(id: number) {
    const api = useApi();
    await api.post(
      `/admin/chefs/${id}/reject`,
      {}
    );

    setChefs((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading chefs…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Pending Chef Approvals
      </h1>

      {chefs.length === 0 && (
        <p className="text-gray-600">No pending requests</p>
      )}

      <div className="grid gap-6">
        {chefs.map((chef) => (
          <div
            key={chef.id}
            className="bg-white rounded-xl shadow p-6 text-gray-900"
          >
            <h2 className="text-xl font-semibold">
              {chef.displayName}
            </h2>
            <p className="text-sm text-gray-600">
              {chef.kitchenName} • {chef.cuisineType}
            </p>

            <p className="mt-2 text-gray-700">
              {chef.description}
            </p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => approveChef(chef.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Approve
              </button>

              <button
                onClick={() => rejectChef(chef.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
