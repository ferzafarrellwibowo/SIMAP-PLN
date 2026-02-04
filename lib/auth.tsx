// ============================================
// AUTH CONTEXT - Role-based Access Control
// ============================================

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { User, UserRole } from "./types";

// Storage keys
const AUTH_STORAGE_KEY = "auth_user";
const AUTH_EXPIRY_KEY = "auth_expiry";

// Session expiry time in milliseconds (15 minutes)
const SESSION_EXPIRY_MS = 15 * 60 * 1000;

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export type Permission =
  | "view_dashboard"
  | "view_all_projects"
  | "view_own_projects"
  | "create_project"
  | "edit_project"
  | "delete_project"
  | "input_plan"
  | "input_progress"
  | "input_cost"
  | "approve_project"
  | "change_status"
  | "view_reports"
  | "export_reports"
  | "manage_users";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_all_projects",
    "create_project",
    "edit_project",
    "delete_project",
    "input_plan",
    "view_reports",
    "export_reports",
    "manage_users",
  ],
  pic: [
    "view_dashboard",
    "view_own_projects",
    "input_progress",
    "input_cost",
    "view_reports",
  ],
  keuangan: [
    "view_dashboard",
    "view_all_projects",
    "view_reports",
    "export_reports",
  ],
  manajer: [
    "view_dashboard",
    "view_all_projects",
    "approve_project",
    "change_status",
    "view_reports",
    "export_reports",
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
    username: "siti.pic",
    name: "Siti Rahayu",
    email: "siti.rahayu@pln.co.id",
    role: "pic",
    unit: "PLN UP3 Bandung",
    createdAt: "2025-01-01",
  },
  {
    id: "USR-004",
    username: "dewi.keuangan",
    name: "Dewi Lestari",
    email: "dewi.lestari@pln.co.id",
    role: "keuangan",
    unit: "PLN Pusat",
    createdAt: "2025-01-01",
  },
  {
    id: "USR-005",
    username: "ahmad.manajer",
    name: "Falih Akmal Dewanda",
    email: "falih@pln.co.id",
    role: "manajer",
    unit: "PLN Pusat",
    createdAt: "2025-01-01",
  },
];

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
  canAccessProject: (projectPicId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to check if session is valid
function isSessionValid(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (!expiry) return false;
    return Date.now() < parseInt(expiry, 10);
  } catch {
    return false;
  }
}

// Helper function to get stored user if session is valid
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    if (!isSessionValid()) {
      // Session expired, clear storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
      return null;
    }
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Helper function to store user with expiry
function storeUserWithExpiry(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_EXPIRY_KEY, (Date.now() + SESSION_EXPIRY_MS).toString());
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
    }
  } catch (error) {
    console.error("Error storing auth:", error);
  }
}

// Helper function to refresh session expiry
function refreshSessionExpiry(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      localStorage.setItem(AUTH_EXPIRY_KEY, (Date.now() + SESSION_EXPIRY_MS).toString());
    }
  } catch (error) {
    console.error("Error refreshing session:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount (with expiry check)
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Verify user exists in mock users
      const validUser = MOCK_USERS.find((u) => u.id === storedUser.id);
      if (validUser) {
        setUser(validUser);
        refreshSessionExpiry(); // Refresh on page load
      } else {
        storeUserWithExpiry(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Set up activity listeners to refresh session
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      refreshSessionExpiry();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Periodic session check
    const intervalId = setInterval(() => {
      if (!isSessionValid()) {
        setUser(null);
      }
    }, 60 * 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find user (in real app, validate password on server)
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username || u.email === username
    );
    
    if (foundUser && password === "password123") {
      setUser(foundUser);
      storeUserWithExpiry(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storeUserWithExpiry(null);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role].includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => ROLE_PERMISSIONS[user.role].includes(p));
    },
    [user]
  );

  const canAccessProject = useCallback(
    (projectPicId: string): boolean => {
      if (!user) return false;
      
      // Admin and Manajer can access all
      if (user.role === "admin" || user.role === "manajer" || user.role === "keuangan") {
        return true;
      }
      
      // PIC can only access their own projects
      return user.id === projectPicId;
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
        canAccessProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================
// ROLE LABELS
// ============================================

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  pic: "PIC Proyek",
  keuangan: "Keuangan",
  manajer: "Manajer",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800",
  pic: "bg-blue-100 text-blue-800",
  keuangan: "bg-green-100 text-green-800",
  manajer: "bg-amber-100 text-amber-800",
};
