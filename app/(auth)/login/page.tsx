import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "../actions";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <AuthForm mode="login" action={loginAction} error={searchParams?.error} />;
}