"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { addToCart as addToCartAPI, clearCart } from "@/utils/cartService";
import { showToast } from "@/utils/toast";
import Modal from "@/components/Modal";

export type SearchItem = {
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

type Props = {
  item: SearchItem;
};

export default function SearchMenuItemCard({ item }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ qty: number } | null>(null);

  async function handleAddToCart(qty: number) {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const result = await addToCartAPI(
        api,
        item.menuItemId,
        qty,
        item.name,
        item.priceCents,
        {
          chefId: item.chefId
        }
      );

      console.log(result);

      // Check for chef conflict - improved detection
      if (!result.success) {
        if (result.conflict) {
          // Explicit conflict flag
          setPendingItem({ qty });
          setShowConflictDialog(true);
          return;
        } else {
          // Item not added - show generic error
          showToast("Failed to add to cart", "error");
          return;
        }
      }

      // Success case
      showToast("Added to cart!", "success");
      setIsModalOpen(false);
      setQuantity(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add to cart";
      console.error("Error adding to cart:", error);
      showToast(message, 'error');
    }
  }

  function openModal() {
    setIsModalOpen(true);
    setQuantity(1);
  }

  function closeModal() {
    setIsModalOpen(false);
    setQuantity(1);
  }

  async function handleConfirmClearCart() {
    if (!pendingItem) return;

    try {
      // Clear cart first
      await clearCart(api);

      // Then add new item
      const result = await addToCartAPI(
        api,
        item.menuItemId,
        pendingItem.qty,
        item.name,
        item.priceCents,
        {
          chefId: item.chefId
        }
      );

      if (result.success) {
        showToast("Cart cleared and item added!", "success");
        setShowConflictDialog(false);
        setPendingItem(null);
        setIsModalOpen(false);
        setQuantity(1);
      } else {
        showToast("Failed to add item after clearing cart", "error");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showToast("Failed to update cart", "error");
    }
  }

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
        onClick={openModal}
      >
        <div className="flex gap-4 p-4">
          {/* IMAGE */}
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {item.imageBase64 ? (
              <img
                src={`data:image/jpeg;base64,${item.imageBase64}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.name}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {item.description}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Chef and Kitchen Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.preparationTimeMinutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {item.kitchenName}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {item.chefName}
                </span>
              </div>
            </div>

            {/* Stock Badge */}
            {item.availableQty !== undefined && item.availableQty !== null && (
              <div className="mt-2">
                {item.availableQty === 0 || !item.isAvailable ? (
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                    ⚠️ Out of Stock
                  </span>
                ) : item.availableQty < 10 ? (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                    🔥 Only {item.availableQty} left
                  </span>
                ) : null}
              </div>
            )}

            {/* Price and Action */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-xl font-bold text-orange-600">
                ₹{(item.priceCents / 100).toFixed(2)}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal();
                }}
                disabled={item.availableQty === 0 || item.isAvailable === false}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                {item.availableQty === 0 || item.isAvailable === false ? 'Unavailable' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <Modal title={item.name} onClose={closeModal} size="sm">
          {/* Chef and Kitchen Info */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {item.chefName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {item.kitchenName}
            </span>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Price and Prep Time */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-lg font-bold text-orange-600">₹{(item.priceCents / 100).toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Prep Time</p>
              <p className="text-lg font-bold text-gray-800">{item.preparationTimeMinutes} min</p>
            </div>
          </div>

          {/* Stock Warning */}
          {item.availableQty !== undefined && item.availableQty !== null && (
            <div className="mb-4">
              {item.availableQty === 0 || !item.isAvailable ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs text-red-800 font-semibold">This item is currently out of stock</span>
                </div>
              ) : item.availableQty < 10 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-yellow-800 font-semibold">Only {item.availableQty} items remaining</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={item.availableQty === 0 || item.isAvailable === false}
                  className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-black"
                >
                  −
                </button>
                <span className="text-lg font-bold w-10 text-black text-center">{quantity}</span>
                <button
                  onClick={() => {
                    const maxQty = item.availableQty || 999;
                    setQuantity(Math.min(maxQty, quantity + 1));
                  }}
                  disabled={item.availableQty === 0 || item.isAvailable === false || Boolean(item.availableQty && quantity >= item.availableQty)}
                  className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-2xl font-bold text-orange-600">
                ₹{((item.priceCents * quantity) / 100).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => handleAddToCart(quantity)}
              disabled={item.availableQty === 0 || item.isAvailable === false}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
            >
              {item.availableQty === 0 || item.isAvailable === false ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </Modal>
      )}

      {/* Chef Conflict Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Different Chef</h2>
            <p className="text-gray-700">
              Your cart has items from a different chef. You can only order from one chef at a time.
            </p>
            <p className="text-gray-700 font-semibold">
              What would you like to do?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmClearCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Remove old items & add this item
              </button>
              <button
                onClick={() => {
                  setShowConflictDialog(false);
                  setPendingItem(null);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                Keep current cart (don't add)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}