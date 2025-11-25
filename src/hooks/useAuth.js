// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import api from '../services/apiService';

/**
 * Custom hook for authentication
 * Manages user state and authentication operations
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = api.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const result = await api.auth.login(username, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
    checkAuth
  };
}