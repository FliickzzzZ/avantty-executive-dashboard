import * as React from "react";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("avantty_theme");
      if (saved === "dark") return "dark";
      if (saved === "light") return "light";
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("avantty_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("avantty_theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
      aria-label="Toggle light/dark mode"
    >
      {theme === "light" ? (
        <>
          <Sun className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-300 shrink-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}

