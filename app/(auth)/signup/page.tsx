import { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { ReferralCapture } from "@/components/auth/referral-capture";
import { signupAction } from "../actions";

export const metadata: Metadata = {
  title: "Sign Up | TinyPayroll - Simple Payroll for Small Teams",
  description: "Create your TinyPayroll account to automate calculations, handle compliant tax deductions, and download payslips."
};

type SignupPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
        <AuthForm mode="signup" action={signupAction} error={searchParams?.error} />
      </Suspense>
    </>
  );
}