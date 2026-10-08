import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, LineChart, Sigma, SlidersHorizontal } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useApp } from "@/lib/store";

const TABS = [
  { to: "/", label: "Inicio", icon: BookOpen, match: (p: string) => p === "/" },
  { to: "/editor", label: "Modelo", icon: SlidersHorizontal, match: (p: string) => p.startsWith("/editor") },
  { to: "/informe", label: "Informe", icon: Sigma, match: (p: string) => p.startsWith("/informe") },
  { to: "/grafico", label: "Gráfico", icon: LineChart, match: (p: string) => p.startsWith("/grafico") },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = useApp((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>
      <nav className="tabbar" aria-label="Navegación">
        <div className="tabbar-inner">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.match(pathname);
            return (
              <Link key={t.to} to={t.to} className="tab-item" data-active={active} aria-current={active ? "page" : undefined}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
