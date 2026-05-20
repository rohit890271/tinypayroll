import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { ReferralCapture } from "@/components/auth/referral-capture";
import { signupAction } from "../actions";

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
      <AuthForm mode="signup" action={signupAction} error={searchParams?.error} />
    </>
  );
}