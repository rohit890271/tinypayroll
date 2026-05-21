import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { QueryToast } from "@/components/ui/query-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "TinyPayroll - Simple Payroll for Small Teams",
  description:
    "Simple payroll setup for tiny teams. Automate your calculations, payslips, and country compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <SessionMonitor />
            <QueryToast />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}