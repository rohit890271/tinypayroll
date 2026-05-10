# TinyPayroll Database Schema Design

Date: 2026-05-10

## Goal

Create the initial Supabase database schema for TinyPayroll payroll data. The schema must support one authenticated owner per business and ensure users can only read or mutate rows that belong to their own business.

## Scope

Included:

- SQL migration under `supabase/migrations`.
- `businesses`, `employees`, `payroll_runs`, and `payroll_line_items` tables.
- PostgreSQL enum types for employee pay type and payroll run status.
- Primary keys, foreign keys, defaults, and basic value checks.
- Row Level Security on all four tables.
- RLS policies for owner-scoped `SELECT`, `INSERT`, `UPDATE`, and `DELETE` access.

Excluded:

- Team or multi-user business membership.
- Payroll tax calculation functions.
- Stripe billing schema.
- Seed data.
- Supabase CLI project initialization.

## Authorization Model

`businesses.owner_user_id` is the root ownership field and references `auth.users(id)`. A user owns a business when `businesses.owner_user_id = auth.uid()`.

Access to child tables is inherited from the business:

- `employees.business_id` points to `businesses.id`.
- `payroll_runs.business_id` points to `businesses.id`.
- `payroll_line_items.payroll_run_id` points to `payroll_runs.id`, which points to `businesses.id`.

Every RLS policy will enforce this ownership chain. This keeps ownership normalized and avoids duplicating `owner_user_id` on child rows.

## Tables

### businesses

Columns:

- `id uuid primary key default gen_random_uuid()`
- `owner_user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `state text not null`
- `created_at timestamptz not null default now()`

### employees

Columns:

- `id uuid primary key default gen_random_uuid()`
- `business_id uuid not null references businesses(id) on delete cascade`
- `name text not null`
- `email text not null`
- `pay_type employee_pay_type not null`
- `hourly_rate numeric(12,2)`
- `annual_salary numeric(12,2)`
- `tax_filing_status text not null`
- `created_at timestamptz not null default now()`

Checks:

- Hourly employees require `hourly_rate` and must not set `annual_salary`.
- Salary employees require `annual_salary` and must not set `hourly_rate`.
- Amount columns must be non-negative when present.

### payroll_runs

Columns:

- `id uuid primary key default gen_random_uuid()`
- `business_id uuid not null references businesses(id) on delete cascade`
- `pay_period_start date not null`
- `pay_period_end date not null`
- `run_date date not null`
- `status payroll_run_status not null default 'draft'`
- `created_at timestamptz not null default now()`

Checks:

- `pay_period_end >= pay_period_start`.

### payroll_line_items

Columns:

- `id uuid primary key default gen_random_uuid()`
- `payroll_run_id uuid not null references payroll_runs(id) on delete cascade`
- `employee_id uuid not null references employees(id) on delete cascade`
- `hours_worked numeric(8,2) not null default 0`
- `overtime_hours numeric(8,2) not null default 0`
- `unpaid_leave_hours numeric(8,2) not null default 0`
- `bonus_amount numeric(12,2) not null default 0`
- `gross_pay numeric(12,2) not null default 0`
- `tax_withheld numeric(12,2) not null default 0`
- `net_pay numeric(12,2) not null default 0`

Checks:

- Hour and amount fields must be non-negative.
- `net_pay <= gross_pay + bonus_amount` is not enforced because tax and bonus formulas are intentionally outside this migration.

## Enums

Create enum types:

- `employee_pay_type`: `hourly`, `salary`
- `payroll_run_status`: `draft`, `processed`

## RLS Policies

Enable RLS for every table.

`businesses` policies:

- Owners can select their businesses.
- Authenticated users can insert businesses only with `owner_user_id = auth.uid()`.
- Owners can update their businesses, and updates cannot transfer ownership to another user.
- Owners can delete their businesses.

`employees` policies:

- Owners can select employees where the employee's business belongs to them.
- Owners can insert employees only into their own businesses.
- Owners can update employees only within their own businesses.
- Owners can delete employees only within their own businesses.

`payroll_runs` policies:

- Owners can select payroll runs where the run's business belongs to them.
- Owners can insert runs only into their own businesses.
- Owners can update runs only within their own businesses.
- Owners can delete runs only within their own businesses.

`payroll_line_items` policies:

- Owners can select line items where the related payroll run belongs to their business.
- Owners can insert line items only into payroll runs belonging to their business and only for employees belonging to that same business.
- Owners can update line items only if the existing and updated row remain within their business.
- Owners can delete line items only if the related payroll run belongs to their business.

## Indexes

Add indexes for foreign keys and common RLS joins:

- `businesses(owner_user_id)`
- `employees(business_id)`
- `payroll_runs(business_id)`
- `payroll_line_items(payroll_run_id)`
- `payroll_line_items(employee_id)`

## Migration File

Create one migration file:

```text
supabase/migrations/202605100001_create_tinypayroll_schema.sql
```

This single migration is sufficient because the project has no existing Supabase schema migrations.

## Verification

Verification will inspect the SQL for:

- All requested tables and columns.
- Enum values exactly matching the requested values.
- RLS enabled on all tables.
- Policies covering each CRUD operation.
- Ownership checks on every child table.
- No policies that allow cross-business reads or writes.
