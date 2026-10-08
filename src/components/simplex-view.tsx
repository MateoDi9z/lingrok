import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Q } from "@/lib/lp/fraction";
import type { ColKind, TableauSnap } from "@/lib/lp/types";

const KIND_LABEL: Record<ColKind, string> = {
  var: "Variable",
  slack: "Holgura",
  surplus: "Exceso",
  art: "Artificial",
};

function fmtCell(s: string, frac: boolean) {
  if (!frac) {
    try {
      return Q.parse(s.includes("/") ? s : s).toDecimal(4);
    } catch {
      return s;
    }
  }
  return s;
}

export function SimplexView({ tableaus, frac }: { tableaus: TableauSnap[]; frac: boolean }) {
  const [i, setI] = useState(0);
  if (!tableaus.length) {
    return (
      <p className="text-sm text-muted">
        No hay tabla simplex (modelos enteros muestran la relajación raíz si está disponible).
      </p>
    );
  }
  const t = tableaus[Math.min(i, tableaus.length - 1)];
  const fmt = (s: string) => fmtCell(s, frac);
  const zRow = t.matrix[0] ?? [];
  const rhs = zRow.length ? zRow[zRow.length - 1] : "0";
  const kinds = t.kinds ?? [];
  const cj = t.cj ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="subtle" size="icon" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          <ChevronLeft size={18} />
        </Button>
        <div className="flex-1 text-center text-sm">
          <div className="font-medium">
            Fase {t.phase} · Iteración {t.iteration}
          </div>
          <div className="text-xs text-muted">{t.note}</div>
        </div>
        <Button
          variant="subtle"
          size="icon"
          onClick={() => setI((x) => Math.min(tableaus.length - 1, x + 1))}
          disabled={i >= tableaus.length - 1}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
      <div className="flex justify-center gap-1 overflow-x-auto pb-1">
        {tableaus.map((_, k) => (
          <button
            key={k}
            className={`size-2 rounded-full ${k === i ? "bg-accent" : "bg-elevated"}`}
            onClick={() => setI(k)}
            aria-label={`Paso ${k + 1}`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Funcional en este paso</p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular text-steel">z = {fmt(t.z ?? rhs)}</p>
        <p className="mt-1 text-xs text-subtle">
          {t.phase === 1
            ? "Fase I: se minimiza la suma de artificiales. z es el funcional original evaluado en la base actual."
            : "z = c·x con la base actual. La fila z de la tabla son los coeficientes del funcional (tablero)."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span>
          <i className="kind-dot kind-var" /> Variable de decisión
        </span>
        <span>
          <i className="kind-dot kind-slack" /> Holgura (≤)
        </span>
        <span>
          <i className="kind-dot kind-surplus" /> Exceso (≥)
        </span>
        <span>
          <i className="kind-dot kind-art" /> Artificial
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="tableau w-full">
          <thead>
            {cj.length > 0 && (
              <tr className="cj-row">
                <th className="text-left">cₖ</th>
                <th />
                <th />
                {t.labels.slice(0, -1).map((l, j) => (
                  <td key={`ck-${l}-${j}`} data-kind={kinds[j]}>
                    {fmt(cj[j] ?? "0")}
                  </td>
                ))}
              </tr>
            )}
            <tr>
              <th className="text-left">Cₖ</th>
              <th className="text-left">Xₖ</th>
              <th className="text-left">Bₖ</th>
              {t.labels.slice(0, -1).map((l, j) => (
                <th
                  key={`${l}-${j}`}
                  data-enter={l === t.entering ? "true" : undefined}
                  data-kind={kinds[j]}
                >
                  <div>{l}</div>
                  {kinds[j] && <div className="kind-label">{KIND_LABEL[kinds[j]]}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.matrix.slice(1).map((row, ri) => {
              const basic = t.basis[ri] ?? "";
              const col = t.labels.indexOf(basic);
              const ck = col >= 0 ? (cj[col] ?? "0") : "0";
              return (
                <tr key={ri} data-leave={basic === t.leaving ? "true" : undefined}>
                  <td className="text-left">{fmt(ck)}</td>
                  <td className="text-left text-steel">{basic}</td>
                  <td className="bk">{fmt(row[row.length - 1] ?? "0")}</td>
                  {row.slice(0, -1).map((cell, ci) => (
                    <td key={ci} data-kind={kinds[ci]}>
                      {fmt(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="z-row">
              <td />
              <td className="text-left">z</td>
              <td className="bk">{fmt(t.z ?? rhs)}</td>
              {zRow.slice(0, -1).map((cell, ci) => (
                <td key={ci} data-kind={kinds[ci]}>
                  {fmt(cell)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        <span className="text-fg">Cₖ</span> es el coeficiente del funcional de la variable básica (el mismo de la fila{" "}
        <span className="text-fg">cₖ</span> de arriba). <span className="text-fg">Xₖ</span> es la base y{" "}
        <span className="text-fg">Bₖ</span> es el valor de la variable básica. La fila <span className="text-fg">z</span> son los
        coeficientes actuales del tablero.
      </p>
      {t.entering && (
        <p className="text-xs text-muted">
          Entra <span className="text-fg">{t.entering}</span>
          {t.leaving ? (
            <>
              {" "}
              · Sale <span className="text-fg">{t.leaving}</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
