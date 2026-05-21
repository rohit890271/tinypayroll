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
      className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">logout</span>
        {isPending ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
}