import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinyPayroll",
  description: "Simple payroll setup for tiny teams."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}