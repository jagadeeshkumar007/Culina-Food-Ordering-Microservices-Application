"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { fetchCart } from "@/utils/cartService";
import type { CartItem } from "@/utils/cartService";
import { showToast } from "@/utils/toast";

export default function CheckoutPage() {
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalCents, setTotalCents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCart() {
      if (!user) {
        setError("Please log in first");
        return;
      }
      try {
        setIsLoading(true);
        const result = await fetchCart(api);
        setItems(result.items);
        setTotalCents(result.totalCents);
      } catch (err) {
        setError("Failed to load cart");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [user, api]);

  async function placeOrder() {
    if (items.length === 0) {
      showToast("Your cart is empty", 'warning');
      return;
    }

    const chefId = items[0]?.chefId;
    if (!chefId) {
      console.error("Missing chefId in cart items", items);
      showToast("Cart data is incomplete (missing Chef ID). Please clear your cart and try again.", 'error');
      return;
    }

    try {
      const res = await api.post("/cart/checkout", {
        chefId: chefId,
        currency: "INR"
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to create order");
      }

      const orderId = await res.json();
      router.push(`/payment?orderId=${orderId}&amount=${totalCents}`);
    } catch (err) {
      console.error("Error placing order:", err);
      showToast(err instanceof Error ? err.message : "Failed to place order", 'error');
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
          <h1 className="text-xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
        <h1 className="text-xl font-bold mb-4 text-black">
          Confirm Order
        </h1>

        <div className="mb-4 bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">Items: {items.length}</p>
          <p className="text-gray-600 font-semibold">
            Total Amount: ₹{totalCents / 100}
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={items.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded"
        >
          Place Order
        </button>

        <button
          onClick={() => router.back()}
          className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
