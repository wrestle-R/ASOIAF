import { useCallback, useState } from "react";

export const SITE_THEME_STORAGE_KEY = "map-of-ice-and-fire-theme";

function initialTheme() {
  const stored = window.localStorage.getItem(SITE_THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useSiteTheme() {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
