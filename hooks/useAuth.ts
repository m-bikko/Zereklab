'use client';

import { useEffect, useState } from 'react';

const AUTH_KEY = 'zereklab_admin_auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_KEY);
        if (authData) {
          const { timestamp, isAuthenticated } = JSON.parse(authData);
          const now = Date.now();
          const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

          // Check if session is still valid (4 hours)
          if (isAuthenticated && now - timestamp < FOUR_HOURS) {
            setAuthState({ isAuthenticated: true, isLoading: false });
            return;
          } else {
            // Session expired, remove it
            localStorage.removeItem(AUTH_KEY);
          }
        }
        setAuthState({ isAuthenticated: false, isLoading: false });
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem(AUTH_KEY);
        setAuthState({ isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const authData = {
          isAuthenticated: true,
          timestamp: Date.now(),
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setAuthState({ isAuthenticated: true, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState({ isAuthenticated: false, isLoading: false });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
