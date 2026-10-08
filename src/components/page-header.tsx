import type { ReactNode } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function PageHeader({
  kicker,
  title,
  description,
  extra,
}: {
  kicker: string;
  title: string;
  description?: string;
  extra?: ReactNode;
}) {
  return (
    <header>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-[0.16em] text-steel uppercase">{kicker}</p>
        <div className="flex shrink-0 items-center gap-2">
          {extra}
          <ThemeSwitcher />
        </div>
      </div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </header>
  );
}
