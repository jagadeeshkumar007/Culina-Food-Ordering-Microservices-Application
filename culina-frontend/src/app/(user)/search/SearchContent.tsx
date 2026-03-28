"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function SearchContent() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const api = useApi();
    api.get(`/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">
        Results for "{query}"
      </h2>

      {loading && (
        <div className="text-center text-gray-600">
          Loading...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center text-gray-600">
          No items found
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <SearchMenuItemCard
            key={`${item.chefId}-${item.menuItemId}`}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
