import { describe, expect, it } from "vitest";
import { buildEmployeeInsert } from "../lib/onboarding/employee-payload";
import { getAppRedirect } from "../lib/onboarding/redirects";
import { US_STATES } from "../lib/onboarding/us-states";

describe("US state options", () => {
  it("contains all 50 US states with postal codes", () => {
    expect(US_STATES).toHaveLength(50);
    expect(US_STATES[0]).toEqual({ code: "AL", name: "Alabama" });
    expect(US_STATES).toContainEqual({ code: "CA", name: "California" });
    expect(US_STATES).toContainEqual({ code: "WY", name: "Wyoming" });
  });
});

describe("employee insert payloads", () => {
  it("stores hourly rate and clears annual salary for hourly employees", () => {
    expect(
      buildEmployeeInsert({
        businessId: "business-1",
        name: "Ava Chen",
        email: "ava@example.com",
        payType: "hourly",
        hourlyRate: "24.50",
        annualSalary: "90000",
        taxFilingStatus: "single"
      })
    ).toEqual({
      business_id: "business-1",
      name: "Ava Chen",
      email: "ava@example.com",
      pay_type: "hourly",
      hourly_rate: 24.5,
      annual_salary: null,
      tax_filing_status: "single"
    });
  });

  it("stores annual salary and clears hourly rate for salary employees", () => {
    expect(
      buildEmployeeInsert({
        businessId: "business-1",
        name: "Noah Patel",
        email: "noah@example.com",
        payType: "salary",
        hourlyRate: "32.00",
        annualSalary: "84000",
        taxFilingStatus: "married"
      })
    ).toEqual({
      business_id: "business-1",
      name: "Noah Patel",
      email: "noah@example.com",
      pay_type: "salary",
      hourly_rate: null,
      annual_salary: 84000,
      tax_filing_status: "married"
    });
  });
});

describe("app redirects", () => {
  it("sends unauthenticated protected-route visitors to login", () => {
    expect(getAppRedirect({ isAuthenticated: false, hasBusiness: false, pathname: "/dashboard" })).toBe("/login");
    expect(getAppRedirect({ isAuthenticated: false, hasBusiness: false, pathname: "/onboarding/business" })).toBe("/login");
  });

  it("sends authenticated users without a business into onboarding", () => {
    expect(getAppRedirect({ isAuthenticated: true, hasBusiness: false, pathname: "/dashboard" })).toBe("/onboarding/business");
  });

  it("lets authenticated users with a business reach dashboard", () => {
    expect(getAppRedirect({ isAuthenticated: true, hasBusiness: true, pathname: "/dashboard" })).toBeNull();
  });
});
