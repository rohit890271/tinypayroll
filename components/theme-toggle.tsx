"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex h-10 w-full items-center justify-between rounded-lg px-4 bg-surface-container-low text-on-surface-variant opacity-50">
        <span className="text-sm font-semibold">Theme</span>
      </button>
    );
  }

  return (
    <div className="flex h-10 w-full items-center justify-between rounded-lg bg-surface-container-low px-1 overflow-hidden border border-outline-variant/50">
      <button
        onClick={() => setTheme("light")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-colors ${
          theme === "light"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">light_mode</span>
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-colors ${
          theme === "dark"
            ? "bg-surface-container-lowest text-primary shadow-sm"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">dark_mode</span>
        Dark
      </button>
    </div>
  );
}
