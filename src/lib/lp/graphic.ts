import type { GraphicLine, GraphicModel, LpModel, Vertex } from "./types";

const EPS = 1e-8;

function halfplanes(model: LpModel): { lines: GraphicLine[]; cx: number; cy: number; vx: string; vy: string } | null {
  if (model.variables.length !== 2) return null;
  const [vx, vy] = model.variables;
  const cx = model.objective[vx.id] ?? 0;
  const cy = model.objective[vy.id] ?? 0;
  const lines: GraphicLine[] = [];

  const push = (a: number, b: number, c: number, name: string, relation: GraphicLine["relation"]) => {
    if (Math.abs(a) < EPS && Math.abs(b) < EPS) return;
    // store as a x + b y ? c
    lines.push({ a, b, c, name, relation });
  };

  for (const con of model.constraints) {
    push(con.coeffs[vx.id] ?? 0, con.coeffs[vy.id] ?? 0, con.rhs, con.name, con.relation);
  }
  // default x>=0, y>=0 if not free
  if (!vx.free && (vx.lower ?? 0) === 0) push(1, 0, 0, `${vx.name} ≥ 0`, ">=");
  else if (!vx.free && vx.lower != null && vx.lower !== 0) push(1, 0, vx.lower, `${vx.name} ≥ ${vx.lower}`, ">=");
  if (!vy.free && (vy.lower ?? 0) === 0) push(0, 1, 0, `${vy.name} ≥ 0`, ">=");
  else if (!vy.free && vy.lower != null && vy.lower !== 0) push(0, 1, vy.lower, `${vy.name} ≥ ${vy.lower}`, ">=");
  if (vx.upper != null) push(1, 0, vx.upper, `${vx.name} ≤ ${vx.upper}`, "<=");
  if (vy.upper != null) push(0, 1, vy.upper, `${vy.name} ≤ ${vy.upper}`, "<=");

  return { lines, cx, cy, vx: vx.name, vy: vy.name };
}

function satisfies(x: number, y: number, lines: GraphicLine[]): boolean {
  for (const L of lines) {
    const v = L.a * x + L.b * y;
    if (L.relation === "<=" && v > L.c + EPS) return false;
    if (L.relation === ">=" && v < L.c - EPS) return false;
    if (L.relation === "=" && Math.abs(v - L.c) > 1e-5) return false;
  }
  return true;
}

function intersect(p: GraphicLine, q: GraphicLine): { x: number; y: number } | null {
  const det = p.a * q.b - q.a * p.b;
  if (Math.abs(det) < 1e-12) return null;
  const x = (p.c * q.b - q.c * p.b) / det;
  const y = (p.a * q.c - q.a * p.c) / det;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function hull(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const uniq: { x: number; y: number }[] = [];
  for (const p of points) {
    if (uniq.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-7)) continue;
    uniq.push(p);
  }
  if (uniq.length <= 2) return uniq;
  uniq.sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: { x: number; y: number }[] = [];
  for (const p of uniq) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: { x: number; y: number }[] = [];
  for (let i = uniq.length - 1; i >= 0; i--) {
    const p = uniq[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function buildGraphic(model: LpModel): GraphicModel | null {
  const hp = halfplanes(model);
  if (!hp) return null;
  const { lines, cx, cy, vx, vy } = hp;

  const raw: { x: number; y: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const p = intersect(lines[i], lines[j]);
      if (!p) continue;
      if (Math.abs(p.x) > 1e7 || Math.abs(p.y) > 1e7) continue;
      if (satisfies(p.x, p.y, lines)) raw.push(p);
    }
  }

  const h = hull(raw);
  const vertices: Vertex[] = h.map((p, idx) => ({
    x: Math.abs(p.x) < 1e-10 ? 0 : p.x,
    y: Math.abs(p.y) < 1e-10 ? 0 : p.y,
    z: cx * p.x + cy * p.y,
    label: `V${idx + 1}`,
  }));

  let unbounded = false;
  let infeasible = h.length === 0;

  // Detect unbounded: if we can walk far along a direction and still feasible
  if (!infeasible) {
    const xs = h.map((p) => p.x);
    const ys = h.map((p) => p.y);
    const span = Math.max(1, ...xs.map(Math.abs), ...ys.map(Math.abs));
    const probe = span * 20;
    const dirs = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    for (const [dx, dy] of dirs) {
      if (satisfies(dx * probe, dy * probe, lines)) unbounded = true;
    }
  }

  if (vertices.length) {
    if (model.sense === "max") {
      const best = Math.max(...vertices.map((v) => v.z));
      vertices.forEach((v) => {
        if (Math.abs(v.z - best) < 1e-6) v.optimal = true;
      });
    } else {
      const best = Math.min(...vertices.map((v) => v.z));
      vertices.forEach((v) => {
        if (Math.abs(v.z - best) < 1e-6) v.optimal = true;
      });
    }
  }

  const pad = 1.25;
  let xmin = 0,
    ymin = 0,
    xmax = 1,
    ymax = 1;
  if (vertices.length) {
    xmin = Math.min(0, ...vertices.map((v) => v.x));
    ymin = Math.min(0, ...vertices.map((v) => v.y));
    xmax = Math.max(...vertices.map((v) => v.x), 1);
    ymax = Math.max(...vertices.map((v) => v.y), 1);
  } else {
    xmax = 10;
    ymax = 10;
  }
  const dx = Math.max(xmax - xmin, 1);
  const dy = Math.max(ymax - ymin, 1);
  xmin -= dx * (pad - 1);
  ymin -= dy * (pad - 1);
  xmax += dx * (pad - 1);
  ymax += dy * (pad - 1);
  if (xmin > -0.05) xmin = Math.min(xmin, -dx * 0.08);

  return {
    varX: vx,
    varY: vy,
    sense: model.sense,
    cx,
    cy,
    lines,
    vertices,
    hull: h,
    unbounded,
    infeasible,
    bounds: { xmin, xmax, ymin, ymax },
  };
}
