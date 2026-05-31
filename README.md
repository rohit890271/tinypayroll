# TinyPayroll 💸

TinyPayroll is a premium, high-fidelity, multi-country payroll management SaaS designed to simplify employee onboarding, payroll run analytics, and salary distribution. Developed using AI-assisted pair programming ("vibe coding"), it features a warm "tiny teams" design system (cream/sand surfaces in light, espresso in dark, forest-green brand), robust calculation engines, and secure data persistence.

---

## 🌟 Key Features

### 1. Hybrid Multi-Country Onboarding (US & India)
- **Automatic Geo-Location Detection**: Double-layered geo-targeting system combining **Server-Side IP Geolocation** (via `ipapi.co`) and **Client-Side browser Timezone Refinement** (via native `Intl` APIs) for instant, touchless onboarding.
- **Dynamic Country Selector**: A visible dropdown allowing manual override between **United States** (USD) and **India** (INR) at any time.
- **Dynamic State Selection**: Auto-populates all **50 US States** or **36 Indian States & Union Territories** dynamically based on the selected region.
- **Automatic Database Mapping**: Dynamically stores `country_code` and `currency_code` inside Supabase to toggle regional engine parameters throughout the dashboard.

### 2. Dual-Engine Payroll Computations
TinyPayroll is armed with high-fidelity, country-compliant payroll calculation engines:
- **🇺🇸 United States Engine (Bi-weekly)**:
  - Handles hourly & salaried pay.
  - Automatically calculates Federal Income Tax, Social Security (FICA), and Medicare withholdings.
  - Computes employer-side overhead and ultimate Net Pay.
- **🇮🇳 India Engine (Monthly)**:
  - Supports India standard pay components.
  - Computes Employee Provident Fund (**EPF**), Employee State Insurance (**ESI**), Professional Tax (**PT**), and Tax Deducted at Source (**TDS**).
  - Determines total cost to employer (CTC breakdown) and Net Pay in INR.

### 3. Rich Dashboard & Analytics
- Designed using a **warm "tiny teams" token system** — cream/sand surfaces (light) and espresso (dark), forest-green primary (`--primary`), emerald CTAs (`--success-action`), and a terracotta accent (`--accent`). Tailwind is token-driven via CSS variables; no raw palette classes.
- **KPI Metrics**: Active Employees, Last Payroll Date, and Last Payroll Total Cost cards.
- **History Table**: List of the last 10 payroll runs with dynamic status badges (Draft / Processed), total payouts, and detailed deep-dives.
- **Floating Action Button (FAB)**: Smooth floating button to instantly spawn a new payroll run.

### 4. Professional Payslip & Document Engine
- **Single-Employee Downloads**: Generates elegant, standard-compliant PDF payslips on the fly using `jsPDF` and `jspdf-autotable`.
- **Bulk Exports**: Uses `JSZip` for rapid packaging, allowing payroll administrators to download all payslip PDFs for a specific run in a single, lightweight `.zip` archive.
- **Optimized Bundling**: Dynamically imports PDF and ZIP dependencies in client wrappers to ensure fast initial page loads.

### 5. Secure Supabase Architecture
- Built on top of **Supabase RLS (Row Level Security)** across all 4 key tables:
  - `businesses` (owner-linked workspaces)
  - `employees` (employee registry, rates, salary data)
  - `payroll_runs` (run dates, status, regional parameters)
  - `payroll_line_items` (individual payroll gross, tax, and net breakdowns)
- Initialized securely using `@supabase/ssr` to ensure session-based access tokens are passed via cookies, fully protecting company tenant data.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication & Database**: [Supabase](https://supabase.com/) (with RLS enabled)
- **Styling**: [Vanilla CSS & Tailwind CSS](https://tailwindcss.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Archiving**: [JSZip](https://stuk.github.io/jszip/)

---

## 📂 Project Structure

```bash
├── app/
│   ├── (auth)/                   # Authentication routes (Login / Signup)
│   ├── (onboarding)/             # Multistep onboarding flow
│   │   └── onboarding/
│   │       ├── business/        # Geolocation country & state selector
│   │       └── employees/       # Add team members registry
│   ├── (dashboard)/              # Main application views
│   │   └── dashboard/
│   │       ├── payroll/          # Run details, PDF downloads, and runs
│   │       └── billing/          # Stripe integration modules
│   └── layout.tsx                # Core application layout
├── components/
│   ├── ui/                       # Reusable custom UI components (Button, Input, Select)
│   └── dashboard/                # Analytics cards, FAB, history tables
├── lib/
│   ├── data/                     # Data fetching and mutation scripts
│   ├── payroll/                  # US & India calculation logic, PDF generation
│   ├── supabase/                 # Server & Client SSR helpers
│   ├── env.ts                    # Fixed static Webpack variable compiler
│   └── detectCountry.ts          # Server-side IP country detector
└── supabase/
    └── migrations/               # Database schemas and secure RLS policies
```

---

## 🚀 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional Payments
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### 3. Spin up the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside Microsoft Edge or Chrome, and try signing up!
