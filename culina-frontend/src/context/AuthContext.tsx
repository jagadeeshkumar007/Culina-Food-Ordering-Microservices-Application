// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/utils/ApiClient';

type User = {
  userId: number;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
  tokenExpiry: number;
};

type AuthContextType = {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const api = useApi(); // Call hook at component level

  // Check if token is expiring soon (within 5 minutes)
  const isTokenExpiringSoon = useCallback((expiry: number) => {
    const timeUntilExpiry = expiry - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: storedRefreshToken,
      }, { skipAuth: true });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update stored tokens
      const tokenExpiry = Date.now() + (data.expiresIn * 1000);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('tokenExpiry', tokenExpiry.toString());

      // Update user state
      setUser(prevUser => prevUser ? {
        ...prevUser,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: tokenExpiry,
      } : null);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [api]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user || !user.tokenExpiry) return;

    const checkAndRefresh = async () => {
      if (isTokenExpiringSoon(user.tokenExpiry)) {
        console.log('Token expiring soon, refreshing...');
        await refreshAccessToken();
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up interval to check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, isTokenExpiringSoon, refreshAccessToken]);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');

        if (accessToken && refreshToken && tokenExpiry && userId && email && role) {
          const expiry = parseInt(tokenExpiry);

          // Check if token is expired
          if (expiry < Date.now()) {
            console.log('Token expired, attempting refresh...');
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              setAuthLoading(false);
              return;
            }
            // User will be set by refreshAccessToken
          } else {
            setUser({
              userId: parseInt(userId),
              email,
              role,
              token: accessToken,
              refreshToken,
              tokenExpiry: expiry,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  // context/AuthContext.tsx
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password }, { skipAuth: true });

      if (!response.ok) {
        // Check if we have a refresh token and try to refresh
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken && response.status === 401) {
          console.log('Login failed with 401, attempting to refresh token...');
          try {
            const refreshResponse = await api.post('/auth/refresh', {
              refreshToken: storedRefreshToken,
            }, { skipAuth: true });

            if (refreshResponse.ok) {
              console.log('Token refresh successful, retrying login...');
              const refreshData = await refreshResponse.json();
              const tokenExpiry = Date.now() + (refreshData.expiresIn * 1000);
              
              localStorage.setItem('accessToken', refreshData.accessToken);
              localStorage.setItem('refreshToken', refreshData.refreshToken);
              localStorage.setItem('tokenExpiry', tokenExpiry.toString());

              // Retry login with new token
              const retryResponse = await api.post('/auth/login', { email, password }, { skipAuth: true });
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                const newTokenExpiry = Date.now() + (retryData.expiresIn * 1000);

                localStorage.setItem('accessToken', retryData.accessToken);
                localStorage.setItem('refreshToken', retryData.refreshToken);
                localStorage.setItem('tokenExpiry', newTokenExpiry.toString());
                localStorage.setItem('userId', retryData.userId.toString());
                localStorage.setItem('email', email);
                localStorage.setItem('role', retryData.role);

                const user: User = {
                  userId: retryData.userId,
                  email,
                  role: retryData.role,
                  token: retryData.accessToken,
                  refreshToken: retryData.refreshToken,
                  tokenExpiry: newTokenExpiry,
                };

                setUser(user);
                if (retryData.role === 'admin') {
                  router.push('/admin/chefs');
                } else if (retryData.role === 'chef') {
                  router.push('/chef/resolve');
                } else {
                  router.push('/home');
                }
                return;
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed during login retry:', refreshError);
          }
        }
        
        throw new Error('Invalid email or password');
      }

      const data = await response.json();

      // Calculate token expiry time
      const tokenExpiry = Date.now() + (data.expiresIn * 1000);

      // Store in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('tokenExpiry', tokenExpiry.toString());
      localStorage.setItem('userId', data.userId.toString());
      localStorage.setItem('email', email);
      localStorage.setItem('role', data.role);

      // Set user state
      const user: User = {
        userId: data.userId,
        email,
        role: data.role,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry,
      };

      setUser(user);
      // Redirect based on role
      if (data.role === 'admin') {
        router.push('/admin/chefs');
      } else if (data.role === 'chef') {
        router.push('/chef/resolve');
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}