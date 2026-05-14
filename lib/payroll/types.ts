export type CountryCode = "US" | "IN" | string;

export type PayrollResultUS = {
  country: "US";
  currency: "USD";
  pay_type: "hourly" | "salary";
  hours_worked: number;
  overtime_hours: number;
  unpaid_leave_days: number;
  bonus_amount: number;
  filing_status: "single" | "married";
  gross_pay: number;
  federal_tax: number;
  social_security: number;
  medicare: number;
  total_deductions: number;
  net_pay: number;
  employer_social_security: number;
  employer_medicare: number;
  employer_total_cost: number;
};

export type PayrollResultIN = {
  country: "IN";
  currency: "INR";
  pay_type: "hourly" | "salary";
  hours_worked: number;
  overtime_hours: number;
  unpaid_leave_days: number;
  bonus_amount: number;
  gross_pay: number;
  basic_salary: number;
  employee_pf: number;
  employer_pf: number;
  employee_esi: number;
  employer_esi: number;
  professional_tax: number;
  tds: number;
  total_deductions: number;
  net_pay: number;
  employer_total_cost: number;
};

export type PayrollResult = PayrollResultUS | PayrollResultIN;

export interface Employee {
  id?: string;
  pay_type: "hourly" | "salary";
  hourly_rate?: number | null;
  annual_salary?: number | null;
  tax_filing_status?: "single" | "married";
  country_code?: string;
}

export type EmployeeInputs = {
  hoursWorked: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  bonusAmount: number;
};

export type CalculateOptions = {
  currentMonth?: number;
};