"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-moss transition hover:bg-white disabled:opacity-60"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}