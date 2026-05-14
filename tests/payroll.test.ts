import { describe, expect, it } from "vitest";
import { calculateEmployeePayroll, type PayrollResultUS, type PayrollResultIN } from "../lib/payroll/calculatePayroll";
import { formatCurrency } from "../lib/payroll/formatCurrency";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const round2 = (n: number) => Math.round(n * 100) / 100;
const PAY_PERIODS_US = 26;
const PAY_PERIODS_IN = 12;

// ─── US FIXTURES ─────────────────────────────────────────────────────────────
const usHourlyEmployee = {
  pay_type: "hourly" as const,
  hourly_rate: 15,
  annual_salary: null,
  tax_filing_status: "single" as const,
  country_code: "US",
};

const usSalaryEmployeeMarried = {
  pay_type: "salary" as const,
  hourly_rate: null,
  annual_salary: 60000,
  tax_filing_status: "married" as const,
  country_code: "US",
};

const usSalaryEmployeeSingle = {
  pay_type: "salary" as const,
  hourly_rate: null,
  annual_salary: 60000,
  tax_filing_status: "single" as const,
  country_code: "US",
};

// ─── INDIA FIXTURES ───────────────────────────────────────────────────────────
// Monthly pay → annual = monthly × 12
const inLowSalaryEmployee = {
  pay_type: "salary" as const,
  hourly_rate: null,
  annual_salary: 12000 * 12,  // ₹12,000/month
  tax_filing_status: "single" as const,
  country_code: "IN",
};

const inMidSalaryEmployee = {
  pay_type: "salary" as const,
  hourly_rate: null,
  annual_salary: 25000 * 12,  // ₹25,000/month
  tax_filing_status: "single" as const,
  country_code: "IN",
};

const inHighSalaryEmployee = {
  pay_type: "salary" as const,
  hourly_rate: null,
  annual_salary: 150000 * 12, // ₹1,50,000/month
  tax_filing_status: "single" as const,
  country_code: "IN",
};

// ═══════════════════════════════════════════════════════════════════════════════
// US TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("US — Hourly $15/hr, 40hrs, single filer", () => {
  const result = calculateEmployeePayroll(usHourlyEmployee, 40, 0, 0, 0) as PayrollResultUS;
  // gross = 40 × 15 = $600
  const expectedGross = 600;
  // annualise = 600 × 26 = $15,600. Tax: $11,925 × 10% + (15,600-11,925) × 12%
  const annualGross = expectedGross * PAY_PERIODS_US;
  const annualTax = 11925 * 0.10 + (annualGross - 11925) * 0.12;
  const expectedFederalTax = round2(annualTax / PAY_PERIODS_US);
  const expectedSS = round2(expectedGross * 0.062);
  const expectedMedicare = round2(expectedGross * 0.0145);
  const expectedNet = round2(expectedGross - expectedFederalTax - expectedSS - expectedMedicare);

  it("returns country: US and currency: USD", () => {
    expect(result.country).toBe("US");
    expect(result.currency).toBe("USD");
  });

  it("computes gross = $600", () => {
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("withholds correct progressive federal tax", () => {
    expect(result.federal_tax).toBe(expectedFederalTax);
    expect(result.federal_tax).toBeGreaterThan(0);
  });

  it("withholds Social Security at 6.2%", () => {
    expect(result.social_security).toBe(expectedSS);
  });

  it("withholds Medicare at 1.45%", () => {
    expect(result.medicare).toBe(expectedMedicare);
  });

  it("computes correct net pay", () => {
    expect(result.net_pay).toBe(expectedNet);
  });

  it("returns employer FICA match", () => {
    expect(result.employer_social_security).toBe(expectedSS);
    expect(result.employer_medicare).toBe(expectedMedicare);
    expect(result.employer_total_cost).toBe(round2(expectedGross + expectedSS + expectedMedicare));
  });
});

describe("US — Salary $60,000/yr, married, 1 unpaid day", () => {
  const result = calculateEmployeePayroll(usSalaryEmployeeMarried, 0, 0, 1, 0) as PayrollResultUS;
  // base = 60000/26 = 2307.69..., deduct 60000/260 = 230.77
  const annual = 60000;
  const base = annual / PAY_PERIODS_US;
  const deduction = annual / 260;
  const expectedGross = round2(base - deduction);
  const annualGross = expectedGross * PAY_PERIODS_US;
  // Married brackets: $0-$23,850 → 10%, $23,850-$96,950 → 12%
  const annualTax = 23850 * 0.10 + (annualGross - 23850) * 0.12;
  const expectedFederalTax = round2(annualTax / PAY_PERIODS_US);

  it("deducts unpaid leave from gross", () => {
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("applies married filing brackets (double thresholds)", () => {
    // Married 10% bracket extends to $23,850 (vs $11,925 single)
    // At ~$2,077 gross × 26 = ~$54k annual, still in 12% zone
    expect(result.federal_tax).toBe(expectedFederalTax);
  });

  it("records unpaid_leave_days = 1", () => {
    expect(result.unpaid_leave_days).toBe(1);
  });

  it("records filing_status = married", () => {
    expect(result.filing_status).toBe("married");
  });
});

describe("US — $500 bonus on $5,000 salary base", () => {
  // Use salary employee with annual that gives ~$5,000/period:
  // $5,000 × 26 = $130,000/yr annual salary
  const highSalaryEmployee = {
    ...usSalaryEmployeeSingle,
    annual_salary: 130000,
  };
  const result = calculateEmployeePayroll(highSalaryEmployee, 0, 0, 0, 500) as PayrollResultUS;
  const expectedBase = round2(130000 / PAY_PERIODS_US);
  const expectedGross = round2(expectedBase + 500);

  it("adds bonus AFTER base salary calculation", () => {
    expect(result.bonus_amount).toBe(500);
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("federal tax reflects bonus-inflated income", () => {
    expect(result.federal_tax).toBeGreaterThan(0);
  });

  it("total_deductions equals sum of all components", () => {
    expect(result.total_deductions).toBe(
      round2(result.federal_tax + result.social_security + result.medicare)
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INDIA TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("India — ₹12,000/month (ESI + PF mandatory)", () => {
  const result = calculateEmployeePayroll(inLowSalaryEmployee, 0, 0, 0, 0, { currentMonth: 3 }) as PayrollResultIN;
  const expectedGross = 12000;

  it("returns country: IN and currency: INR", () => {
    expect(result.country).toBe("IN");
    expect(result.currency).toBe("INR");
  });

  it("computes gross = ₹12,000", () => {
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("computes basic_salary = 50% of gross = ₹6,000", () => {
    expect(result.basic_salary).toBe(6000);
  });

  it("deducts Employee PF = 12% of basic (₹720, under ₹1,800 cap)", () => {
    expect(result.employee_pf).toBe(round2(6000 * 0.12)); // ₹720
  });

  it("employer PF matches employee PF", () => {
    expect(result.employer_pf).toBe(result.employee_pf);
  });

  it("deducts ESI (gross ≤ ₹21,000) — employee 0.75%", () => {
    expect(result.employee_esi).toBe(round2(12000 * 0.0075)); // ₹90
  });

  it("employer ESI = 3.25% of gross", () => {
    expect(result.employer_esi).toBe(round2(12000 * 0.0325)); // ₹390
  });

  it("applies Professional Tax (₹175 for ₹7,500–₹10,000 range, ₹200 above ₹10k)", () => {
    expect(result.professional_tax).toBe(200);
  });

  it("net_pay = gross − all deductions", () => {
    const expectedDeductions = round2(
      result.employee_pf + result.employee_esi + result.professional_tax + result.tds
    );
    expect(result.total_deductions).toBe(expectedDeductions);
    expect(result.net_pay).toBe(round2(expectedGross - expectedDeductions));
  });
});

describe("India — ₹25,000/month (no ESI, PF applies)", () => {
  const result = calculateEmployeePayroll(inMidSalaryEmployee, 0, 0, 0, 0, { currentMonth: 5 }) as PayrollResultIN;
  const expectedGross = 25000;

  it("computes gross = ₹25,000", () => {
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("ESI = ₹0 (gross > ₹21,000 threshold)", () => {
    expect(result.employee_esi).toBe(0);
    expect(result.employer_esi).toBe(0);
  });

  it("PF still applies (capped at ₹1,800/month)", () => {
    // basic = 12,500, PF = 12% = 1,500 (under ₹1,800 cap)
    expect(result.employee_pf).toBe(round2(12500 * 0.12)); // ₹1,500
  });

  it("Professional Tax = ₹200 (non-February)", () => {
    expect(result.professional_tax).toBe(200);
  });
});

describe("India — ₹1,50,000/month (high TDS)", () => {
  const result = calculateEmployeePayroll(inHighSalaryEmployee, 0, 0, 0, 0, { currentMonth: 6 }) as PayrollResultIN;
  const expectedGross = 150000;

  it("computes gross = ₹1,50,000", () => {
    expect(result.gross_pay).toBe(expectedGross);
  });

  it("TDS is substantial at high income", () => {
    // Annual gross = ₹1,50,000 × 12 = ₹18,00,000
    // Taxable = 18,00,000 − 75,000 (std deduction) = ₹17,25,000
    // Slabs: 0–4L=0, 4–8L→₹20k, 8–12L→₹40k, 12–16L→₹60k, 16–17.25L→₹25k
    // Annual TDS = ₹1,45,000 → monthly TDS = ₹12,083.33
    expect(result.tds).toBe(round2(145000 / 12));
  });

  it("ESI = ₹0 (way above ₹21,000)", () => {
    expect(result.employee_esi).toBe(0);
  });

  it("PF capped at ₹1,800/month", () => {
    expect(result.employee_pf).toBe(1800);
  });
});

describe("India — ₹10,000 bonus on ₹25,000 base", () => {
  const result = calculateEmployeePayroll(inMidSalaryEmployee, 0, 0, 0, 10000, { currentMonth: 7 }) as PayrollResultIN;
  const expectedGross = 35000;

  it("adds bonus AFTER base salary → gross = ₹35,000", () => {
    expect(result.gross_pay).toBe(expectedGross);
    expect(result.bonus_amount).toBe(10000);
  });

  it("ESI still ₹0 (gross > ₹21,000 even before bonus)", () => {
    expect(result.employee_esi).toBe(0);
  });

  it("total_deductions is consistent", () => {
    expect(result.total_deductions).toBe(
      round2(result.employee_pf + result.employee_esi + result.professional_tax + result.tds)
    );
  });
});

describe("India — February month → PT = ₹300", () => {
  const result = calculateEmployeePayroll(inMidSalaryEmployee, 0, 0, 0, 0, { currentMonth: 2 }) as PayrollResultIN;

  it("professional_tax = ₹300 in February", () => {
    expect(result.professional_tax).toBe(300);
  });
});

describe("India — Professional Tax edge cases", () => {
  it("PT = ₹0 for gross < ₹7,500", () => {
    const poorEmployee = {
      ...inLowSalaryEmployee,
      annual_salary: 6000 * 12, // ₹6,000/month
    };
    const result = calculateEmployeePayroll(poorEmployee, 0, 0, 0, 0, { currentMonth: 5 }) as PayrollResultIN;
    expect(result.professional_tax).toBe(0);
  });

  it("PT = ₹175 for gross ₹7,500–₹10,000", () => {
    const midEmployee = {
      ...inLowSalaryEmployee,
      annual_salary: 9000 * 12, // ₹9,000/month
    };
    const result = calculateEmployeePayroll(midEmployee, 0, 0, 0, 0, { currentMonth: 5 }) as PayrollResultIN;
    expect(result.professional_tax).toBe(175);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-COUNTRY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Cross-country — same base employee, IN vs US", () => {
  const baseEmployee = {
    pay_type: "salary" as const,
    hourly_rate: null,
    annual_salary: 60000,
    tax_filing_status: "single" as const,
  };

  const usResult = calculateEmployeePayroll(
    { ...baseEmployee, country_code: "US" }, 0, 0, 0, 0
  ) as PayrollResultUS;

  const inResult = calculateEmployeePayroll(
    { ...baseEmployee, country_code: "IN" }, 0, 0, 0, 0, { currentMonth: 5 }
  ) as PayrollResultIN;

  it("returns different country codes", () => {
    expect(usResult.country).toBe("US");
    expect(inResult.country).toBe("IN");
  });

  it("returns different currency codes", () => {
    expect(usResult.currency).toBe("USD");
    expect(inResult.currency).toBe("INR");
  });

  it("US result has federal_tax, social_security, medicare", () => {
    expect(usResult).toHaveProperty("federal_tax");
    expect(usResult).toHaveProperty("social_security");
    expect(usResult).toHaveProperty("medicare");
  });

  it("IN result has employee_pf, employee_esi, professional_tax, tds", () => {
    expect(inResult).toHaveProperty("employee_pf");
    expect(inResult).toHaveProperty("employee_esi");
    expect(inResult).toHaveProperty("professional_tax");
    expect(inResult).toHaveProperty("tds");
  });

  it("US result does NOT have India-specific fields", () => {
    expect(usResult).not.toHaveProperty("employee_pf");
    expect(usResult).not.toHaveProperty("tds");
  });

  it("IN result does NOT have US-specific fields", () => {
    expect(inResult).not.toHaveProperty("federal_tax");
    expect(inResult).not.toHaveProperty("social_security");
  });

  it("net_pay differs between countries for same salary", () => {
    expect(usResult.net_pay).not.toBe(inResult.net_pay);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT CURRENCY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    const result = formatCurrency(1250.5, "US");
    expect(result).toContain("$");
    expect(result).toContain("1,250");
  });

  it("formats INR correctly with ₹ symbol", () => {
    const result = formatCurrency(125000, "IN");
    expect(result).toContain("₹");
  });

  it("defaults to USD if country is unrecognised", () => {
    const result = formatCurrency(500, "GB");
    expect(result).toContain("$");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EDGE CASE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Edge cases", () => {
  it("throws on unknown pay_type for US", () => {
    const bad = { pay_type: "contract" as const, country_code: "US", tax_filing_status: "single" as const } as unknown as import("../lib/payroll/types").Employee;
    expect(() => calculateEmployeePayroll(bad, 40)).toThrow(/unknown pay_type/i);
  });

  it("throws on unknown pay_type for IN", () => {
    const bad = { pay_type: "gig" as const, country_code: "IN" } as unknown as import("../lib/payroll/types").Employee;
    expect(() => calculateEmployeePayroll(bad, 40)).toThrow(/unknown pay_type/i);
  });

  it("defaults to US when country_code is undefined", () => {
    const emp = { pay_type: "hourly" as const, hourly_rate: 20, tax_filing_status: "single" as const };
    const result = calculateEmployeePayroll(emp, 40) as PayrollResultUS;
    expect(result.country).toBe("US");
  });

  it("US SS is capped at annual wage base of $168,600", () => {
    const highEarner = {
      pay_type: "salary" as const,
      annual_salary: 500000,
      tax_filing_status: "single" as const,
      country_code: "US",
    };
    const result = calculateEmployeePayroll(highEarner) as PayrollResultUS;
    const maxSSPerPeriod = round2((168600 / 26) * 0.062);
    expect(result.social_security).toBeLessThanOrEqual(maxSSPerPeriod);
  });
});
