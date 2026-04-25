"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { InputPanel } from "@/components/panels/InputPanel";
import { ViewerPanel } from "@/components/panels/ViewerPanel";
import { BugPanel } from "@/components/panels/BugPanel";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Home() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Thin top bar with theme toggle */}
      <header className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <span className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">Design QA</span>
        <ThemeToggle />
      </header>

      <div className="flex-1 grid grid-cols-[300px_1fr_320px] overflow-hidden">
        <InputPanel />
        <ViewerPanel />
        <BugPanel />
      </div>

    </div>
  );
}
