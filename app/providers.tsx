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
