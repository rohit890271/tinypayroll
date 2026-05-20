/**
 * Generates an 8-character unique referral code.
 * Format: "TINY" + 4 alphanumeric chars (uppercase, no ambiguous chars)
 * Example: "TINY4K2M"
 */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(): string {
  let code = "TINY";
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
