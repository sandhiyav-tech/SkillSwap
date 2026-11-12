"use client";

import React from "react";
import { useTheme } from "../providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-xl text-muted hover:text-foreground bg-muted/10 hover:bg-muted/20 transition-all ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-300 animate-spin-once" />
      ) : (
        <Moon className="w-5 h-5 text-[#6C4DF6]" />
      )}
    </button>
  );
}
