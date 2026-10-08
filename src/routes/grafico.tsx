import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { GraphicPlot } from "@/components/graphic-plot";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { buildGraphic } from "@/lib/lp/graphic";
import { isBlankModel } from "@/lib/lp/ids";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/grafico")({ component: GraficoPage });

function GraficoPage() {
  const nav = useNavigate();
  const model = useApp((s) => s.model);
  const blank = isBlankModel(model);
  const g = useMemo(() => (blank ? null : buildGraphic(model)), [model, blank]);

  return (
    <div className="flex flex-col gap-4 pt-1">
      <PageHeader
        kicker="Método gráfico"
        title="Región factible"
        description="Vértices y curvas de nivel de la función objetivo. Aplica cuando hay exactamente dos variables."
      />
      {blank ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-muted">
            Todavía no hay un modelo. Cargá dos variables y restricciones en el editor, o un ejemplo de dos variables.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => nav({ to: "/editor" })}>Ir al editor</Button>
            <Button variant="outline" onClick={() => nav({ to: "/" })}>
              Ver ejemplos
            </Button>
          </div>
        </div>
      ) : !g ? (
        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="text-muted">
            Este modelo tiene {model.variables.length} variables. El método gráfico aplica cuando hay exactamente dos.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => nav({ to: "/editor" })}>
            Ir al editor
          </Button>
        </div>
      ) : (
        <GraphicPlot g={g} />
      )}
    </div>
  );
}
