import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SessionMonitor } from "@/components/auth/session-monitor";
import { QueryToast } from "@/components/ui/query-toast";

export const metadata: Metadata = {
  title: "TinyPayroll - Simple Payroll for Small Teams",
  description: "Simple payroll setup for tiny teams. Automate your calculations, payslips, and country compliance."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <SessionMonitor />
          <QueryToast />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}