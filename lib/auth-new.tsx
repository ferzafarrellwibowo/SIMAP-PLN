// ============================================
// AUTH CONTEXT - Simplified Role-based Access Control
// Roles: Admin, Operator, Manajemen
// ============================================

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { User, UserRole } from "./types-new";

// Storage key for persisting auth state
const AUTH_STORAGE_KEY = "simap_auth_user";
const AUTH_EXPIRY_KEY = "simap_auth_expiry";

// Session expiry time in milliseconds (15 minutes)
const SESSION_EXPIRY_MS = 15 * 60 * 1000;

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export type Permission =
  | "view_dashboard"
  | "view_contracts"
  | "create_contract"
  | "edit_contract"
  | "delete_contract"
  | "view_invoices"
  | "create_invoice"
  | "edit_invoice"
  | "update_invoice_status"
  | "view_reports"
  | "export_reports"
  | "manage_users"
  | "approve_update_kontrak"
  | "approve_invoice"
  | "approve_progress"
  | "review_perpanjangan"
  | "submit_invoice"
  | "submit_progress"
  | "request_perpanjangan"
  | "view_own_contract";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin (Operator) - Full access untuk mengelola sistem
  admin: [
    "view_dashboard",
    "view_contracts",
    "create_contract",
    "edit_contract",
    "delete_contract",
    "view_invoices",
    "create_invoice",
    "edit_invoice",
    "update_invoice_status",
    "view_reports",
    "export_reports",
    "manage_users",
    "approve_update_kontrak",
    "approve_invoice",
    "approve_progress",
    "review_perpanjangan",
  ],
  // Viewer (Manajer) - Hanya view dan export
  viewer: [
    "view_dashboard",
    "view_contracts",
    "view_invoices",
    "view_reports",
    "export_reports",
  ],
  // Vendor - Akses terbatas ke kontrak sendiri
  vendor: [
    "view_own_contract",
    "view_invoices",
    "submit_invoice",
    "submit_progress",
    "request_perpanjangan",
  ],
};

// ============================================
// MOCK USERS
// ============================================

export const MOCK_USERS: User[] = [
  {
    id: "USR-001",
    username: "admin",
    name: "Ferza Farrell Wibowo",
    email: "frzfarrell@pln.co.id",
    role: "admin",
    unit: "PLN Pusat",
    createdAt: "2025-01-01",
  },
  {
    id: "USR-003",
    username: "manajer",
    name: "Falih Akmal Dewanda",
    email: "falih@pln.co.id",
    role: "viewer",
    unit: "PLN Pusat",
    createdAt: "2025-01-01",
  },
  {
    id: "USR-VENDOR-001",
    username: "vendor.wijaya",
    name: "Andi Pratama",
    email: "andi.pratama@wijayakarya.co.id",
    role: "vendor",
    unit: "PT Wijaya Karya",
    createdAt: "2025-03-15",
    contractId: "CTR-001",
    vendorCompany: "PT Wijaya Karya",
    isActive: true,
    activatedAt: "2025-03-15",
    expiresAt: "2026-06-30",
  },
];

// Role labels untuk display
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  viewer: "Viewer",
  vendor: "Vendor",
};

// Role colors
export const ROLE_COLORS: Record<UserRole, string> = {
  // Use slightly stronger bg in light mode for better contrast on pale card backgrounds
  admin: "bg-blue-200 text-blue-800",
  viewer: "bg-green-200 text-green-800",
  vendor: "bg-orange-200 text-orange-800",
};

// ============================================
// AUTH CONTEXT
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely access localStorage
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    
    if (stored && expiry) {
      const expiryTime = parseInt(expiry, 10);
      const now = Date.now();
      
      // Check if session has expired
      if (now > expiryTime) {
        // Session expired, clear storage
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        console.log("Session expired, redirecting to login...");
        return null;
      }
      
      return JSON.parse(stored) as User;
    }
  } catch (error) {
    console.error("Error reading auth from localStorage:", error);
  }
  return null;
}

// Helper function to store user in localStorage with expiry
function storeUser(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      // Set expiry time to 15 minutes from now
      const expiryTime = Date.now() + SESSION_EXPIRY_MS;
      localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
    }
  } catch (error) {
    console.error("Error storing auth to localStorage:", error);
  }
}

// Helper function to refresh session expiry (call on user activity)
function refreshSessionExpiry(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const expiryTime = Date.now() + SESSION_EXPIRY_MS;
      localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
    }
  } catch (error) {
    console.error("Error refreshing session expiry:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Verify the stored user still exists in our mock users
      const validUser = MOCK_USERS.find((u) => u.id === storedUser.id);
      if (validUser) {
        setUser(validUser);
        // Refresh session expiry on page load (if still valid)
        refreshSessionExpiry();
      } else {
        // Clear invalid stored user
        storeUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Set up activity listeners to refresh session on user interaction
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      refreshSessionExpiry();
    };

    // Listen to user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session expiry periodically (every minute)
    const intervalId = setInterval(() => {
      const storedUser = getStoredUser();
      if (!storedUser) {
        // Session expired, logout
        setUser(null);
      }
    }, 60 * 1000); // Check every 1 minute

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [user]);

  const login = useCallback(async (usernameOrEmail: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const id = usernameOrEmail.trim().toLowerCase();

    // Find user by username OR email (password check is dummy)
    const foundUser = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === id || u.email.toLowerCase() === id
    );

    if (foundUser && password === "password123") {
      // Check vendor account activation and expiry
      if (foundUser.role === "vendor") {
        if (!foundUser.isActive) {
          return false; // Account not activated
        }
        if (foundUser.expiresAt && new Date(foundUser.expiresAt) < new Date()) {
          return false; // Account expired
        }
      }
      setUser(foundUser);
      storeUser(foundUser); // Persist to localStorage
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storeUser(null); // Clear from localStorage
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => ROLE_PERMISSIONS[user.role]?.includes(p));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ROLE_PERMISSIONS };
