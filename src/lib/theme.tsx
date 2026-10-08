import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "system" | "light" | "dark";

export const THEME_KEY = "optimo-theme";

function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDark(mode: ThemeMode) {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return prefersDark();
}

export function readStoredTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.theme;
    if (fromDom === "system" || fromDom === "light" || fromDom === "dark") return fromDom;
  }
  if (typeof localStorage === "undefined") return "system";
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const dark = resolveDark(mode);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(dark ? "dark" : "light");
  root.dataset.theme = mode;
  root.style.colorScheme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#121318" : "#f3f1eb");
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* quota */
  }
}

const ThemeCtx = createContext<{
  theme: ThemeMode;
  setTheme: (m: ThemeMode) => void;
  dark: boolean;
}>({ theme: "system", setTheme: () => {}, dark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyTheme(initial);
    setDark(resolveDark(initial));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = readStoredTheme();
      if (current === "system") {
        applyTheme("system");
        setDark(resolveDark("system"));
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (m: ThemeMode) => {
    setThemeState(m);
    applyTheme(m);
    setDark(resolveDark(m));
  };

  const value = useMemo(() => ({ theme, setTheme, dark }), [theme, dark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
