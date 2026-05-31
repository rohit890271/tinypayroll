"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { US_STATES } from "@/lib/onboarding/us-states";
import { IN_STATES } from "@/lib/onboarding/in-states";
import { createBusinessAction } from "./actions";
import { useToast } from "@/components/ui/toast";

type BusinessFormProps = {
  initialCountryCode: string;
};

export function BusinessForm({ initialCountryCode }: BusinessFormProps) {
  // Use client-side timezone detection to refine the country code if server-side detection fell back to US
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [stateValue, setStateValue] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const { error } = useToast();

  useEffect(() => {
    // If server said US but client-side timezone is clearly Indian Standard Time
    if (initialCountryCode === "US") {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || tz.includes("Calcutta") || tz.includes("Kolkata")) {
          setCountryCode("IN");
        }
      } catch (e) {
        // Safe fallback if Intl is not supported or throws
      }
    }

    // Read referral code from localStorage (set by signup page when ?ref= is present)
    try {
      const storedCode = localStorage.getItem("referral_code");
      if (storedCode) {
        setReferralCode(storedCode);
      }
    } catch {
      // localStorage not available (SSR or browser restriction)
    }
  }, [initialCountryCode]);

  const isIndia = countryCode === "IN";
  const stateLabel = isIndia ? "State / Union Territory" : "US State";
  const statePlaceholder = isIndia ? "Choose a state or UT" : "Choose a state";
  const states = isIndia ? IN_STATES : US_STATES;
  const currency = isIndia ? "INR" : "USD";
  const currencySymbol = isIndia ? "₹" : "$";

  // Reset selected state if country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    setStateValue("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Clear referral code from localStorage after form submission
    try {
      localStorage.removeItem("referral_code");
    } catch {
      // ignore
    }

    startTransition(async () => {
      try {
        await createBusinessAction(formData);
      } catch (err: any) {
        if (err.message && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        error(err?.message || "Something went wrong. Try again.");
      }
    });
  };

  return (
    <div className="grid gap-6">
      {/* Country detection badge */}
      <div className="inline-flex items-center gap-2 self-start rounded-full border border-success-action/30 bg-primary-container px-4 py-2">
        <span className="text-lg">{isIndia ? "🇮🇳" : "🇺🇸"}</span>
        <span className="text-sm font-semibold text-success-action">
          Active Workspace Region: {isIndia ? "India" : "United States"} · {currency} ({currencySymbol})
        </span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-soft sm:p-8">
        {/* Hidden fields to submit detected/chosen country and currency */}
        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="currency_code" value={currency} />
        {/* Hidden referral code from localStorage */}
        {referralCode && (
          <input type="hidden" name="referral_code" value={referralCode} />
        )}

        <div className="grid gap-5">
          <Input 
            label="Business name" 
            name="name" 
            placeholder={isIndia ? "Oak Street Solutions" : "Oak Street Bakery"} 
            required 
          />

          <Select 
            label="Country" 
            name="country_select" 
            value={countryCode} 
            onChange={handleCountryChange}
            required
          >
            <option value="US">United States</option>
            <option value="IN">India</option>
          </Select>

          <Select 
            label={stateLabel} 
            name="state" 
            value={stateValue} 
            onChange={(e) => setStateValue(e.target.value)}
            required
          >
            <option value="" disabled>
              {statePlaceholder}
            </option>
            {states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </Select>

          {referralCode && (
            <div className="flex items-center gap-2 rounded-xl bg-primary-container border border-success-action/30 px-4 py-2.5 text-sm text-success-action">
              <span>🎉</span>
              <span>Referral code <strong>{referralCode}</strong> applied!</span>
            </div>
          )}

          <Button type="submit" loading={isPending}>Save business</Button>
        </div>
      </form>
    </div>
  );
}
