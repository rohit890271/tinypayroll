"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutButtonProps = {
  isLoggedIn: boolean;
  hasBusiness: boolean;
  dodoSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
};

export function CheckoutButton({
  isLoggedIn,
  hasBusiness,
  dodoSubscriptionId,
  subscriptionStatus,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push("/login?next=/pricing");
      return;
    }

    if (!hasBusiness) {
      router.push("/onboarding");
      return;
    }

    if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 409) {
        // Already subscribed — redirect to dashboard immediately.
        router.push("/dashboard");
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initiate checkout");
      }

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      return "Go to Dashboard";
    }
    return "Start 7-Day Free Trial";
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-xl bg-error/10 border border-error/30 p-3 text-xs text-error text-center">
          {error}
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-full bg-success-action py-4 text-center text-sm font-black text-on-primary shadow-soft transition hover:opacity-90 disabled:opacity-50"
      >
        {getButtonText()}
      </button>
    </div>
  );
}
