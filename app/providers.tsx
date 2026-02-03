"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-new";
import { ContractStoreProvider } from "@/lib/store-new";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Pages that don't need sidebar layout
  const noLayoutPages = ["/login"];
  const needsLayout = !noLayoutPages.includes(pathname);

  // Ensure any persisted client-side auth is cleared before mounting AuthProvider.
  // This prevents automatic rehydration that would immediately mark the user
  // as authenticated before the login page can require credentials.
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.removeItem("simap_auth_user");
      localStorage.removeItem("auth_user");
    } catch (e) {
      // ignore
    }
    setCleared(true);
  }, []);

  if (!cleared) return null;

  return (
    <AuthProvider>
      <ContractStoreProvider>
        {needsLayout ? (
          <SidebarLayout>{children}</SidebarLayout>
        ) : (
          children
        )}
      </ContractStoreProvider>
    </AuthProvider>
  );
}
