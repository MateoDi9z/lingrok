import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatQ, formatRange, statusLabel } from "@/lib/format";
import type { SolveResult } from "@/lib/lp/types";
import { SimplexView } from "@/components/simplex-view";

function lingoText(r: SolveResult, frac: boolean): string {
  const mode = frac ? "frac" : "dec";
  const lines: string[] = [];
  lines.push(" " + statusLabel(r.status));
  if (r.status === "optimal" || r.status === "integer-optimal") {
    lines.push(` Valor de la función objetivo:          ${formatQ(r.z, mode).padStart(16)}`);
    lines.push(` Iteraciones del solver:                ${String(r.iterations).padStart(16)}`);
    if (r.nodes) lines.push(` Nodos branch & bound:                  ${String(r.nodes).padStart(16)}`);
    lines.push("");
    lines.push(" Variable           Valor          Costo reducido");
    for (const v of r.variables) {
      lines.push(
        ` ${v.name.padEnd(16)} ${formatQ(v.value, mode).padStart(14)} ${formatQ(v.reducedCost, mode).padStart(18)}`,
      );
    }
    lines.push("");
    lines.push(" Fila               Holgura o exceso     Precio dual");
    lines.push(
      ` OBJETIVO          ${formatQ(r.z, mode).padStart(16)} ${"1".padStart(16)}`,
    );
    for (const c of r.constraints) {
      lines.push(
        ` ${c.name.padEnd(16)} ${formatQ(c.slack, mode).padStart(16)} ${formatQ(c.dual, mode).padStart(16)}`,
      );
    }
  } else {
    lines.push(" " + r.message);
  }
  return lines.join("\n");
}

export function SolutionReport({ result, frac }: { result: SolveResult; frac: boolean }) {
  const [tab, setTab] = useState<"informe" | "sens" | "simplex">("informe");
  const mode = frac ? "frac" : "dec";
  const text = useMemo(() => lingoText(result, frac), [result, frac]);
  const ok = result.status === "optimal" || result.status === "integer-optimal";

  const tone =
    result.status === "infeasible" || result.status === "error"
      ? "text-danger"
      : result.status === "unbounded"
        ? "text-warn"
        : "text-opt";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className={`text-xl font-semibold ${tone}`}>{statusLabel(result.status)}</p>
        <p className="mt-1 text-sm text-muted">{result.message}</p>
        {ok && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label={result.sense === "max" ? "Máximo z" : "Mínimo z"} value={formatQ(result.z, mode)} />
            <Stat label="Iteraciones" value={String(result.iterations)} />
            <Stat label="Variables" value={String(result.variables.length)} />
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-md border border-border bg-surface p-1">
        {(
          [
            ["informe", "Informe"],
            ["sens", "Sensibilidad"],
            ["simplex", "Simplex"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`h-10 flex-1 rounded-sm px-3 text-sm font-medium whitespace-nowrap ${
              tab === id ? "bg-accent text-accent-fg" : "text-muted"
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "informe" && (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto rounded-lg border border-border bg-surface p-4">
            <pre className="report-pre">{text}</pre>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(text)}
          >
            Copiar informe
          </Button>
          {ok && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-elevated text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Variable</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 text-right font-medium">Costo red.</th>
                    <th className="px-3 py-2 text-left font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.variables.map((v) => (
                    <tr key={v.name} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{v.name}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatQ(v.value, mode)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular text-muted">
                        {formatQ(v.reducedCost, mode)}
                      </td>
                      <td className="px-3 py-2 text-muted">
                        {v.type === "continuous" ? "cont" : v.type === "integer" ? "entera" : "binaria"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "sens" && ok && (
        <div className="flex flex-col gap-4">
          <section>
            <h3 className="mb-2 text-base font-semibold">RHS (precios duales)</h3>
            <p className="mb-2 text-xs text-subtle">
              El precio dual es el cambio en z si el RHS aumenta en una unidad, dentro del rango.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-elevated text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Fila</th>
                    <th className="px-3 py-2 text-right font-medium">Holgura</th>
                    <th className="px-3 py-2 text-right font-medium">Dual</th>
                    <th className="px-3 py-2 text-right font-medium">↓ RHS</th>
                    <th className="px-3 py-2 text-right font-medium">↑ RHS</th>
                  </tr>
                </thead>
                <tbody>
                  {result.constraints.map((c) => (
                    <tr key={c.name} className="border-t border-border">
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatQ(c.slack, mode)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatQ(c.dual, mode)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatRange(c.rhsDec, mode)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatRange(c.rhsInc, mode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold">Coeficientes de la función objetivo</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-elevated text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Variable</th>
                    <th className="px-3 py-2 text-right font-medium">cⱼ</th>
                    <th className="px-3 py-2 text-right font-medium">↓ cⱼ</th>
                    <th className="px-3 py-2 text-right font-medium">↑ cⱼ</th>
                  </tr>
                </thead>
                <tbody>
                  {result.objRanges.map((o) => (
                    <tr key={o.name} className="border-t border-border">
                      <td className="px-3 py-2">{o.name}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{o.coeff}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatRange(o.dec, mode)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular">{formatRange(o.inc, mode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {tab === "sens" && !ok && <p className="text-sm text-muted">No hay análisis de sensibilidad para este estado.</p>}

      {tab === "simplex" && <SimplexView tableaus={result.tableaus} frac={frac} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-elevated px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg tabular">{value}</div>
    </div>
  );
}
