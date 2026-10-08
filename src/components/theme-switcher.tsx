import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/cn";

const OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex rounded-md border border-border bg-surface p-0.5"
      role="group"
      aria-label="Tema"
    >
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = theme === o.id;
        return (
          <button
            key={o.id}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            onClick={() => setTheme(o.id)}
            className={cn(
              "flex size-7 items-center justify-center rounded-sm text-subtle transition-colors duration-150",
              active ? "bg-accent text-accent-fg" : "hover:text-fg",
            )}
          >
            <Icon size={15} strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}
