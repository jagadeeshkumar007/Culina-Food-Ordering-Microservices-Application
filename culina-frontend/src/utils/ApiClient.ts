// utils/api.ts
type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

class ApiClient {
  private baseURL: string;
  private getAccessToken: () => string | null;
  private getTokenExpiry: () => number | null;
  private refreshAccessToken: () => Promise<boolean>;

  constructor(
    baseURL: string,
    getAccessToken: () => string | null,
    getTokenExpiry: () => number | null,
    refreshAccessToken: () => Promise<boolean>
  ) {
    this.baseURL = baseURL;
    this.getAccessToken = getAccessToken;
    this.getTokenExpiry = getTokenExpiry;
    this.refreshAccessToken = refreshAccessToken;
  }

  private isTokenExpiringSoon(expiry: number): boolean {
    const timeUntilExpiry = expiry - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
  }

  private getBaseURL(endpoint: string): string {
    if (endpoint.startsWith('/auth')) {
      return 'http://localhost:8080';
    } else if (endpoint.startsWith('/chefs') || endpoint.startsWith('/admin') || endpoint.startsWith('/order') || endpoint.startsWith('/menu') || endpoint.startsWith('/menus')) {
      return 'http://localhost:8081';
    } else if (endpoint.startsWith('/cart')) {
      return 'http://localhost:8083';
    } else if (endpoint.startsWith('/search')) {
      return 'http://localhost:8084';
    } else if (endpoint.startsWith('/payment')) {
      return 'http://localhost:8082';
    } else {
      return this.baseURL; // default
    }
  }

  async fetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuth, ...fetchOptions } = options;

    // Check and refresh token if needed
    if (!skipAuth) {
      const tokenExpiry = this.getTokenExpiry();
      if (tokenExpiry && this.isTokenExpiringSoon(tokenExpiry)) {
        console.log('Token expiring soon, refreshing before request...');
        await this.refreshAccessToken();
      }
    }

    // Prepare headers
    const headers = new Headers(fetchOptions.headers);

    // If body is FormData, do not set Content-Type so the browser can add the multipart boundary.
    const isFormData = fetchOptions.body instanceof FormData;
    if (!isFormData && !headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add authorization header
    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Make request with network error handling and optional retry for GET
    const baseURL = this.getBaseURL(endpoint);
    const url = `${baseURL}${endpoint}`;

    const maxRetries = (fetchOptions.method === 'GET') ? 2 : 1;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        let response = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        // If 401, try to refresh token and retry once
        if (response.status === 401 && !skipAuth) {
          console.log('Received 401, attempting token refresh...');
          const refreshed = await this.refreshAccessToken();

          if (refreshed) {
            const newToken = this.getAccessToken();
            if (newToken) {
              headers.set('Authorization', `Bearer ${newToken}`);
              response = await fetch(url, {
                ...fetchOptions,
                headers,
              });
            }
          }
        }

        return response;
      } catch (err) {
        lastError = err;
        console.error(`Network error fetching ${url} (attempt ${attempt}):`, err);
        // If we'll retry, wait a bit
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, 300 * attempt));
          continue;
        }
        // Exhausted retries, throw a clearer error
        throw new Error(`NetworkError: failed to fetch ${url}: ${String(lastError)}`);
      }
    }

    // Should not reach here
    throw new Error('Unexpected error in ApiClient.fetch');
  }

  async get(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body?: any, options?: FetchOptions) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  async put(endpoint: string, body?: any, options?: FetchOptions) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  async delete(endpoint: string, options?: FetchOptions) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
let apiClientInstance: ApiClient | null = null;

export function createApiClient(
  getAccessToken: () => string | null,
  getTokenExpiry: () => number | null,
  refreshAccessToken: () => Promise<boolean>
): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(
      'http://localhost:8080',
      getAccessToken,
      getTokenExpiry,
      refreshAccessToken
    );
  }
  return apiClientInstance;
}

export function useApi() {
  const getAccessToken = () => localStorage.getItem('accessToken');
  const getTokenExpiry = () => {
    const expiry = localStorage.getItem('tokenExpiry');
    return expiry ? parseInt(expiry) : null;
  };
  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try { 
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      const tokenExpiry = Date.now() + (data.expiresIn * 1000);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('tokenExpiry', tokenExpiry.toString());

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  return createApiClient(getAccessToken, getTokenExpiry, refreshAccessToken);
}