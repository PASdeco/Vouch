"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  if (typeof document !== "undefined") {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
  }
  return "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(initialTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("vouch-theme", next);
    } catch {
      // ignore
    }
    setTheme(next);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="btn btn-ghost"
      style={{ minWidth: 44, width: 44, padding: 0 }}
    >
      {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
