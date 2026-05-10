# TinyPayroll SaaS Scaffold Design

Date: 2026-05-10

## Goal

Build TinyPayroll, a clean multi-page SaaS web app scaffold using Next.js 14, Tailwind CSS, Supabase for authentication and database access, and Stripe for billing integration. The initial version should provide a strong foundation: route structure, authentication, protected dashboard pages, integration clients, and environment templates. It should not implement real payroll calculations or production billing flows yet.

## Scope

Included in this scaffold:

- Next.js 14 App Router project structure.
- Tailwind CSS configuration and global styling.
- Public landing page at `/`.
- Email/password Supabase Auth pages at `/signup` and `/login`.
- Successful login/signup redirect to `/dashboard`.
- Protected `/dashboard` and `/dashboard/*` routes.
- Redirect unauthenticated dashboard visitors to `/login`.
- Dashboard shell with responsive sidebar/top navigation.
- Logout button in dashboard navigation.
- Starter pages for dashboard overview, employees, payroll runs, billing, and settings.
- Supabase browser, server, and middleware clients.
- Stripe server client and publishable-key config helper.
- `.env.local` template with placeholders for Supabase and Stripe keys.

Excluded from this scaffold:

- Real payroll calculation logic.
- Supabase database schema migrations.
- Stripe Checkout, customer portal, or webhook endpoints.
- Role-based permissions or company/team membership.
- Production-grade email verification flows.

## Routes

Marketing routes:

- `/`: landing page with product positioning and calls to action.

Auth routes:

- `/signup`: email and password sign-up form.
- `/login`: email and password login form.

Dashboard routes:

- `/dashboard`: overview page.
- `/dashboard/employees`: employee management placeholder.
- `/dashboard/payroll`: payroll runs placeholder.
- `/dashboard/billing`: Stripe billing placeholder.
- `/dashboard/settings`: company/account settings placeholder.

## Authentication Flow

Supabase Auth is the source of truth for authentication.

- Signup submits email/password to Supabase Auth.
- Login submits email/password to Supabase Auth.
- Successful auth redirects users to `/dashboard`.
- Failed auth displays a concise form-level error.
- Logout signs out via Supabase and redirects to `/login`.
- Middleware protects `/dashboard/:path*` and redirects unauthenticated users to `/login`.

The scaffold will use Supabase SSR helpers so middleware and server components can read the authenticated user/session safely.

## Environment Variables

The app will use Next.js public env names for browser-safe values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

For compatibility with the original requested names, the `.env.local` template will include comments mapping them to:

```env
# SUPABASE_URL -> NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_ANON_KEY -> NEXT_PUBLIC_SUPABASE_ANON_KEY
# STRIPE_PUBLISHABLE_KEY -> NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

The app code should read only the `NEXT_PUBLIC_*` Supabase values, `STRIPE_SECRET_KEY`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Code Organization

Planned structure:

```text
app/
  (marketing)/
    page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
    actions.ts
  (dashboard)/
    dashboard/layout.tsx
    dashboard/page.tsx
    dashboard/employees/page.tsx
    dashboard/payroll/page.tsx
    dashboard/billing/page.tsx
    dashboard/settings/page.tsx
  globals.css
  layout.tsx
components/
  auth/auth-form.tsx
  dashboard/dashboard-nav.tsx
  dashboard/logout-button.tsx
  ui/button.tsx
  ui/input.tsx
lib/
  stripe/client.ts
  stripe/server.ts
  supabase/client.ts
  supabase/middleware.ts
  supabase/server.ts
middleware.ts
```

## UI Direction

The UI should be clean, minimal, and mobile-friendly. The initial visual style should feel trustworthy and small-business oriented: light surfaces, clear typography, generous spacing, simple cards, and direct copy. The dashboard navigation should collapse gracefully on small screens and keep the logout action easy to find.

## Error Handling

- Missing env variables should fail clearly where clients are initialized.
- Auth form failures should show readable messages without exposing internals.
- Middleware should preserve basic redirect behavior and avoid redirect loops.
- Dashboard placeholders should communicate what will be built next instead of implying unfinished production behavior.

## Testing And Verification

Initial verification should include:

- Dependency installation succeeds.
- TypeScript compile succeeds.
- Lint succeeds if configured by the Next.js scaffold.
- `/`, `/login`, and `/signup` render.
- `/dashboard` redirects to `/login` when no Supabase session exists.
- Auth form code paths call Supabase sign-up/sign-in APIs.
- Logout button signs out and redirects to `/login`.

## Implementation Notes

Use the current stable Next.js 14-compatible package setup. Prefer `@supabase/ssr` for App Router auth and middleware support. Use server-only Stripe initialization for secret-key operations and keep publishable-key access separate.
