/**
 * US Payroll Engine — TinyPayroll
 *
 * Tax year: 2025
 * Pay schedule: 26 bi-weekly pay periods
 * Source: IRS Revenue Procedure 2024-40 (2025 inflation adjustments)
 */

const PAY_PERIODS = 26;

// 2025 federal income tax brackets — Single filer (annual)
const BRACKETS_SINGLE = [
  { min: 0,       max: 11925,   rate: 0.10 },
  { min: 11925,   max: 48475,   rate: 0.12 },
  { min: 48475,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250525,  rate: 0.32 },
  { min: 250525,  max: 626350,  rate: 0.35 },
  { min: 626350,  max: Infinity, rate: 0.37 },
];

// Married filing jointly — thresholds are doubled
const BRACKETS_MARRIED = BRACKETS_SINGLE.map((b) => ({
  min: b.min * 2,
  max: b.max === Infinity ? Infinity : b.max * 2,
  rate: b.rate,
}));

// FICA
const SS_RATE = 0.062;
const SS_WAGE_CAP_ANNUAL = 168600; // 2025
const MEDICARE_RATE = 0.0145;

// ─── Helpers ────────────────────────────────────────────────────────────────

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Calculates annual federal income tax using progressive brackets.
 * @param {number} annualIncome
 * @param {'single'|'married'} filingStatus
 * @returns {number} annual federal tax
 */
function annualFederalTax(annualIncome, filingStatus) {
  const brackets =
    filingStatus === "married" ? BRACKETS_MARRIED : BRACKETS_SINGLE;
  let tax = 0;

  for (const bracket of brackets) {
    if (annualIncome <= bracket.min) break;
    const taxable = Math.min(annualIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }

  return tax;
}

/**
 * Calculates gross pay for one US bi-weekly pay period.
 */
function calculateGross(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount) {
  let base = 0;

  if (employee.pay_type === "hourly") {
    const rate = Number(employee.hourly_rate);
    base = hoursWorked * rate + overtimeHours * rate * 1.5;
  } else if (employee.pay_type === "salary") {
    const annual = Number(employee.annual_salary);
    base = annual / PAY_PERIODS - (annual / 260) * unpaidLeaveDays;
  } else {
    throw new Error(`Unknown pay_type: "${employee.pay_type}". Must be "hourly" or "salary".`);
  }

  return base + Number(bonusAmount);
}

// ─── Main Export ────────────────────────────────────────────────────────────

/**
 * Calculates US payroll for a single pay period.
 *
 * @param {object} employee
 *   @param {'hourly'|'salary'} employee.pay_type
 *   @param {number|null} employee.hourly_rate
 *   @param {number|null} employee.annual_salary
 *   @param {'single'|'married'} employee.tax_filing_status
 * @param {number} [hoursWorked=0]
 * @param {number} [overtimeHours=0]
 * @param {number} [unpaidLeaveDays=0]
 * @param {number} [bonusAmount=0]
 *
 * @returns {object} Full payroll breakdown
 */
export function calculateUS(
  employee,
  hoursWorked = 0,
  overtimeHours = 0,
  unpaidLeaveDays = 0,
  bonusAmount = 0
) {
  const gross = round2(
    calculateGross(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount)
  );

  // ── Federal Income Tax ──────────────────────────────────────────────────
  // Annualise, apply full progressive brackets, then divide by pay periods
  const annualGross = gross * PAY_PERIODS;
  const annualTax = annualFederalTax(annualGross, employee.tax_filing_status ?? "single");
  const federal_tax = round2(annualTax / PAY_PERIODS);

  // ── Social Security (6.2%, capped at $168,600/yr gross) ─────────────────
  const ssWageCapPerPeriod = SS_WAGE_CAP_ANNUAL / PAY_PERIODS;
  const ssWage = Math.min(gross, ssWageCapPerPeriod);
  const social_security = round2(ssWage * SS_RATE);

  // ── Medicare (1.45%, no cap) ─────────────────────────────────────────────
  const medicare = round2(gross * MEDICARE_RATE);

  // ── Totals ───────────────────────────────────────────────────────────────
  const total_deductions = round2(federal_tax + social_security + medicare);
  const net_pay = round2(gross - total_deductions);

  // ── Employer share (matches employee FICA; no federal income tax match) ──
  const employer_social_security = social_security;
  const employer_medicare = medicare;
  const employer_total_cost = round2(gross + employer_social_security + employer_medicare);

  return {
    country: "US",
    currency: "USD",
    pay_type: employee.pay_type,
    hours_worked: hoursWorked,
    overtime_hours: overtimeHours,
    unpaid_leave_days: unpaidLeaveDays,
    bonus_amount: Number(bonusAmount),
    filing_status: employee.tax_filing_status ?? "single",
    gross_pay: gross,
    federal_tax,
    social_security,
    medicare,
    total_deductions,
    net_pay,
    employer_social_security,
    employer_medicare,
    employer_total_cost,
  };
}
