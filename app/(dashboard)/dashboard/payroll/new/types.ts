// Shared types for the /dashboard/payroll/new route.
// Single neutral .ts file — no server-only or client-only imports —
// so all files in this route can safely import from here.

import type { Employee } from "@/lib/data/business";

// ── Business context (server → client) ────────────────────────────────────────
export type BusinessWithCountry = {
  id: string;
  name: string;
  state: string;
  country_code: string;
  currency_code: string;
};

// ── Payroll calculation result (union of US + IN engine output) ───────────────
export type PayrollCalc = {
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  employer_total_cost: number;
  // US fields
  federal_tax?: number;
  social_security?: number;
  medicare?: number;
  // IN fields
  tds?: number;
  employee_pf?: number;
  employee_esi?: number;
  professional_tax?: number;
};

// ── Per-employee form inputs ───────────────────────────────────────────────────
export type RowInputs = {
  hoursWorked: string;
  overtimeHours: string;
  unpaidLeaveDays: string;
  bonusAmount: string;
};

// ── Employee enriched with business country_code ──────────────────────────────
export type EnrichedEmployee = Employee & { country_code: string };
