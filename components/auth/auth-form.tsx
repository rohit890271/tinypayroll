import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  mode: "login" | "signup";
};

export function AuthForm({ action, error, mode }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-ink/10 bg-white/85 p-8 shadow-soft backdrop-blur">
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] text-payroll">
          TinyPayroll
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-ink">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-3 text-sm leading-6 text-moss">
          {isLogin ? "Sign in to keep payroll setup moving." : "Start with your email and password. The guided setup comes next."}
        </p>

        {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <form action={action} className="mt-8 grid gap-5">
          <Input label="Email" name="email" type="email" autoComplete="email" required />
          <Input label="Password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} minLength={6} required />
          <Button type="submit">{isLogin ? "Log in" : "Sign up"}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-moss">
          {isLogin ? "New here?" : "Already have an account?"} {" "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-payroll hover:underline">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}