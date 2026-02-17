"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { addToCart as addToCartAPI, clearCart } from "@/utils/cartService";
import { showToast } from "@/utils/toast";

type MenuItem = {
  id: number;
  name: string;
  chefId: number;
  description: string;
  priceCents: number;
  preparationTimeMinutes: number;
  availableQty: number;
  isAvailable: boolean;
  imageBase64?: string;
  tags?: string[];
};

export default function UserMenuItemsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Parse chefId from URL params
  const chefId = typeof params.chefId === 'string' ? parseInt(params.chefId, 10) :
    Array.isArray(params.chefId) ? parseInt(params.chefId[0], 10) : null;

  const menuId = params.menuId;

  const api = useApi();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ item: MenuItem; qty: number } | null>(null);

  useEffect(() => {
    fetchItems();
  }, [menuId]);

  async function fetchItems() {
    const res = await api.get(`/chefs/menu/${menuId}/items`);
    if (res.ok) setItems(await res.json());
  }

  async function addToCart(item: MenuItem, qty: number) {
    if (!user) {
      router.push("/login");
      return;
    }

    // Validate chefId
    if (!chefId || isNaN(chefId)) {
      showToast("Invalid chef ID. Please try again from the chef's menu page.", 'error');
      return;
    }

    try {
      const result = await addToCartAPI(
        api,
        item.id, // This is the menuItemId
        qty,
        item.name,
        item.priceCents,
        {
          chefId: item.chefId
        }
      );

      // Check for chef conflict
      if (!result.success && result.conflict) {
        setPendingItem({ item, qty });
        setShowConflictDialog(true);
        return;
      }

      showToast("Added to cart!", "success");
      setSelectedItem(null);
      setQuantity(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add to cart. Please try again.";
      console.error("Error adding to cart:", error);
      showToast(message, 'error');
    }
  }

  async function handleConfirmClearCart() {
    if (!pendingItem) return;

    try {
      // Clear cart first
      await clearCart(api);

      // Then add new item
      const result = await addToCartAPI(
        api,
        pendingItem.item.id,
        pendingItem.qty,
        pendingItem.item.name,
        pendingItem.item.priceCents,
        {
          chefId: pendingItem.item.chefId
        }
      );

      if (result.success) {
        showToast("Cart cleared and item added!", "success");
        setShowConflictDialog(false);
        setPendingItem(null);
        setSelectedItem(null);
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showToast("Failed to update cart", "error");
    }
  }

  function openDetails(item: MenuItem) {
    setSelectedItem(item);
    setQuantity(1);
  }

  function closeDetails() {
    setSelectedItem(null);
    setQuantity(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menus
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Menu Items</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">No items available in this menu</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer ${!item.isAvailable || item.availableQty <= 0 ? "opacity-60" : ""
                  }`}
                onClick={() => openDetails(item)}
              >
                {/* Image Section */}
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {item.imageBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${item.imageBase64}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {(!item.isAvailable || item.availableQty <= 0) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.preparationTimeMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {item.availableQty} available
                    </span>
                  </div>

                  {/* Price and Add Button */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{(item.priceCents / 100).toFixed(2)}
                    </span>
                    <button
                      disabled={!item.isAvailable || item.availableQty <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetails(item);
                      }}
                      className={`px-5 py-2 rounded-lg font-semibold transition-colors ${item.isAvailable && item.availableQty > 0
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      {item.isAvailable && item.availableQty > 0 ? "Add" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeDetails}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="h-64 md:h-80 bg-gray-200 overflow-hidden relative">
              {selectedItem.imageBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${selectedItem.imageBase64}`}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{selectedItem.name}</h2>

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                {selectedItem.description}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-xl font-bold text-gray-800">₹{(selectedItem.priceCents / 100).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">Prep Time</p>
                  <p className="text-xl font-bold text-gray-800">{selectedItem.preparationTimeMinutes} min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-xl font-bold text-gray-800">{selectedItem.availableQty}</p>
                </div>
              </div>

              {/* Quantity Selector and Add to Cart */}
              {selectedItem.isAvailable && selectedItem.availableQty > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-500 flex items-center justify-center font-bold text-gray-700"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold w-12 text-black text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedItem.availableQty, quantity + 1))}
                        className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-500 flex items-center justify-center font-bold text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-b">
                    <span className="text-lg font-semibold text-gray-700">Total</span>
                    <span className="text-3xl font-bold text-orange-600">
                      ₹{((selectedItem.priceCents * quantity) / 100).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(selectedItem, quantity)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600 font-semibold">This item is currently unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
    </div>
  );
}