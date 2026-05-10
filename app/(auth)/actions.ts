"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "")
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const { email, password } = getCredentials(formData);

  if (!email || !password) {
    redirectWithError("/login", "Email and password are required.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError("/login", error.message);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const { email, password } = getCredentials(formData);

  if (!email || !password) {
    redirectWithError("/signup", "Email and password are required.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirectWithError("/signup", error.message);
  }

  redirect("/dashboard");
}