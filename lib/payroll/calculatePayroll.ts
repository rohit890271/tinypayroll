import type { Employee, CalculateOptions, PayrollResult, PayrollResultUS, PayrollResultIN } from "./types";
import { calculateUS } from "./engines/us";
import { calculateIN } from "./engines/in";

export type { PayrollResult, PayrollResultUS, PayrollResultIN };

export function calculateEmployeePayroll(
  employee: Employee,
  hoursWorked: number = 0,
  overtimeHours: number = 0,
  unpaidLeaveDays: number = 0,
  bonusAmount: number = 0,
  options: CalculateOptions = {}
): PayrollResult {
  const country = employee.country_code ?? "US";
  const currentMonth = options.currentMonth ?? new Date().getMonth() + 1;

  if (country === "IN") {
    return calculateIN(
      employee,
      hoursWorked,
      overtimeHours,
      unpaidLeaveDays,
      bonusAmount,
      currentMonth
    ) as PayrollResult;
  }

  return calculateUS(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount) as PayrollResult;
}