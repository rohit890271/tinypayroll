# TinyPayroll

## Project Overview
Lightweight payroll management SaaS for small businesses. Built with Next.js 14 App Router, Supabase (auth + database), and Stripe (billing).

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth/DB:** Supabase (SSR helpers)
- **Billing:** Stripe
- **Testing:** Vitest + React Testing Library
- **Language:** TypeScript

## Project Structure

```
app/
  (auth)/           # Login/signup routes
  (dashboard)/      # Protected dashboard routes
  (marketing)/      # Landing page
  (onboarding)/     # Business/employee setup flows
lib/
  payroll/          # Payroll calculation engines
  stripe/           # Stripe client/server helpers
  supabase/         # Supabase client helpers
  onboarding/       # Onboarding utilities
components/
  auth/             # Auth form components
  dashboard/        # Dashboard navigation
  onboarding/       # Onboarding UI components
  ui/               # Reusable UI primitives
```

## Key Routes
- `/` - Marketing landing page
- `/login`, `/signup` - Authentication
- `/dashboard` - Main dashboard
- `/dashboard/employees` - Employee management
- `/dashboard/payroll` - Payroll runs
- `/dashboard/billing` - Stripe billing
- `/dashboard/settings` - Settings
- `/onboarding/business` - Business setup
- `/onboarding/employees` - Employee onboarding

## Authentication
Supabase Auth with SSR middleware protection on `/dashboard/*` routes. Unauthorized users redirect to `/login`.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript checks
npm test         # Run Vitest tests
```

## Database
Schema includes: `businesses`, `employees`, `payroll_runs`, `payroll_line_items` tables with RLS policies enforcing owner-scoped access.