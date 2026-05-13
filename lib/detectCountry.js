/**
 * Auto-detects user country on signup via IP geolocation.
 * Falls back to 'US' if detection fails.
 *
 * Usage (in /app/(onboarding)/business/page.tsx or server action):
 *   const country = await detectUserCountry()
 */

/**
 * Detects the user's country code using ipapi.co.
 * @returns {Promise<string>} Two-letter country code (e.g. 'IN', 'US')
 */
export async function detectUserCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      // Short timeout — don't block onboarding UX
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return "US";
    const data = await res.json();
    return data.country_code ?? "US";
  } catch {
    return "US"; // graceful fallback
  }
}
