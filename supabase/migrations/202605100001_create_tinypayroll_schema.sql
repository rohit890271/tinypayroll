create extension if not exists pgcrypto;

create type public.employee_pay_type as enum ('hourly', 'salary');
create type public.payroll_run_status as enum ('draft', 'processed');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  state text not null check (state ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  email text not null check (position('@' in email) > 1),
  pay_type public.employee_pay_type not null,
  hourly_rate numeric(12,2),
  annual_salary numeric(12,2),
  tax_filing_status text not null check (tax_filing_status in ('single', 'married')),
  created_at timestamptz not null default now(),
  constraint employees_hourly_salary_check check (
    (pay_type = 'hourly' and hourly_rate is not null and annual_salary is null)
    or
    (pay_type = 'salary' and annual_salary is not null and hourly_rate is null)
  ),
  constraint employees_non_negative_pay_check check (
    (hourly_rate is null or hourly_rate >= 0)
    and
    (annual_salary is null or annual_salary >= 0)
  )
);

create table public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end date not null,
  run_date date not null,
  status public.payroll_run_status not null default 'draft',
  created_at timestamptz not null default now(),
  constraint payroll_runs_period_check check (pay_period_end >= pay_period_start)
);

create table public.payroll_line_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  hours_worked numeric(8,2) not null default 0,
  overtime_hours numeric(8,2) not null default 0,
  unpaid_leave_hours numeric(8,2) not null default 0,
  bonus_amount numeric(12,2) not null default 0,
  gross_pay numeric(12,2) not null default 0,
  tax_withheld numeric(12,2) not null default 0,
  net_pay numeric(12,2) not null default 0,
  constraint payroll_line_items_non_negative_check check (
    hours_worked >= 0
    and overtime_hours >= 0
    and unpaid_leave_hours >= 0
    and bonus_amount >= 0
    and gross_pay >= 0
    and tax_withheld >= 0
    and net_pay >= 0
  )
);

create index businesses_owner_user_id_idx on public.businesses(owner_user_id);
create index employees_business_id_idx on public.employees(business_id);
create index payroll_runs_business_id_idx on public.payroll_runs(business_id);
create index payroll_line_items_payroll_run_id_idx on public.payroll_line_items(payroll_run_id);
create index payroll_line_items_employee_id_idx on public.payroll_line_items(employee_id);

alter table public.businesses enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_line_items enable row level security;

create policy businesses_owner_select
on public.businesses for select
using (businesses.owner_user_id = auth.uid());

create policy businesses_owner_insert
on public.businesses for insert
to authenticated
with check (businesses.owner_user_id = auth.uid());

create policy businesses_owner_update
on public.businesses for update
using (businesses.owner_user_id = auth.uid())
with check (businesses.owner_user_id = auth.uid());

create policy businesses_owner_delete
on public.businesses for delete
using (businesses.owner_user_id = auth.uid());

create policy employees_business_owner_select
on public.employees for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy employees_business_owner_insert
on public.employees for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy employees_business_owner_update
on public.employees for update
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy employees_business_owner_delete
on public.employees for delete
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = employees.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_runs_business_owner_select
on public.payroll_runs for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_runs_business_owner_insert
on public.payroll_runs for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_runs_business_owner_update
on public.payroll_runs for update
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_runs_business_owner_delete
on public.payroll_runs for delete
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_line_items_business_owner_select
on public.payroll_line_items for select
using (
  exists (
    select 1
    from public.payroll_runs
    join public.businesses on businesses.id = payroll_runs.business_id
    where payroll_runs.id = payroll_line_items.payroll_run_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_line_items_business_owner_insert
on public.payroll_line_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.payroll_runs
    join public.businesses on businesses.id = payroll_runs.business_id
    join public.employees on employees.id = payroll_line_items.employee_id
    where payroll_runs.id = payroll_line_items.payroll_run_id
      and employees.business_id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_line_items_business_owner_update
on public.payroll_line_items for update
using (
  exists (
    select 1
    from public.payroll_runs
    join public.businesses on businesses.id = payroll_runs.business_id
    where payroll_runs.id = payroll_line_items.payroll_run_id
      and businesses.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.payroll_runs
    join public.businesses on businesses.id = payroll_runs.business_id
    join public.employees on employees.id = payroll_line_items.employee_id
    where payroll_runs.id = payroll_line_items.payroll_run_id
      and employees.business_id = payroll_runs.business_id
      and businesses.owner_user_id = auth.uid()
  )
);

create policy payroll_line_items_business_owner_delete
on public.payroll_line_items for delete
using (
  exists (
    select 1
    from public.payroll_runs
    join public.businesses on businesses.id = payroll_runs.business_id
    where payroll_runs.id = payroll_line_items.payroll_run_id
      and businesses.owner_user_id = auth.uid()
  )
);