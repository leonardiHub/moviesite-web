"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  permissions: string[];
  roles: string[];
}

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  name: string;
  permissions: string[];
  type: string;
  iat: number;
  exp: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as TokenPayload;
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  }, []);

  // Check auth status with token validation
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log("Token expired, logging out");
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/v1/admin/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token might be expired, try to refresh
        await tryRefreshToken();
      } else {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("admin_token");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [isTokenExpired]);

  // Try to refresh the token
  const tryRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("admin_refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/v1/admin/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        console.log("Token refreshed successfully");
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      setIsAuthenticated(false);
    }
  };

  // Set up periodic token validation
  useEffect(() => {
    checkAuthStatus();

    // Check token every 5 minutes
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuthStatus, isAuthenticated]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/v1/admin/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.access_token);
        // Store refresh token if available (for future implementation)
        if (data.refresh_token) {
          localStorage.setItem("admin_refresh_token", data.refresh_token);
        }
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.message || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={user!} onLogout={handleLogout} />;
}
