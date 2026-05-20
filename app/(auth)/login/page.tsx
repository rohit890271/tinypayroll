import { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Log In | TinyPayroll - Simple Payroll for Small Teams",
  description: "Log in to your TinyPayroll account to manage employees, run payroll compliance, and view reports."
};

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
      <AuthForm mode="login" action={loginAction} error={searchParams?.error} />
    </Suspense>
  );
}