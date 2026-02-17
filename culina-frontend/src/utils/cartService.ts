// utils/cartService.ts
import { useApi } from './ApiClient';

export type CartItem = {
  menuItemId: number;
  name: string;
  priceCents: number;
  quantity: number;
  availableQty?: number;
  chefId?: number;
  chefName?: string;
};

type CartResponse = {
  items: CartItem[];
  totalCents: number;
};

/**
 * Fetch cart from backend database
 */
export async function fetchCart(api: ReturnType<typeof useApi>): Promise<CartResponse> {
  try {
    const res = await api.get('/cart');
    if (!res.ok) {
      throw new Error(`Failed to fetch cart: ${res.status}`);
    }
    const data = await res.json();
    const items = (data.items || []).map((item: any) => ({
      menuItemId: item.menuItemId || item.id,
      name: item.name,
      priceCents: item.priceCents,
      quantity: item.quantity,
      availableQty: item.availableQty || 999,
      chefId: item.chefId,
      chefName: item.chefName
    }));

    const totalCents = items.reduce((sum: number, item: CartItem) => sum + (item.priceCents * item.quantity), 0);

    return { items, totalCents };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [], totalCents: 0 };
  }
}

/**
 * Check if item already exists in cart
 */
export async function itemExistsInCart(
  api: ReturnType<typeof useApi>,
  menuItemId: number
): Promise<boolean> {
  try {
    const cart = await fetchCart(api);
    return cart.items.some(item => item.menuItemId === menuItemId);
  } catch (error) {
    console.error('Error checking if item exists in cart:', error);
    return false;
  }
}

/**
 * Add or update item in cart
 */
export async function addToCart(
  api: ReturnType<typeof useApi>,
  menuItemId: number,
  quantity: number,
  name: string,
  priceCents: number,
  options?: {
    chefId?: number;
    chefName?: string;
  }
): Promise<{ success: boolean; conflict?: { chefId: number; message: string } }> {
  try {
    // Check if item already exists in cart
    const exists = await itemExistsInCart(api, menuItemId);
    if (exists) {
      throw new Error("This item is already in your cart. Go to cart to update quantity.");
    }

    const res = await api.post('/cart/add', {
      menuItemId,
      quantity,
      name,
      priceCents,
      chefId: options?.chefId,
      chefName: options?.chefName
    });

    // Handle chef conflict (409 CONFLICT) - MUST check this before res.ok
    if (res.status === 409) {
      try {
        const data = await res.json();
        return {
          success: false,
          conflict: {
            chefId: data.conflictingChefId || data.chefId,
            message: data.message || "Cart contains items from a different chef",
          },
        };
      } catch (parseError) {
        console.error('Failed to parse 409 response:', parseError);
        return {
          success: false,
          conflict: {
            chefId: 0,
            message: "Cart contains items from a different chef",
          },
        };
      }
    }

    if (!res.ok) {
      // Try to get error message from response
      const errorText = await res.text();
      if (errorText.includes('already') || errorText.includes('exists')) {
        console.log("This item is already in your cart. Go to cart to update quantity.");
      }
      console.log(`Failed to add to cart: ${res.status}`);
      throw new Error("Failed to add to cart");
    }

    // Success
    return { success: true };
  } catch (error) {
    // If it's our "already in cart" error, throw it
    if (error instanceof Error && error.message.includes("already in your cart")) {
      throw error;
    }
    // Otherwise, log and throw
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update quantity of item in cart
 */
export async function updateCartItem(
  api: ReturnType<typeof useApi>,
  menuItemId: number,
  quantity: number
): Promise<CartResponse | null> {
  try {
    const res = await api.post('/cart/update', {
      menuItemId,
      quantity
    });

    if (!res.ok) {
      throw new Error(`Failed to update cart: ${res.status}`);
    }

    // Check if response has content before parsing
    const contentType = res.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      const text = await res.text();
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Failed to parse JSON response:', e);
          // If JSON parsing fails, fetch fresh cart from backend
          return fetchCart(api);
        }
      } else {
        // Empty response body, fetch fresh cart from backend
        return fetchCart(api);
      }
    } else {
      // If not JSON, fetch fresh cart from backend
      return fetchCart(api);
    }

    if (!data || !data.items) {
      // If data is invalid, fetch fresh cart from backend
      return fetchCart(api);
    }

    const items = (data.items || []).map((item: any) => ({
      menuItemId: item.menuItemId || item.id,
      name: item.name,
      priceCents: item.priceCents,
      quantity: item.quantity,
      availableQty: item.availableQty || 999,
      chefId: item.chefId,
      chefName: item.chefName
    }));

    const totalCents = items.reduce((sum: number, item: CartItem) => sum + (item.priceCents * item.quantity), 0);

    return { items, totalCents };
  } catch (error) {
    console.error('Error updating cart:', error);
    return null;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  api: ReturnType<typeof useApi>,
  menuItemId: number
): Promise<CartResponse | null> {
  return updateCartItem(api, menuItemId, 0);
}

/**
 * Clear entire cart by removing all items individually
 */
export async function clearCart(api: ReturnType<typeof useApi>): Promise<boolean> {
  try {
    // First, fetch current cart items
    const cart = await fetchCart(api);

    if (cart.items.length === 0) {
      return true; // Already empty
    }

    // Remove each item individually
    for (const item of cart.items) {
      try {
        await api.delete(`/cart/remove/${item.menuItemId}`);
      } catch (error) {
        console.error(`Failed to remove item ${item.menuItemId}:`, error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}
