"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      try {
        localStorage.setItem("referral_code", ref.toUpperCase().trim());
      } catch {
        // localStorage unavailable, ignore
      }
    }
  }, [searchParams]);

  return null; // renders nothing
}
