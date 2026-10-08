import { useMemo, useState } from "react";
import type { GraphicModel } from "@/lib/lp/types";
import { formatNum } from "@/lib/format";

export function GraphicPlot({ g }: { g: GraphicModel }) {
  const vb = g.bounds;
  const w = vb.xmax - vb.xmin;
  const h = vb.ymax - vb.ymin;
  const pad = 56;
  const W = 640;
  const H = 520;
  const xOf = (x: number) => pad + ((x - vb.xmin) / w) * (W - pad * 1.55);
  const yOf = (y: number) => H - pad - ((y - vb.ymin) / h) * (H - pad * 1.55);

  const ticks = (min: number, max: number) => {
    const span = max - min;
    const step = niceStep(span / 6);
    const out: number[] = [];
    const start = Math.ceil(min / step) * step;
    for (let v = start; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(8)));
    return out;
  };

  const hullD = g.hull.length
    ? `M ${g.hull.map((p) => `${xOf(p.x)} ${yOf(p.y)}`).join(" L ")} Z`
    : "";

  const [iso, setIso] = useState(() => {
    const opt = g.vertices.find((v) => v.optimal);
    return opt ? opt.z : 0;
  });

  const isoLine = useMemo(() => {
    const { cx, cy } = g;
    if (Math.abs(cx) < 1e-12 && Math.abs(cy) < 1e-12) return null;
    const pts: { x: number; y: number }[] = [];
    const edges: [number, number, number, number][] = [
      [vb.xmin, vb.ymin, vb.xmax, vb.ymin],
      [vb.xmin, vb.ymax, vb.xmax, vb.ymax],
      [vb.xmin, vb.ymin, vb.xmin, vb.ymax],
      [vb.xmax, vb.ymin, vb.xmax, vb.ymax],
    ];
    for (const [x1, y1, x2, y2] of edges) {
      // cx x + cy y = iso along segment
      const d1 = cx * x1 + cy * y1 - iso;
      const d2 = cx * x2 + cy * y2 - iso;
      if (Math.abs(d1) < 1e-8) pts.push({ x: x1, y: y1 });
      if (Math.abs(d2) < 1e-8) pts.push({ x: x2, y: y2 });
      if (d1 * d2 < 0) {
        const t = d1 / (d1 - d2);
        pts.push({ x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) });
      }
    }
    if (pts.length < 2) return null;
    return { a: pts[0], b: pts[pts.length - 1] };
  }, [g, iso, vb]);

  const constraintSegs = g.lines.map((L) => {
    const pts: { x: number; y: number }[] = [];
    const box = [
      { x: vb.xmin, y: L.b === 0 ? 0 : (L.c - L.a * vb.xmin) / (L.b || 1e-12) },
      { x: vb.xmax, y: L.b === 0 ? 0 : (L.c - L.a * vb.xmax) / (L.b || 1e-12) },
      { x: L.a === 0 ? 0 : (L.c - L.b * vb.ymin) / (L.a || 1e-12), y: vb.ymin },
      { x: L.a === 0 ? 0 : (L.c - L.b * vb.ymax) / (L.a || 1e-12), y: vb.ymax },
    ];
    for (const p of box) {
      if (p.x >= vb.xmin - 1e-6 && p.x <= vb.xmax + 1e-6 && p.y >= vb.ymin - 1e-6 && p.y <= vb.ymax + 1e-6) {
        if (Math.abs(L.a * p.x + L.b * p.y - L.c) < 1e-4) pts.push(p);
      }
    }
    const uniq = pts.filter((p, i) => pts.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-6) === i);
    if (uniq.length < 2) return { ...L, a1: uniq[0], a2: uniq[0] };
    return { ...L, a1: uniq[0], a2: uniq[1] };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Región factible">
          <rect width={W} height={H} fill="var(--surface)" />
          {ticks(vb.xmin, vb.xmax).map((x) => (
            <g key={`vx${x}`}>
              <line x1={xOf(x)} y1={yOf(vb.ymin)} x2={xOf(x)} y2={yOf(vb.ymax)} stroke="var(--fg)" strokeOpacity="0.07" />
              <text x={xOf(x)} y={yOf(0) + 16} fill="var(--subtle)" fontSize="11" textAnchor="middle">
                {formatNum(x, 2)}
              </text>
            </g>
          ))}
          {ticks(vb.ymin, vb.ymax).map((y) => (
            <g key={`vy${y}`}>
              <line x1={xOf(vb.xmin)} y1={yOf(y)} x2={xOf(vb.xmax)} y2={yOf(y)} stroke="var(--fg)" strokeOpacity="0.07" />
              <text x={xOf(0) - 8} y={yOf(y) + 4} fill="var(--subtle)" fontSize="11" textAnchor="end">
                {formatNum(y, 2)}
              </text>
            </g>
          ))}
          <line x1={xOf(vb.xmin)} y1={yOf(0)} x2={xOf(vb.xmax)} y2={yOf(0)} stroke="var(--muted)" strokeWidth="1.2" />
          <line x1={xOf(0)} y1={yOf(vb.ymin)} x2={xOf(0)} y2={yOf(vb.ymax)} stroke="var(--muted)" strokeWidth="1.2" />
          <text x={xOf(vb.xmax) - 8} y={yOf(0) - 8} fill="var(--steel)" fontSize="12">
            {g.varX}
          </text>
          <text x={xOf(0) + 8} y={yOf(vb.ymax) + 14} fill="var(--steel)" fontSize="12">
            {g.varY}
          </text>

          {constraintSegs.map(
            (s, i) =>
              s.a1 &&
              s.a2 && (
                <line
                  key={i}
                  x1={xOf(s.a1.x)}
                  y1={yOf(s.a1.y)}
                  x2={xOf(s.a2.x)}
                  y2={yOf(s.a2.y)}
                  stroke="var(--steel)"
                  strokeWidth="1.4"
                  strokeOpacity="0.85"
                />
              ),
          )}

          {hullD && <path d={hullD} fill="var(--steel)" fillOpacity="0.18" stroke="var(--steel)" strokeWidth="1.8" />}

          {isoLine && (
            <line
              x1={xOf(isoLine.a.x)}
              y1={yOf(isoLine.a.y)}
              x2={xOf(isoLine.b.x)}
              y2={yOf(isoLine.b.y)}
              stroke="var(--fg)"
              strokeDasharray="6 4"
              strokeWidth="1.5"
            />
          )}

          {g.vertices.map((v) => (
            <g key={v.label}>
              <circle
                cx={xOf(v.x)}
                cy={yOf(v.y)}
                r={v.optimal ? 7 : 4.5}
                fill={v.optimal ? "var(--opt)" : "var(--fg)"}
              />
              {v.optimal && (
                <text
                  x={xOf(v.x) + 12}
                  y={yOf(v.y) + 16}
                  fill="var(--opt)"
                  fontSize="12"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  {`óptimo (${formatNum(v.x, 2)}, ${formatNum(v.y, 2)})`}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {g.infeasible && <p className="text-sm text-danger">La región factible está vacía.</p>}
      {g.unbounded && !g.infeasible && (
        <p className="text-sm text-warn">La región factible no está acotada (el recorte es solo visual).</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">
          Curva de nivel z = {formatNum(iso, 2)}
          {g.cx || g.cy ? `  ·  ${formatNum(g.cx, 2)}${g.varX} + ${formatNum(g.cy, 2)}${g.varY}` : ""}
        </span>
        <input
          type="range"
          min={isoMin(g)}
          max={isoMax(g)}
          step={(isoMax(g) - isoMin(g)) / 80 || 1}
          value={iso}
          onChange={(e) => setIso(Number(e.target.value))}
          className="h-11 w-full accent-steel"
        />
      </label>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs text-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Vértice</th>
              <th className="px-3 py-2 text-right font-medium">{g.varX}</th>
              <th className="px-3 py-2 text-right font-medium">{g.varY}</th>
              <th className="px-3 py-2 text-right font-medium">z</th>
            </tr>
          </thead>
          <tbody>
            {g.vertices.map((v) => (
              <tr key={v.label} className="border-t border-border">
                <td className={`px-3 py-2 ${v.optimal ? "text-opt font-medium" : ""}`}>
                  {v.optimal ? "Óptimo" : v.label}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular">{formatNum(v.x, 4)}</td>
                <td className="px-3 py-2 text-right font-mono tabular">{formatNum(v.y, 4)}</td>
                <td className="px-3 py-2 text-right font-mono tabular">{formatNum(v.z, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  if (f < 1.5) return exp;
  if (f < 3) return 2 * exp;
  if (f < 7) return 5 * exp;
  return 10 * exp;
}

function isoMin(g: GraphicModel) {
  if (!g.vertices.length) return -10;
  const zs = g.vertices.map((v) => v.z);
  return Math.min(...zs) - Math.abs(Math.min(...zs)) * 0.4 - 1;
}
function isoMax(g: GraphicModel) {
  if (!g.vertices.length) return 10;
  const zs = g.vertices.map((v) => v.z);
  return Math.max(...zs) + Math.abs(Math.max(...zs)) * 0.4 + 1;
}
