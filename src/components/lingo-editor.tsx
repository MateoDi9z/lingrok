import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseLingo } from "@/lib/lp/parser";
import type { LpModel } from "@/lib/lp/types";

export function LingoEditor({
  model,
  onApply,
  error,
}: {
  model: LpModel;
  onApply: (m: LpModel) => void;
  error: string | null;
}) {
  const [src, setSrc] = useState(model.lingoSource);
  const [localErr, setLocalErr] = useState<string | null>(error);

  useEffect(() => {
    setSrc(model.lingoSource);
  }, [model.id, model.updatedAt, model.lingoSource]);

  const apply = () => {
    const res = parseLingo(src, model);
    if (res.errors.length || !res.model) {
      setLocalErr(res.errors.map((e) => `Línea ${e.line}: ${e.message}`).join("\n") || "No se pudo interpretar el modelo.");
      return;
    }
    setLocalErr(null);
    onApply({ ...res.model, lingoSource: src });
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="lingo-area"
        spellCheck={false}
        value={src}
        onChange={(e) => {
          setSrc(e.target.value);
          setLocalErr(null);
        }}
        aria-label="Código LINGO"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="steel" onClick={apply}>
          Aplicar al modelo
        </Button>
        <p className="text-xs text-subtle">
          Sintaxis LINGO: filas con nombre), coeficientes pegados, y SETS / @SUM / @FOR.
        </p>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs leading-relaxed text-muted">
        {`MAX = 20XA + 30XB;
BI) 5XA + 8XB <= 10;

SETS:
    Productos / P1..P5 /: X, Costo, Demanda;
ENDSETS
DATA:
    Costo = 12 15 10 18 14;
    Demanda = 100 80 120 90 110;
ENDDATA
MIN = @SUM(Productos(i): Costo(i)*X(i));
@FOR(Productos(i): X(i) <= Demanda(i));`}
      </pre>
      {localErr && (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger whitespace-pre-wrap">
          {localErr}
        </div>
      )}
    </div>
  );
}
