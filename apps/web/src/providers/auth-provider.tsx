'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApiClient } from '@atomic-ai/utils';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = new ApiClient({
  baseURL: API_URL,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * Get current user from API
   */
  const getCurrentUser = useCallback(async () => {
    try {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get<{ id: string; email: string; name: string }>(
        '/auth/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(response);
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // Try to get access token from sessionStorage
      const storedToken = sessionStorage.getItem('accessToken');
      if (storedToken) {
        setAccessToken(storedToken);
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Fetch current user when access token changes
   */
  useEffect(() => {
    if (accessToken) {
      getCurrentUser();
    }
  }, [accessToken, getCurrentUser]);

  /**
   * Login user
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await apiClient.post<{
          accessToken: string;
          user: User;
        }>('/auth/login', {
          email,
          password,
        });

        setAccessToken(response.accessToken);
        sessionStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Register user
   */
  const register = useCallback(
    async (email: string, name: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await apiClient.post<{
          accessToken: string;
          user: User;
        }>('/auth/register', {
          email,
          name,
          password,
        });

        setAccessToken(response.accessToken);
        sessionStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      if (accessToken) {
        await apiClient.post(
          '/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('accessToken');
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await apiClient.post<{
        accessToken: string;
        user: User;
      }>('/auth/refresh');

      setAccessToken(response.accessToken);
      sessionStorage.setItem('accessToken', response.accessToken);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setAccessToken(null);
      setUser(null);
      sessionStorage.removeItem('accessToken');
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAccessToken,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
