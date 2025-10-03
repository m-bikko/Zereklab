'use client';

import { useEffect, useState } from 'react';

const SALES_AUTH_KEY = 'zereklab_sales_auth';

interface SalesAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    username: string;
    fullName: string;
  } | null;
}

export const useSalesAuth = () => {
  const [authState, setAuthState] = useState<SalesAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      try {
        // Ensure we're in the browser
        if (typeof window === 'undefined') {
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }

        const authData = localStorage.getItem(SALES_AUTH_KEY);
        
        if (authData) {
          const { timestamp, isAuthenticated, user } = JSON.parse(authData);
          const now = Date.now();
          const EIGHT_HOURS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

          // Check if session is still valid (8 hours)
          if (isAuthenticated && now - timestamp < EIGHT_HOURS) {
            setAuthState({ isAuthenticated: true, isLoading: false, user });
            return;
          } else {
            // Session expired, remove it
            localStorage.removeItem(SALES_AUTH_KEY);
          }
        }
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      } catch (error) {
        console.error('Sales auth check error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SALES_AUTH_KEY);
        }
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/sales-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        const authData = {
          isAuthenticated: true,
          timestamp: Date.now(),
          user: {
            username: userData.username,
            fullName: userData.fullName,
          },
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(SALES_AUTH_KEY, JSON.stringify(authData));
        }
        
        setAuthState({ 
          isAuthenticated: true, 
          isLoading: false, 
          user: authData.user 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sales login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SALES_AUTH_KEY);
    }
    setAuthState({ isAuthenticated: false, isLoading: false, user: null });
  };

  return {
    ...authState,
    login,
    logout,
  };
};