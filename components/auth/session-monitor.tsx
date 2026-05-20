"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
      
      // If we are signed out or session is null and we are on a protected route, redirect to login
      if ((event === "SIGNED_OUT" || !session) && isProtectedRoute) {
        router.push("/login?expired=true");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
