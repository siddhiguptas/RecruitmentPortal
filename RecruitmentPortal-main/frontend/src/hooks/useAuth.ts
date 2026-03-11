import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: any) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData: any) => {
    const registeredUser = await authService.register(userData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };
};
