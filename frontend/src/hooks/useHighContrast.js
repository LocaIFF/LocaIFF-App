import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "locaiff-high-contrast";

export default function useHighContrast() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {}
  }, [enabled]);

  return { highContrast: enabled, toggleHighContrast: toggle };
}
