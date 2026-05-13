/**
 * India Payroll Engine — TinyPayroll
 *
 * Regime: New Tax Regime FY2025-26
 * Pay schedule: 12 monthly pay periods
 * PT default: Maharashtra
 */

const PAY_PERIODS = 12;

// ── Provident Fund ───────────────────────────────────────────────────────────
const PF_RATE = 0.12;                 // 12% of basic
const PF_MONTHLY_CAP = 1800;         // ₹1,800/month cap on contribution

// ── Employee State Insurance ─────────────────────────────────────────────────
const ESI_GROSS_THRESHOLD = 21000;   // ESI applies only if gross ≤ ₹21,000
const ESI_EMPLOYEE_RATE = 0.0075;    // 0.75%
const ESI_EMPLOYER_RATE = 0.0325;    // 3.25%

// ── Professional Tax — Maharashtra ──────────────────────────────────────────
// Feb (month=2) attracts ₹300 instead of ₹200
function getProfessionalTax(grossMonthly, currentMonth) {
  if (grossMonthly < 7500) return 0;
  if (grossMonthly <= 10000) return 175;
  return currentMonth === 2 ? 300 : 200;
}

// ── TDS — New Regime FY2025-26 ───────────────────────────────────────────────
// Standard deduction of ₹75,000 applied first, then progressive slabs
const STANDARD_DEDUCTION_ANNUAL = 75000;

const TDS_SLABS = [
  { min: 0,        max: 400000,  rate: 0.00 },
  { min: 400000,   max: 800000,  rate: 0.05 },
  { min: 800000,   max: 1200000, rate: 0.10 },
  { min: 1200000,  max: 1600000, rate: 0.15 },
  { min: 1600000,  max: 2000000, rate: 0.20 },
  { min: 2000000,  max: 2400000, rate: 0.25 },
  { min: 2400000,  max: Infinity, rate: 0.30 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Calculates annual TDS under New Regime.
 * @param {number} annualGross
 * @returns {number} annual TDS
 */
function annualTDS(annualGross) {
  const taxableIncome = Math.max(0, annualGross - STANDARD_DEDUCTION_ANNUAL);
  let tax = 0;

  for (const slab of TDS_SLABS) {
    if (taxableIncome <= slab.min) break;
    const taxable = Math.min(taxableIncome, slab.max) - slab.min;
    tax += taxable * slab.rate;
  }

  return tax;
}

/**
 * In India, Basic salary is conventionally ~50% of gross CTC.
 * PF is calculated on basic salary.
 */
function getBasicSalary(gross) {
  return gross * 0.5;
}

/**
 * Calculates gross monthly pay for an Indian payroll.
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

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Calculates India payroll for a single pay period (monthly).
 *
 * @param {object} employee
 *   @param {'hourly'|'salary'} employee.pay_type
 *   @param {number|null} employee.hourly_rate
 *   @param {number|null} employee.annual_salary
 * @param {number} [hoursWorked=0]
 * @param {number} [overtimeHours=0]
 * @param {number} [unpaidLeaveDays=0]
 * @param {number} [bonusAmount=0]
 * @param {number} [currentMonth] - 1-12. Defaults to current calendar month.
 *
 * @returns {object} Full payroll breakdown
 */
export function calculateIN(
  employee,
  hoursWorked = 0,
  overtimeHours = 0,
  unpaidLeaveDays = 0,
  bonusAmount = 0,
  currentMonth = new Date().getMonth() + 1
) {
  const gross = round2(
    calculateGross(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount)
  );

  const basic_salary = round2(getBasicSalary(gross));

  // ── Provident Fund ────────────────────────────────────────────────────────
  const pfBase = Math.min(basic_salary, PF_MONTHLY_CAP / PF_RATE); // cap reversal
  const rawEmployeePF = round2(pfBase * PF_RATE);
  const employee_pf = Math.min(rawEmployeePF, PF_MONTHLY_CAP);
  const employer_pf = employee_pf; // employer matches 1:1 up to same cap

  // ── ESI ───────────────────────────────────────────────────────────────────
  let employee_esi = 0;
  let employer_esi = 0;
  if (gross <= ESI_GROSS_THRESHOLD) {
    employee_esi = round2(gross * ESI_EMPLOYEE_RATE);
    employer_esi = round2(gross * ESI_EMPLOYER_RATE);
  }

  // ── Professional Tax ──────────────────────────────────────────────────────
  const professional_tax = getProfessionalTax(gross, currentMonth);

  // ── TDS (New Regime) ──────────────────────────────────────────────────────
  // Annualise current gross, compute annual tax, divide by 12
  const annualGross = gross * PAY_PERIODS;
  const annualTax = annualTDS(annualGross);
  const tds = round2(annualTax / PAY_PERIODS);

  // ── Totals ────────────────────────────────────────────────────────────────
  const total_deductions = round2(employee_pf + employee_esi + professional_tax + tds);
  const net_pay = round2(gross - total_deductions);

  const employer_total_cost = round2(gross + employer_pf + employer_esi);

  return {
    country: "IN",
    currency: "INR",
    pay_type: employee.pay_type,
    hours_worked: hoursWorked,
    overtime_hours: overtimeHours,
    unpaid_leave_days: unpaidLeaveDays,
    bonus_amount: Number(bonusAmount),
    gross_pay: gross,
    basic_salary,
    employee_pf,
    employer_pf,
    employee_esi,
    employer_esi,
    professional_tax,
    tds,
    total_deductions,
    net_pay,
    employer_total_cost,
  };
}
