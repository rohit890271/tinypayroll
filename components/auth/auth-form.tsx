"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type AuthFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  mode: "login" | "signup";
};

export function AuthForm({ action, error: initialError, mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const { error: toastError } = useToast();

  useEffect(() => {
    const queryError = searchParams.get("error");
    if (queryError) {
      toastError(queryError);
    }
    const isExpired = searchParams.get("expired");
    if (isExpired) {
      toastError("Session expired. Please login again.");
    }
  }, [searchParams, toastError]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err: any) {
        if (err.message && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        toastError(err?.message || "Something went wrong. Try again.");
      }
    });
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6 py-12">
      <div className="w-full rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-8 shadow-soft">
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.25em] text-success-action">
          TinyPayroll
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-on-surface">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {isLogin ? "Sign in to keep payroll setup moving." : "Start with your email and password. The guided setup comes next."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <Input label="Email" name="email" type="email" autoComplete="email" required />
          <Input label="Password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} minLength={6} required />
          <Button type="submit" loading={isPending}>{isLogin ? "Log in" : "Sign up"}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          {isLogin ? "New here?" : "Already have an account?"} {" "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-success-action hover:underline">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}