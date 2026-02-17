"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserNavbar from "@/components/UserNavbar";
import SearchMenuItemCard from "@/components/SearchMenuItemCard";
import { useApi } from "@/utils/ApiClient";

type SearchItem = {
  menuItemId: number;
  name: string;
  description: string;
  priceCents: number;
  preparationTimeMinutes: number;
  kitchenName: string;
  chefName: string;
  chefId?: number;
  imageBase64?: string;
  tags?: string[];
  availableQty?: number;
  isAvailable?: boolean;
};

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    const api = useApi();
    api.get(`/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">
          Results for “{query}”
        </h2>

        {loading ? (
          <p>Searching dishes…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No dishes found</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <SearchMenuItemCard
                key={item.menuItemId}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
