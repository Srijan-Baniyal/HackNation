// biome-ignore-all lint/style/useFilenamingConvention: This path is intentionally named Provider/ThemeProvider.tsx because the app contract requires it.

"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeProviderValue {
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

const ThemeProviderContext = createContext<ThemeProviderValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo<ThemeProviderValue>(
    () => ({
      setTheme,
      theme,
    }),
    [theme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
