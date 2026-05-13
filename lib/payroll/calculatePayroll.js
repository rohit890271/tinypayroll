/**
 * Country switcher — routes to the correct payroll engine
 * based on employee.country_code (inherits from business).
 */

import { calculateUS } from "./engines/us.js";
import { calculateIN } from "./engines/in.js";

/**
 * Calculates payroll for an employee, routing to the correct
 * country-specific engine automatically.
 *
 * @param {object} employee       - Employee record from DB
 * @param {number} [hoursWorked=0]
 * @param {number} [overtimeHours=0]
 * @param {number} [unpaidLeaveDays=0]
 * @param {number} [bonusAmount=0]
 * @param {object} [options={}]
 *   @param {number} [options.currentMonth] - 1-12 (used for India PT logic)
 *
 * @returns {object} Full payroll breakdown for the employee's country
 */
export function calculateEmployeePayroll(
  employee,
  hoursWorked = 0,
  overtimeHours = 0,
  unpaidLeaveDays = 0,
  bonusAmount = 0,
  options = {}
) {
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
    );
  }

  return calculateUS(employee, hoursWorked, overtimeHours, unpaidLeaveDays, bonusAmount);
}
