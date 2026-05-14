import type { Employee } from "../types";

const PAY_PERIODS = 26;

const BRACKETS_SINGLE = [
  { min: 0,       max: 11925,   rate: 0.10 },
  { min: 11925,   max: 48475,   rate: 0.12 },
  { min: 48475,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250525,  rate: 0.32 },
  { min: 250525,  max: 626350,  rate: 0.35 },
  { min: 626350,  max: Infinity, rate: 0.37 },
];

const BRACKETS_MARRIED = BRACKETS_SINGLE.map((b) => ({
  min: b.min * 2,
  max: b.max === Infinity ? Infinity : b.max * 2,
  rate: b.rate,
}));

const SS_RATE = 0.062;
const SS_WAGE_CAP_ANNUAL = 168600;
const MEDICARE_RATE = 0.0145;

const round2 = (n: number): number => Math.round(n * 100) / 100;

function annualFederalTax(annualIncome: number, filingStatus: "single" | "married"): number {
  const brackets = filingStatus === "married" ? BRACKETS_MARRIED : BRACKETS_SINGLE;
  let tax = 0;

  for (const bracket of brackets) {
    if (annualIncome <= bracket.min) break;
    const taxable = Math.min(annualIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }

  return tax;
}

function calculateGross(
  employee: Employee,
  hoursWorked: number,
  overtimeHours: number,
  unpaidLeaveDays: number,
  bonusAmount: number
): number {
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

export function calculateUS(
  employee: Employee,
  hoursWorked: number = 0,
  overtimeHours: number = 0,
  unpaidLeaveDays: number = 0,
  bonusAmount: number = 0
) {
  const gross = round2(
    calculateGross(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount)
  );

  const annualGross = gross * PAY_PERIODS;
  const annualTax = annualFederalTax(annualGross, employee.tax_filing_status ?? "single");
  const federal_tax = round2(annualTax / PAY_PERIODS);

  const ssWageCapPerPeriod = SS_WAGE_CAP_ANNUAL / PAY_PERIODS;
  const ssWage = Math.min(gross, ssWageCapPerPeriod);
  const social_security = round2(ssWage * SS_RATE);

  const medicare = round2(gross * MEDICARE_RATE);

  const total_deductions = round2(federal_tax + social_security + medicare);
  const net_pay = round2(gross - total_deductions);

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