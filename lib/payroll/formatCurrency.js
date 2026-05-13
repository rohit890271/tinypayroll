/**
 * Currency formatter for TinyPayroll.
 * Uses the native Intl.NumberFormat API for locale-correct output.
 *
 * Examples:
 *   formatCurrency(1250.50, 'US')  → "$1,250.50"
 *   formatCurrency(125000, 'IN')   → "₹1,25,000"
 */

/**
 * @param {number} amount
 * @param {'US'|'IN'|string} country - Country code (default 'US')
 * @returns {string} Locale-formatted currency string
 */
export function formatCurrency(amount, country = "US") {
  if (country === "IN") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
