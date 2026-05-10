import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/202605100001_create_tinypayroll_schema.sql"),
  "utf8"
);

describe("TinyPayroll schema migration", () => {
  it("creates the requested payroll tables and enums", () => {
    expect(migration).toContain("create type public.employee_pay_type as enum ('hourly', 'salary')");
    expect(migration).toContain("create type public.payroll_run_status as enum ('draft', 'processed')");
    for (const table of ["businesses", "employees", "payroll_runs", "payroll_line_items"]) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("scopes child table policies through the owning business", () => {
    expect(migration).toContain("businesses.owner_user_id = auth.uid()");
    expect(migration).toContain("employees_business_owner_select");
    expect(migration).toContain("payroll_runs_business_owner_select");
    expect(migration).toContain("payroll_line_items_business_owner_select");
  });
});
