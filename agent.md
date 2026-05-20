# Agent Guidelines for TinyPayroll

This document contains essential context, architectural rules, and implementation constraints for the AI agent to reference before starting any new phase or feature in the TinyPayroll project. Please read this before executing tasks.

## 1. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (using `@supabase/ssr` for server-side auth, `middleware.ts` for routing protection)
- **Styling:** Tailwind CSS (Vanilla CSS utilities, no complex external component libraries unless specified)
- **Language:** TypeScript
- **Payments:** Dodo Payments SDK

## 2. Strict Constraints & Rules
- **No `.js` Extensions:** TypeScript configuration has `allowJs: false`. Every new file must be `.ts` or `.tsx`.
- **Currency Formatting:** Always use the existing helper `formatCurrency(amount, country_code)` from `lib/payroll/formatCurrency.ts`.
- **Imports:** Avoid circular dependencies. Types related to payroll creation should only be imported from `app/(dashboard)/dashboard/payroll/new/types.ts`.
- **Component Splitting:** Keep files clean. Extract complex UI parts into smaller components rather than putting everything in one massive file.
- **Dodo Payments Specifics:** 
  - Use `DodoPayments` client initialized with `bearerToken` (from `lib/dodo.ts`).
  - Webhooks bypass RLS via `createAdminClient` (`lib/supabase/admin.ts`). Ensure webhooks always return `200` to prevent retry storms.

## 3. Implementation Workflow per Phase
When a user asks to "Run phase X":
1. **Understand:** Read the phase requirements from the prompt or `README.md`.
2. **Review Existing Work:** Check existing routes, database queries (`lib/data/business.ts`), and middleware.
3. **Build UI & Actions:** Use Server Components by default. Create Client Components only when interactivity is required (`"use client"`). Use Server Actions for data mutations instead of API routes when possible (except for webhooks/checkout generation).
4. **Validation:** Run `npm run build` using the terminal after significant changes to ensure there are no TypeScript or build errors before concluding the task.

## 4. UI/UX Aesthetics
- Use rich aesthetics, modern typography, glassmorphism, and clean spacing.
- Stick to the existing color palette defined in `globals.css` (e.g., `text-payroll`, `text-ink`, `bg-cream`, `text-moss`).
- Provide loading states for buttons and interactive elements.
