"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Storage key used by the client auth provider
const AUTH_STORAGE_KEY = "simap_auth_user";

export default function Home() {
  const router = useRouter();

  // Ensure the app entry always lands on the login page.
  // Clear any persisted client-side auth (localStorage) to avoid
  // an immediate client-side redirect back to dashboard.
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      // ignore if localStorage not available
    }
    router.replace("/login");
  }, [router]);

  return null;
}
