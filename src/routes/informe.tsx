import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { SolutionReport } from "@/components/solution-report";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/informe")({ component: InformePage });

function InformePage() {
  const nav = useNavigate();
  const result = useApp((s) => s.result);
  const solve = useApp((s) => s.solve);
  const frac = useApp((s) => s.frac);
  const setFrac = useApp((s) => s.setFrac);

  return (
    <div className="flex flex-col gap-4 pt-1">
      <PageHeader kicker="Informe" title="Solución" />

      {!result ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-muted">Todavía no hay una solución. Resolvé el modelo para ver el informe tipo LINGO.</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => solve()}>Resolver ahora</Button>
            <Button variant="outline" onClick={() => nav({ to: "/editor" })}>
              Ir al editor
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <button
              className={`h-10 rounded-md px-3 text-xs font-medium ${frac ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`}
              onClick={() => setFrac(!frac)}
            >
              {frac ? "Fracciones" : "Decimales"}
            </button>
          </div>
          <SolutionReport result={result} frac={frac} />
        </div>
      )}
    </div>
  );
}
