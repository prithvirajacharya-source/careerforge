"use client";

import { useSyncExternalStore } from "react";

type VisualTheme = "original" | "glass-uhd";

const STORAGE_KEY = "sekur-visual-theme";

export default function VisualThemeToggle() {
  const theme = useSyncExternalStore(
    (notify) => {
      window.addEventListener("sekur-theme-change", notify);
      window.addEventListener("storage", notify);
      return () => { window.removeEventListener("sekur-theme-change", notify); window.removeEventListener("storage", notify); };
    },
    () => document.documentElement.dataset.sekurTheme === "original" ? "original" : "glass-uhd",
    () => "glass-uhd",
  );

  function selectTheme(nextTheme: VisualTheme) {
    document.documentElement.dataset.sekurTheme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("sekur-theme-change"));
  }

  return <div className="visual-theme-toggle flex rounded-lg border border-white/10 bg-black/15 p-0.5 text-[10px] font-bold sm:text-xs" aria-label="Visual style">
    <button type="button" aria-pressed={theme === "original"} onClick={() => selectTheme("original")} className={`rounded-md px-2 py-1.5 transition sm:px-2.5 ${theme === "original" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"}`}>Original</button>
    <button type="button" aria-pressed={theme === "glass-uhd"} onClick={() => selectTheme("glass-uhd")} className={`rounded-md px-2 py-1.5 transition sm:px-2.5 ${theme === "glass-uhd" ? "bg-emerald-300/15 text-emerald-200" : "text-slate-400 hover:text-white"}`}>Glass UHD</button>
  </div>;
}
