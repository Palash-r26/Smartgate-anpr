"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "SECURITY";
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "smartgate_token";
const USER_KEY = "smartgate_user";

function decodeGoogleJwt(credential: string): { email: string; name: string; sub: string } {
  const payload = credential.split(".")[1];
  const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  return {
    email: decoded.email,
    name: decoded.name || decoded.given_name || "User",
    sub: decoded.sub,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    persistSession(data.token, data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, role: "SECURITY" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    persistSession(data.token, data.user);
  };

  const loginWithGoogle = async (credential: string) => {
    const profile = decodeGoogleJwt(credential);
    const res = await apiFetch("/api/auth/google-sync", {
      method: "POST",
      body: JSON.stringify({
        email: profile.email,
        name: profile.name,
        googleId: profile.sub,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google sign-in failed");
    persistSession(data.token, data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
