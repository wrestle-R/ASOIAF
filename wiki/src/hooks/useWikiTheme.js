import { useCallback, useState } from "react";

export const WIKI_THEME_STORAGE_KEY = "asoiaf-wiki-theme";

function initialTheme() {
  const stored = window.localStorage.getItem(WIKI_THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useWikiTheme() {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(WIKI_THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
