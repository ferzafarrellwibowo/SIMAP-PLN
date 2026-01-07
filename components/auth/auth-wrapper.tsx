"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import LoginPage from "@/components/auth/login-page";
import { AppShell } from "@/components/layout/app-shell";

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppShell>{children}</AppShell>;
}
