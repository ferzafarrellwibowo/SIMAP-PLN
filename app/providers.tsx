"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ProjectStoreProvider } from "@/lib/store";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProjectStoreProvider>
        <AuthWrapper>{children}</AuthWrapper>
      </ProjectStoreProvider>
    </AuthProvider>
  );
}
