"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/Provider/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      className="theme-toggle"
      onClick={() => setTheme(nextTheme)}
      type="button"
    >
      {theme === "dark" ? (
        <Sun size={18} weight="bold" />
      ) : (
        <Moon size={18} weight="bold" />
      )}
    </button>
  );
}
