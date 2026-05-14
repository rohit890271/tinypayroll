export type CountryCode = "US" | "IN" | string;

export function formatCurrency(amount: number, country: CountryCode = "US"): string {
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