"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPendingBooking } from "@/lib/booking-session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; email?: string; password?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  loginWithGoogle: (callbackUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = (await res.json()) as User;
        setUser(data);
        return data;
      }

      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const apiMessage = data.message || data.error || "Login failed";
        const msg = String(apiMessage).toLowerCase();

        if (res.status === 404 || msg.includes("not found") || msg.includes("no user") || msg.includes("does not exist")) {
          throw { type: "USER_NOT_FOUND", message: apiMessage };
        }

        if (res.status === 401 || msg.includes("incorrect") || msg.includes("invalid")) {
          throw { type: "INVALID_CREDENTIALS", message: apiMessage };
        }

        throw new Error(apiMessage);
      }

      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("smilecare_token", data.token);
      }

      if (data.user) {
        setUser(data.user as User);
      }

      await refreshUser();

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("smilecare_prefill");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; email?: string; password?: string }> => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || data.error || "Registration failed";
        toastError(msg);
        throw new Error(msg);
      }

      success("Registration successful! Redirecting to login...");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("smilecare_prefill", JSON.stringify({ email, password }));
      }

      setTimeout(() => {
        router.push("/login");
      }, 1500);

      return { success: true, email, password };
    } catch (err: unknown) {
      console.error("Registration error:", err);
      return { success: false }; 
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("smilecare_prefill");
        localStorage.removeItem("smilecare_token");
      }
      success("Logged out successfully!");
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      toastError("Logout failed");
    }
  };

  const loginWithGoogle = async (callbackUrl = "/dashboard") => {
    try {
      const pendingBooking = getPendingBooking();
      const target = pendingBooking?.callbackUrl || callbackUrl;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(target)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      toastError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
