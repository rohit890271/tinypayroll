import { AuthForm } from "@/components/auth/auth-form";
import { signupAction } from "../actions";

type SignupPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  return <AuthForm mode="signup" action={signupAction} error={searchParams?.error} />;
}