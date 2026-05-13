---
name: Payroll SaaS Design System
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#b9c7e0'
  on-secondary: '#233144'
  secondary-container: '#3c4a5e'
  on-secondary-container: '#abb9d2'
  tertiary: '#dec29a'
  on-tertiary: '#3e2d11'
  tertiary-container: '#231500'
  on-tertiary-container: '#957d5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built on the pillars of **precision, reliability, and transparency**. Catering to small business owners, the UI must alleviate the anxiety of financial management by providing a workspace that feels stable and organized. 

The aesthetic follows a **Modern Corporate Dark** approach: a refined evolution of traditional enterprise software that prioritizes focus and reduced eye strain. It utilizes high-quality typography and a restrained color palette to ensure users can process complex payroll data without cognitive overload. The style is strictly dark-themed to provide a high-contrast, premium "command center" feel, utilizing deep tones and subtle luminosity to create a sense of professional calm.

## Colors

The palette is anchored by **Trustworthy Corporate Navies** and **Deep Slate Grays**, specifically curated to evoke a sense of institutional security in a dark-mode environment.

- **Primary:** A deep Slate-Navy (`#0F172A`) used as the foundational surface color and high-emphasis interface elements.
- **Success/CTA:** A vibrant Emerald-Green (`#10B981`) reserved exclusively for primary actions like "Run Payroll," "Approve," or "Submit." This creates a psychological link between the color and positive financial completion against the dark backdrop.
- **Neutrals:** A spectrum of Slates derived from `#F8FAFC` (used for primary text and highlights) to `#334155` (used for secondary surfaces and borders) creates a legible, high-contrast environment.
- **Accents:** Use subtle tints of the primary navy for hover states and selected rows to maintain a monochromatic professional feel.

## Typography

This design system utilizes a dual-font strategy. **Manrope** is used for headings to provide a modern, slightly geometric character that feels premium. **Inter** is used for all functional body text and data due to its exceptional legibility at small sizes, especially when rendered as light text on dark backgrounds.

For financial tables and payroll figures, always enable **tabular figures** (`tnum`) in CSS. This ensures that columns of numbers align perfectly, allowing business owners to scan and compare totals easily. Maintain a strict hierarchy where the largest headers are reserved for page titles, and data labels are always clearly distinguished from the data itself.

## Layout & Spacing

The layout philosophy is based on a **fixed-fluid hybrid grid**. On desktop, content is contained within a 1280px central wrapper with 24px gutters. On mobile, the layout transitions to a single-column fluid model with 16px side margins.

Use a **4px baseline grid** to maintain vertical rhythm. Generous whitespace is a functional requirement; never crowd data. Every dashboard module should have a minimum of 24px internal padding (`p-6` in Tailwind) to ensure the interface feels airy and unhurried even in a dense dark-mode environment.

## Elevation & Depth

In dark mode, depth is achieved through **Tonal Layers** and **Luminous Borders**. Instead of traditional shadows, which are less visible on dark backgrounds, this system uses progressively lighter surface colors and subtle 1px borders to define hierarchy.

- **Level 0 (Base):** Background color `#0F172A`.
- **Level 1 (Cards/Modules):** Secondary surface (`#1E293B`) with a 1px border (`#334155`).
- **Level 2 (Modals/Popovers):** Lighter surface (`#334155`) with a subtle 12px blur shadow at 20% black opacity to create a physical lift from the base.

Avoid using shadows for decoration; use them only to signify that an element is physically above the base plane.

## Shapes

The shape language is consistently **Rounded**. A radius of 8px (`rounded-lg`) is the standard for cards and input fields, while 12px (`rounded-xl`) is used for larger container elements. 

This rounding softens the "corporate" feel, making the software feel more approachable for small business owners who may not be financial experts. Buttons follow the 8px standard, but small utility tags (chips) can use a full-pill radius for distinct visual categorization.

## Components

### Buttons
- **Primary Action (CTA):** Emerald green background, white text. Specifically for "Run Payroll."
- **Secondary Action:** Slate-700 background, white text. For standard tasks.
- **Ghost/Tertiary:** No background, Slate-200 text, 1px border on hover.

### Input Fields
- Use a height of 44px for better touch and click targets.
- Borders should be 1px Slate-700, lightening to Slate-500 on focus with a subtle blue outer glow (ring).
- Labels must always be visible above the field in Slate-300; never use placeholder text as a label.

### Data Tables
- Header rows should have a subtle Slate-800 background.
- Row hover states should use a subtle navy tint (`#1e293b`) to help tracking across wide screens.
- Alignment: Text is left-aligned, currency and numbers are right-aligned.

### Payroll Status Chips
- Use small, rounded badges with semi-transparent backgrounds and bright text (e.g., Dark Green background with Light Green text for "Paid").

### Cards
- Standard containers for dashboard widgets. Deep Navy background (`#1e293b`), 1px Slate-700 border, 8px corner radius. Include a 16px header area with a bottom border to separate the title from the content.
