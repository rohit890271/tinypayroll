import type { Employee } from "../types";

const PAY_PERIODS = 12;

const PF_RATE = 0.12;
const PF_MONTHLY_CAP = 1800;

const ESI_GROSS_THRESHOLD = 21000;
const ESI_EMPLOYEE_RATE = 0.0075;
const ESI_EMPLOYER_RATE = 0.0325;

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

const round2 = (n: number): number => Math.round(n * 100) / 100;

function getProfessionalTax(grossMonthly: number, currentMonth: number): number {
  if (grossMonthly < 7500) return 0;
  if (grossMonthly <= 10000) return 175;
  return currentMonth === 2 ? 300 : 200;
}

function annualTDS(annualGross: number): number {
  const taxableIncome = Math.max(0, annualGross - STANDARD_DEDUCTION_ANNUAL);
  let tax = 0;

  for (const slab of TDS_SLABS) {
    if (taxableIncome <= slab.min) break;
    const taxable = Math.min(taxableIncome, slab.max) - slab.min;
    tax += taxable * slab.rate;
  }

  return tax;
}

function getBasicSalary(gross: number): number {
  return gross * 0.5;
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

export function calculateIN(
  employee: Employee,
  hoursWorked: number = 0,
  overtimeHours: number = 0,
  unpaidLeaveDays: number = 0,
  bonusAmount: number = 0,
  currentMonth: number = new Date().getMonth() + 1
) {
  const gross = round2(
    calculateGross(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount)
  );

  const basic_salary = round2(getBasicSalary(gross));

  const pfBase = Math.min(basic_salary, PF_MONTHLY_CAP / PF_RATE);
  const rawEmployeePF = round2(pfBase * PF_RATE);
  const employee_pf = Math.min(rawEmployeePF, PF_MONTHLY_CAP);
  const employer_pf = employee_pf;

  let employee_esi = 0;
  let employer_esi = 0;
  if (gross <= ESI_GROSS_THRESHOLD) {
    employee_esi = round2(gross * ESI_EMPLOYEE_RATE);
    employer_esi = round2(gross * ESI_EMPLOYER_RATE);
  }

  const professional_tax = getProfessionalTax(gross, currentMonth);

  const annualGross = gross * PAY_PERIODS;
  const annualTax = annualTDS(annualGross);
  const tds = round2(annualTax / PAY_PERIODS);

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