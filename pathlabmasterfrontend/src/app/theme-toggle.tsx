"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const themeStorageKey = "path-lab-theme";

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.localStorage.getItem(themeStorageKey) === "dark";
    document.documentElement.classList.toggle("theme-dark", isDark);
    document.documentElement.classList.toggle("theme-light", !isDark);

    const updateToggle = window.setTimeout(() => setDarkMode(isDark), 0);

    return () => window.clearTimeout(updateToggle);
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    window.localStorage.setItem(themeStorageKey, nextDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("theme-dark", nextDarkMode);
    document.documentElement.classList.toggle("theme-light", !nextDarkMode);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={darkMode}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-5 right-5 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:scale-105 hover:bg-slate-50 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-amber-200 theme-dark:hover:bg-slate-800"
    >
      {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
    </button>
  );
}