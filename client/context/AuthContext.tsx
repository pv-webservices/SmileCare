"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-base";
import { getPendingBooking } from "@/lib/booking-session";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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
  register: (name: string, email: string, phone: string, password: string, callbackUrl?: string) => Promise<{ success: boolean; email?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  loginWithGoogle: (callbackUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sets a lightweight non-HttpOnly cookie that middleware can read to check
// auth status. The actual JWT is in the HttpOnly 'accessToken' cookie managed
// server-side. Never store the JWT itself in a readable cookie.
function setAuthFlagCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "smilecare_auth=1; path=/; SameSite=Lax; max-age=604800";
}

function clearAuthFlagCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "smilecare_auth=; path=/; SameSite=Lax; max-age=0";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = (await res.json()) as User;
        setUser(data);
        setAuthFlagCookie();
        return data;
      }
      if (res.status !== 401) {
        console.warn("Failed to refresh user", res.status);
      }
      setUser(null);
      clearAuthFlagCookie();
      return null;
    } catch {
      setUser(null);
      clearAuthFlagCookie();
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
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
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
      // Set user from response immediately (avoid double network call)
      if (data.user) {
        setUser(data.user as User);
      }
      // Set auth flag cookie so middleware can guard protected routes
      setAuthFlagCookie();
      // Clean up any old prefill data
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("smilecare_prefill");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    callbackUrl = "/dashboard"
  ): Promise<{ success: boolean; email?: string }> => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
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
      // Store ONLY the email for prefill (never store password)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("smilecare_prefill", JSON.stringify({ email }));
      }
      const target = callbackUrl || "/dashboard";
      const nextUrl = `/login?registered=1&callbackUrl=${encodeURIComponent(target)}`;
      setTimeout(() => {
        router.push(nextUrl);
      }, 1500);
      // Return only email, never password
      return { success: true, email };
    } catch (err: unknown) {
      console.error("Registration error:", err);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      clearAuthFlagCookie();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("smilecare_prefill");
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
      if (!isSupabaseConfigured) {
        toastError(
          "Google sign-in is not configured yet. Please try email login or add the Supabase public env vars."
        );
        return;
      }
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
