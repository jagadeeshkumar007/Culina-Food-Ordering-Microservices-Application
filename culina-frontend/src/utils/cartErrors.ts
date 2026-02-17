/**
 * Cart-related error types and handlers
 * Provides consistent error handling across cart operations
 */

export enum CartErrorType {
  ITEM_OUT_OF_STOCK = 'ITEM_OUT_OF_STOCK',
  QUANTITY_EXCEEDED = 'QUANTITY_EXCEEDED',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  CART_SYNC_FAILED = 'CART_SYNC_FAILED',
  INVALID_CART_STATE = 'INVALID_CART_STATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class CartError extends Error {
  constructor(
    public type: CartErrorType,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CartError';
  }
}

/**
 * Parse cart-related API error responses
 */
export function parseCartError(response: Response): CartError {
  const status = response.status;

  if (status === 401 || status === 403) {
    return new CartError(
      CartErrorType.UNAUTHORIZED,
      'Please log in to use cart'
    );
  }

  if (status === 404) {
    return new CartError(
      CartErrorType.ITEM_NOT_FOUND,
      'Item not found or unavailable'
    );
  }

  if (status === 400) {
    return new CartError(
      CartErrorType.INVALID_CART_STATE,
      'Invalid cart operation. Please refresh and try again.'
    );
  }

  if (status === 409) {
    return new CartError(
      CartErrorType.ITEM_OUT_OF_STOCK,
      'Item is out of stock or quantity not available'
    );
  }

  if (status >= 500) {
    return new CartError(
      CartErrorType.NETWORK_ERROR,
      'Server error. Please try again later.'
    );
  }

  return new CartError(
    CartErrorType.UNKNOWN,
    'Failed to update cart. Please try again.'
  );
}

/**
 * Parse network errors
 */
export function parseNetworkError(error: unknown): CartError {
  if (error instanceof TypeError) {
    return new CartError(
      CartErrorType.NETWORK_ERROR,
      'Network connection failed. Please check your internet.',
      error
    );
  }

  if (error instanceof Error) {
    return new CartError(
      CartErrorType.UNKNOWN,
      error.message,
      error
    );
  }

  return new CartError(
    CartErrorType.UNKNOWN,
    'An unexpected error occurred',
    undefined
  );
}

/**
 * User-friendly error messages
 */
export function getErrorMessage(error: CartError | Error): string {
  if (error instanceof CartError) {
    switch (error.type) {
      case CartErrorType.ITEM_OUT_OF_STOCK:
        return '❌ This item is out of stock. Please try another item.';
      case CartErrorType.QUANTITY_EXCEEDED:
        return '❌ Quantity exceeds available stock.';
      case CartErrorType.ITEM_NOT_FOUND:
        return '❌ Item not found. It may have been removed.';
      case CartErrorType.UNAUTHORIZED:
        return '❌ Please log in to use cart features.';
      case CartErrorType.NETWORK_ERROR:
        return '❌ Network error. Please check your connection.';
      case CartErrorType.CART_SYNC_FAILED:
        return '⚠️ Cart sync failed. Your data may be out of sync.';
      case CartErrorType.INVALID_CART_STATE:
        return '⚠️ Cart state is invalid. Refreshing...';
      default:
        return error.message || 'Failed to update cart.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Validate cart item before adding
 */
export function validateCartItem(
  menuItemId: number,
  quantity: number,
  availableQty: number
): CartError | null {
  if (!menuItemId || menuItemId <= 0) {
    return new CartError(
      CartErrorType.INVALID_CART_STATE,
      'Invalid item'
    );
  }

  if (quantity <= 0) {
    return new CartError(
      CartErrorType.INVALID_CART_STATE,
      'Quantity must be at least 1'
    );
  }

  if (quantity > availableQty) {
    return new CartError(
      CartErrorType.QUANTITY_EXCEEDED,
      `Only ${availableQty} items available`
    );
  }

  return null;
}

/**
 * Retry strategy for cart operations
 */
export async function retryCartOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw lastError || new CartError(
    CartErrorType.UNKNOWN,
    'Operation failed after multiple attempts'
  );
}
