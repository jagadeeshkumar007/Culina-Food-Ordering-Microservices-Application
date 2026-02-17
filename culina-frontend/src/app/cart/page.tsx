"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/utils/ApiClient";
import { useEffect, useState } from "react";
import { fetchCart, updateCartItem, removeFromCart } from "@/utils/cartService";
import type { CartItem } from "@/utils/cartService";

export default function CartPage() {
  const router = useRouter();
  const api = useApi();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalCents, setTotalCents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState<number | null>(null);

  useEffect(() => {
    async function loadCart() {
      try {
        setIsLoading(true);
        const result = await fetchCart(api);
        setItems(result.items);
        setTotalCents(result.totalCents);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [api]);

  async function handleUpdateQty(menuItemId: number, newQty: number) {
    const result = await updateCartItem(api, menuItemId, newQty);
    if (result) {
      setItems(result.items);
      setTotalCents(result.totalCents);
    }
  }

  async function handleRemoveItem(menuItemId: number) {
    setRemovingItem(menuItemId);
    const result = await removeFromCart(api, menuItemId);
    if (result) {
      setItems(result.items);
      setTotalCents(result.totalCents);
    }
    setRemovingItem(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Add some delicious items to get started!</p>
          <button
            onClick={() => router.push('/home')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div className="h-5 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              Your Cart
              <span className="ml-2 text-sm font-normal text-gray-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className={`p-4 transition-opacity ${removingItem === item.menuItemId ? 'opacity-50' : ''
                  }`}
              >
                <div className="flex items-center justify-between">
                  {/* Item Details - Left Side */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.chefName && (
                      <p className="text-base text-gray-500 mt-1">by {item.chefName}</p>
                    )}
                    <p className="text-base text-gray-600 mt-1">₹{(item.priceCents / 100).toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls & Price - Right Side */}
                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQty(item.menuItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>

                      <span className="text-base font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>

                      <button
                        onClick={() => handleUpdateQty(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-r-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-lg font-bold text-gray-900 min-w-[90px] text-right">
                      ₹{((item.priceCents * item.quantity) / 100).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.menuItemId)}
                      disabled={removingItem === item.menuItemId}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="border-t-2 border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-semibold text-gray-900">Total Amount</span>
              <span className="text-3xl font-bold text-gray-900">₹{(totalCents / 100).toFixed(2)}</span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
