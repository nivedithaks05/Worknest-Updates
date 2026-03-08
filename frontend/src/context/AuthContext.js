import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  });
  const [initializing, setInitializing] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    // Optionally we could validate token here against backend.
    setInitializing(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post("auth/login/", { username, password });
    const { token: newToken, user: userData } = response.data;

    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, initializing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
