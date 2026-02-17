"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/utils/ApiClient';
import { addToCart as addToCartAPI, clearCart } from '@/utils/cartService';
import { showToast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

type Chef = {
  id: number;
  userId: number;
  kitchenName: string;
  displayName: string;
  cuisineType: string;
  avgRating: number;
};

type MenuItem = {
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

function UserNavbar({ onSearch, currentQuery }: { onSearch: (q: string) => void; currentQuery: string }) {
  const [query, setQuery] = useState(currentQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  function handleSearch() {
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0);
  }

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-4 items-center">
          <div
            onClick={() => onSearch('')}
            className="cursor-pointer"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">Culina</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Home Chef Network</p>
          </div>

          <div className="flex-1 relative max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for dishes, cuisines, ingredients..."
                value={query}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              {query && (
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-600 hover:text-orange-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border p-3">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Biryani', 'Pizza', 'Pasta', 'Curry', 'Desserts', 'Vegetarian'].map((term, index) => (
                    <button
                      key={`search-${index}-${term}`}
                      onClick={() => {
                        setQuery(term);
                        onSearch(term);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { router.push('/cart') }}
            className="bg-orange-600 hover:bg-orange-700 cursor-pointer text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
          </button>

          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700 cursor-pointer font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function ChefCard({ chef }: { chef: Chef }) {
  const router = useRouter();

  function handleViewMenu() {
    router.push(`/chef/${chef.userId}/menu`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 relative">
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-2xl font-bold text-orange-600">
              {chef.displayName.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-10 px-6 pb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{chef.kitchenName}</h3>
        <p className="text-sm text-gray-600 mb-3">by {chef.displayName}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
            {chef.cuisineType}
          </span>
          {chef.avgRating > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-700">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {chef.avgRating.toFixed(1)}
            </span>
          )}
        </div>

        <button
          onClick={handleViewMenu}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
        >
          View Menu
          <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem, qty: number) => Promise<void> }) {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  async function handleAddToCart(qty: number) {
    setIsAddingToCart(true);
    try {
      await onAddToCart(item, qty);
      setShowModal(false);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      >
        <div className="flex gap-3 p-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {item.imageBase64 ? (
              <img
                src={`data:image/jpeg;base64,${item.imageBase64}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
            <p className="text-xs text-gray-600 line-clamp-1 mb-2">{item.description}</p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <span key={`tag-small-${index}-${tag}`} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-1">
              <span className="text-lg font-bold text-orange-600">
                ₹{(item.priceCents / 100).toFixed(0)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg font-semibold transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="h-56 bg-gray-200 overflow-hidden relative">
              {item.imageBase64 ? (
                <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {item.chefName}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {item.kitchenName}
                </span>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, index) => (
                    <span key={`tag-modal-${index}-${tag}`} className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              <p className="text-gray-600 mb-4 text-sm">{item.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-lg font-bold text-gray-800">₹{(item.priceCents / 100).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Prep Time</p>
                  <p className="text-lg font-bold text-gray-800">{item.preparationTimeMinutes} min</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg">−</button>
                    <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg">+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-orange-600">₹{((item.priceCents * quantity) / 100).toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(quantity)}
                  disabled={isAddingToCart}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UserDashboard() {
  const { user, authLoading, logout } = useAuth();
  const api = useApi();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'home' | 'search'>('home');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ item: MenuItem; qty: number } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'admin') {
      router.replace('/admin/chefs');
      return;
    }

    if (user.role !== 'customer') {
      router.replace('/chef/resolve');
      return;
    }

    loadChefs();
  }, [authLoading, user, router]);

  async function loadChefs() {
    setLoading(true);
    try {
      const response = await api.get('/chefs/active');
      if (response.ok) {
        const data = await response.json();
        setChefs(data);
      }
    } catch (error) {
      console.error('Error loading chefs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setView('home');
      setSearchQuery('');
      setMenuItems([]);
      return;
    }

    setSearchQuery(query);
    setView('search');
    setLoading(true);

    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
      showToast('Search service is unavailable. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(item: MenuItem, qty: number) {
    try {
      const result = await addToCartAPI(
        api,
        item.menuItemId,
        qty,
        item.name,
        item.priceCents,
        {
          chefId: item.chefId,
          chefName: item.chefName
        }
      );

      // Check for chef conflict
      if (!result.success && result.conflict) {
        setPendingItem({ item, qty });
        setShowConflictDialog(true);
        return;
      }

      // Only show success if actually added
      if (result.success) {
        showToast(`Added ${qty} × ${item.name} to cart!`, 'success');
      } else {
        showToast("Failed to add to cart", "error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add to cart. Please try again.";
      console.error('Error adding to cart:', error);
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
        pendingItem.item.menuItemId,
        pendingItem.qty,
        pendingItem.item.name,
        pendingItem.item.priceCents,
        {
          chefId: pendingItem.item.chefId,
          chefName: pendingItem.item.chefName
        }
      );

      if (result.success) {
        showToast("Cart cleared and item added!", "success");
        setShowConflictDialog(false);
        setPendingItem(null);
      } else {
        showToast("Failed to add item after clearing cart", "error");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showToast("Failed to update cart", "error");
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <UserNavbar onSearch={handleSearch} currentQuery={searchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'home' && (
          <>
            <div className="mb-12 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Discover Amazing Home Chefs
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Authentic homemade meals from talented local chefs near you
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading chefs...</p>
              </div>
            ) : chefs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <p className="text-gray-600">No chefs available at the moment.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {chefs.map(chef => (
                  <ChefCard key={chef.userId} chef={chef} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'search' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600">{menuItems.length} dishes found</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Searching dishes...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600 mb-6">Try searching for something else</p>
                <button
                  onClick={() => handleSearch('')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Browse All Chefs
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <MenuItemCard key={`menu-item-${item.menuItemId}-${index}`} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

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