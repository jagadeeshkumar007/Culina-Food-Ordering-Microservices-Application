"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { addToCart as addToCartAPI } from "@/utils/cartService";
import { showToast } from "@/utils/toast";
import { useState } from "react";

export default function FoodItemCard({ item }: any) {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      await addToCartAPI(
        api,
        item.menuItemId,
        1,
        item.name,
        item.priceCents,
        {
          chefId: item.chefId
        }
      );

      showToast(`${item.name} added to cart!`, 'success');
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      showToast(errorMessage, 'error');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex justify-between items-center border-b py-4">
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">
          ₹{item.priceCents / 100} · {item.kitchenName}
        </p>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-1 rounded"
      >
        {isAdding ? "..." : "ADD"}
      </button>
    </div>
  );
}
