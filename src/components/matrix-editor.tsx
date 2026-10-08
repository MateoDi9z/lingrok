import { useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Q } from "@/lib/lp/fraction";
import { defaultConstraint, defaultVariable } from "@/lib/lp/ids";
import { toLingo } from "@/lib/lp/parser";
import type { LpModel, Relation, VarType } from "@/lib/lp/types";

function numOrEmpty(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n) || n === 0) return "";
  return String(n);
}

function parseCell(raw: string): number {
  const t = raw.trim();
  if (!t) return 0;
  try {
    return Q.parse(t).toNumber();
  } catch {
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
}

const RELS: Relation[] = ["<=", ">=", "="];
const TYPES: { id: VarType; label: string }[] = [
  { id: "continuous", label: "Cont" },
  { id: "integer", label: "Ent" },
  { id: "binary", label: "Bin" },
];

const NAME_W = 128;
const VAR_W = 100;
const REL_W = 72;
const RHS_W = 88;
const MIN_W = 64;
const MAX_W = 280;

function fitName(name: string, pad = 48) {
  return Math.min(MAX_W, Math.max(MIN_W, Math.round(name.length * 9 + pad)));
}

function ResizeHandle({
  width,
  onWidth,
  onFit,
}: {
  width: number;
  onWidth: (w: number) => void;
  onFit?: () => void;
}) {
  return (
    <span
      className="col-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Cambiar ancho de columna"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startW = width;
        const el = e.currentTarget;
        el.setPointerCapture(e.pointerId);
        const move = (ev: PointerEvent) => {
          onWidth(Math.max(MIN_W, Math.min(MAX_W, startW + (ev.clientX - startX))));
        };
        const up = (ev: PointerEvent) => {
          el.releasePointerCapture(ev.pointerId);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        onFit?.();
      }}
    />
  );
}

export function MatrixEditor({
  model,
  onChange,
}: {
  model: LpModel;
  onChange: (m: LpModel) => void;
}) {
  const [full, setFull] = useState(false);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [epoch, setEpoch] = useState(model.updatedAt);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selfEdit = useRef(false);
  const widthsBeforeFull = useRef<Record<string, number> | null>(null);
  const fullRef = useRef(false);
  const nameW = widths._name ?? NAME_W;
  const relW = widths._rel ?? REL_W;
  const rhsW = widths._rhs ?? RHS_W;
  const varW = (id: string, name: string) => widths[id] ?? Math.max(VAR_W, fitName(name, 40));

  const setW = (key: string, w: number) => setWidths((s) => ({ ...s, [key]: w }));

  const autoFit = () => {
    const next: Record<string, number> = {
      _name: Math.max(
        NAME_W,
        ...model.constraints.map((c) => fitName(c.name, 56)),
      ),
      _rel: REL_W,
      _rhs: RHS_W,
    };
    for (const v of model.variables) next[v.id] = Math.max(VAR_W, fitName(v.name, 44));
    setWidths(next);
  };

  const commit = (next: LpModel) => {
    selfEdit.current = true;
    onChange({ ...next, lingoSource: toLingo(next), updatedAt: Date.now() });
  };

  useEffect(() => {
    if (selfEdit.current) {
      selfEdit.current = false;
      return;
    }
    setEpoch(model.updatedAt);
  }, [model.updatedAt, model.id]);

  useEffect(() => {
    if (fullRef.current && !full && widthsBeforeFull.current) {
      setWidths(widthsBeforeFull.current);
      widthsBeforeFull.current = null;
    }
    fullRef.current = full;
  }, [full]);

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  const toggleFull = () => {
    if (full) {
      setFull(false);
      return;
    }
    widthsBeforeFull.current = widths;
    const avail = Math.max(280, window.innerWidth - 24);
    const fixed = nameW + relW + rhsW;
    const each = Math.floor((avail - fixed) / Math.max(1, model.variables.length));
    if (each >= MIN_W) {
      const next = { ...widths };
      for (const v of model.variables) {
        next[v.id] = Math.min(MAX_W, Math.max(varW(v.id, v.name), each));
      }
      setWidths(next);
    }
    setFull(true);
  };

  const setObj = (id: string, raw: string) => {
    const n = parseCell(raw);
    if ((model.objective[id] ?? 0) === n) return;
    commit({ ...model, objective: { ...model.objective, [id]: n } });
  };
  const setCoeff = (cid: string, vid: string, raw: string) => {
    const n = parseCell(raw);
    const cur = model.constraints.find((c) => c.id === cid);
    if ((cur?.coeffs[vid] ?? 0) === n) return;
    commit({
      ...model,
      constraints: model.constraints.map((c) =>
        c.id === cid ? { ...c, coeffs: { ...c.coeffs, [vid]: n } } : c,
      ),
    });
  };
  const setRhs = (cid: string, raw: string) => {
    const n = parseCell(raw);
    const cur = model.constraints.find((c) => c.id === cid);
    if (cur && cur.rhs === n) return;
    commit({
      ...model,
      constraints: model.constraints.map((c) => (c.id === cid ? { ...c, rhs: n } : c)),
    });
  };
  const setRel = (cid: string, relation: Relation) => {
    commit({
      ...model,
      constraints: model.constraints.map((c) => (c.id === cid ? { ...c, relation } : c)),
    });
  };
  const renameVar = (id: string, name: string) => {
    const clean = name.replace(/\s+/g, "") || "X";
    commit({
      ...model,
      variables: model.variables.map((v) => (v.id === id ? { ...v, name: clean } : v)),
    });
  };
  const renameCon = (id: string, name: string) => {
    commit({
      ...model,
      constraints: model.constraints.map((c) => (c.id === id ? { ...c, name: name.replace(/\s+/g, "") || "R" } : c)),
    });
  };
  const setType = (id: string, type: VarType) => {
    commit({
      ...model,
      variables: model.variables.map((v) =>
        v.id === id
          ? {
              ...v,
              type,
              upper: type === "binary" ? 1 : v.upper,
              lower: type === "binary" ? 0 : v.lower,
            }
          : v,
      ),
    });
  };
  const setAllTypes = (type: "integer" | "binary") => {
    commit({
      ...model,
      variables: model.variables.map((v) => ({
        ...v,
        type,
        lower: type === "binary" ? 0 : v.lower,
        upper: type === "binary" ? 1 : v.type === "binary" ? null : v.upper,
      })),
    });
  };
  const addVar = () => {
    const nv = defaultVariable(model.variables.length + 1);
    commit({ ...model, variables: [...model.variables, nv], objective: { ...model.objective, [nv.id]: 0 } });
  };
  const addCon = () => {
    commit({ ...model, constraints: [...model.constraints, defaultConstraint(model.constraints.length + 1)] });
  };
  const delVar = (id: string) => {
    if (model.variables.length <= 1) return;
    const { [id]: _, ...objective } = model.objective;
    commit({
      ...model,
      variables: model.variables.filter((v) => v.id !== id),
      objective,
      constraints: model.constraints.map((c) => {
        const { [id]: __, ...coeffs } = c.coeffs;
        return { ...c, coeffs };
      }),
    });
  };
  const delCon = (id: string) => {
    commit({ ...model, constraints: model.constraints.filter((c) => c.id !== id) });
  };

  const style = useMemo(() => ({ ["--rhs-w"]: `${rhsW}px` }) as CSSProperties, [rhsW]);
  const nv = model.variables.length;
  const nav = (r: number, c: number) => ({ "data-nav": `${r},${c}` as const });

  const focusNav = (r: number, c: number) => {
    const root = wrapRef.current;
    if (!root) return false;
    const el = root.querySelector<HTMLElement>(`[data-nav="${r},${c}"]`);
    if (!el) return false;
    el.focus();
    if (el instanceof HTMLInputElement && el.inputMode === "decimal") el.select();
    return true;
  };

  const stepNav = (r: number, c: number, dr: number, dc: number) => {
    for (let k = 0; k < 48; k++) {
      r += dr;
      c += dc;
      if (r < 0 || c < 0 || r > 2 + model.constraints.length + 2 || c > nv + 4) return;
      if (focusNav(r, c)) return;
      if (dc === 0 && dr !== 0) {
        for (const d of [0, -1, 1, -2, 2, 3, -3, nv + 1, nv + 2]) {
          if (focusNav(r, c + d)) return;
        }
      }
    }
  };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const raw = target.getAttribute("data-nav");
    if (!raw) return;
    const [r, c] = raw.split(",").map(Number);
    const isName = target instanceof HTMLInputElement && target.classList.contains("name");
    if (isName && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.altKey) {
      const el = target;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      if (start !== end) return;
      if (e.key === "ArrowLeft" && start > 0) return;
      if (e.key === "ArrowRight" && end < el.value.length) return;
    }
    let dr = 0;
    let dc = 0;
    if (e.key === "ArrowLeft") dc = -1;
    else if (e.key === "ArrowRight") dc = 1;
    else if (e.key === "ArrowUp") dr = -1;
    else if (e.key === "ArrowDown") dr = 1;
    else if (e.key === "Enter") dr = e.shiftKey ? -1 : 1;
    else return;
    e.preventDefault();
    stepNav(r, c, dr, dc);
  };

  const onNumFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <div className={cn("matrix-stage", full && "is-full")}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-surface p-1">
          {(["max", "min"] as const).map((s) => (
            <button
              key={s}
              className={cn(
                "h-9 rounded-sm px-3 text-sm font-medium",
                model.sense === s ? "bg-accent text-accent-fg" : "text-muted",
              )}
              onClick={() => commit({ ...model, sense: s })}
            >
              {s === "max" ? "Maximizar" : "Minimizar"}
            </button>
          ))}
        </div>
        <select
          className="bulk-type"
          defaultValue=""
          aria-label="Cambiar el tipo de todas las variables"
          onChange={(e) => {
            const type = e.target.value;
            if (type === "integer" || type === "binary") setAllTypes(type);
            e.currentTarget.value = "";
          }}
        >
          <option value="">Tipo de todas</option>
          <option value="integer">Todas enteras</option>
          <option value="binary">Todas binarias</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="subtle" size="sm" onClick={toggleFull} aria-pressed={full}>
            {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {full ? "Cerrar" : "Pantalla"}
          </Button>
          <Button variant="subtle" size="sm" onClick={autoFit}>
            Ajustar
          </Button>
          <Button variant="subtle" size="sm" onClick={addVar}>
            <Plus size={14} /> Variable
          </Button>
          <Button variant="subtle" size="sm" onClick={addCon}>
            <Plus size={14} /> Restricción
          </Button>
        </div>
      </div>

      <div className="matrix-wrap" style={style} ref={wrapRef} onKeyDown={onGridKey}>
        <table className="matrix">
          <colgroup>
            <col style={{ width: nameW }} />
            {model.variables.map((v) => (
              <col key={v.id} style={{ width: varW(v.id, v.name) }} />
            ))}
            <col style={{ width: relW }} />
            <col style={{ width: rhsW }} />
          </colgroup>
          <thead>
            <tr>
              <th className="sticky-col">
                <span className="block px-3 py-2 text-left text-xs font-medium text-muted">Fila</span>
                <ResizeHandle width={nameW} onWidth={(w) => setW("_name", w)} onFit={() => setW("_name", NAME_W)} />
              </th>
              {model.variables.map((v, vi) => (
                <th key={v.id}>
                  <input
                    className="cell-input name"
                    value={v.name}
                    aria-label="Nombre de variable"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    {...nav(0, vi + 1)}
                    onChange={(e) => renameVar(v.id, e.target.value)}
                  />
                  {model.variables.length > 1 && (
                    <button className="cell-del" aria-label={`Quitar ${v.name}`} onClick={() => delVar(v.id)}>
                      <Minus size={14} />
                    </button>
                  )}
                  <ResizeHandle
                    width={varW(v.id, v.name)}
                    onWidth={(w) => setW(v.id, w)}
                    onFit={() => setW(v.id, fitName(v.name, 44))}
                  />
                </th>
              ))}
              <th className="sticky-rel">
                <span className="block px-1 py-2 text-center text-xs font-medium text-muted">Rel</span>
                <ResizeHandle width={relW} onWidth={(w) => setW("_rel", w)} onFit={() => setW("_rel", REL_W)} />
              </th>
              <th className="sticky-rhs">
                <span className="block px-1 py-2 text-center text-xs font-medium text-muted">RHS</span>
                <ResizeHandle width={rhsW} onWidth={(w) => setW("_rhs", w)} onFit={() => setW("_rhs", RHS_W)} />
              </th>
            </tr>
            <tr>
              <th className="sticky-col">
                <span className="block px-3 py-1 text-left text-xs font-medium text-muted">Tipo</span>
              </th>
              {model.variables.map((v, vi) => (
                <th key={v.id}>
                  <select
                    className="cell-input type"
                    value={v.type}
                    aria-label={`Tipo de ${v.name}`}
                    {...nav(1, vi + 1)}
                    onChange={(e) => setType(v.id, e.target.value as VarType)}
                  >
                    {TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </th>
              ))}
              <th className="sticky-rel" />
              <th className="sticky-rhs" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="sticky-col">
                <span className="block px-3 text-left text-xs font-medium text-steel">
                  {model.sense === "max" ? "MAX" : "MIN"}
                </span>
              </th>
              {model.variables.map((v, vi) => (
                <td key={v.id}>
                  <input
                    className="cell-input"
                    inputMode="decimal"
                    placeholder="0"
                    defaultValue={numOrEmpty(model.objective[v.id])}
                    key={`obj-${v.id}-${epoch}`}
                    {...nav(2, vi + 1)}
                    onFocus={onNumFocus}
                    onBlur={(e) => setObj(v.id, e.target.value)}
                  />
                </td>
              ))}
              <td className="sticky-rel">
                <span className="block text-center text-muted">=</span>
              </td>
              <td className="sticky-rhs">
                <span className="block px-2 text-center font-mono text-sm text-subtle">z</span>
              </td>
            </tr>
            {model.constraints.map((c, ci) => (
              <tr key={c.id}>
                <th className="sticky-col">
                  <input
                    className="cell-input name"
                    value={c.name}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    {...nav(3 + ci, 0)}
                    onChange={(e) => renameCon(c.id, e.target.value)}
                  />
                  <button className="cell-del" onClick={() => delCon(c.id)} aria-label={`Quitar ${c.name}`}>
                    <Minus size={14} />
                  </button>
                </th>
                {model.variables.map((v, vi) => (
                  <td key={v.id}>
                    <input
                      className="cell-input"
                      inputMode="decimal"
                      placeholder="0"
                      defaultValue={numOrEmpty(c.coeffs[v.id])}
                      key={`${c.id}-${v.id}-${epoch}`}
                      {...nav(3 + ci, vi + 1)}
                      onFocus={onNumFocus}
                      onBlur={(e) => setCoeff(c.id, v.id, e.target.value)}
                    />
                  </td>
                ))}
                <td className="sticky-rel">
                  <select
                    className="cell-input type"
                    value={c.relation}
                    aria-label={`Relación ${c.name}`}
                    {...nav(3 + ci, nv + 1)}
                    onChange={(e) => setRel(c.id, e.target.value as Relation)}
                  >
                    {RELS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="sticky-rhs">
                  <input
                    className="cell-input"
                    inputMode="decimal"
                    defaultValue={String(c.rhs)}
                    key={`rhs-${c.id}-${epoch}`}
                    {...nav(3 + ci, nv + 2)}
                    onFocus={onNumFocus}
                    onBlur={(e) => setRhs(c.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-subtle">
        Arrastrá el borde de una columna para ensancharla. Flechas, Enter y Tab recorren las celdas. Vacío = 0.
      </p>
    </div>
  );
}
