import { Q } from "./fraction";
import type {
  Constraint,
  ConResult,
  LpModel,
  ObjRange,
  Relation,
  SolveResult,
  TableauSnap,
  Variable,
  VarResult,
  ColKind,
} from "./types";

const ZERO = Q.ZERO;
const ONE = Q.ONE;

interface Built {
  names: string[];
  origN: number;
  /** column of slack or surplus for each original constraint; -1 if none (equality) */
  slackCol: number[];
  artCol: number[];
  artCols: number[];
  intIdx: number[];
  c: Q[];
  cOrig: Q[];
  kinds: ColKind[];
  A: Q[][];
  b: Q[];
  relations: Relation[];
  conNames: string[];
  varTypes: Variable["type"][];
  sense: "max" | "min";
}

function coeff(map: Record<string, number>, id: string): Q {
  const v = map[id];
  if (v === undefined || v === null || Number.isNaN(v)) return ZERO;
  return Q.fromDecimal(v);
}

function build(model: LpModel): Built {
  const vars = model.variables.map((v) => ({ ...v }));
  const cons: Constraint[] = model.constraints.map((c) => ({
    ...c,
    coeffs: { ...c.coeffs },
  }));

  // Expand bounds / free / binary into extra constraints or substitutions
  for (const v of vars) {
    if (v.type === "binary") {
      const lo = v.lower ?? 0;
      const hi = v.upper ?? 1;
      v.lower = Math.max(lo, 0);
      v.upper = Math.min(hi, 1);
    }
    if (v.free) {
      v.lower = null;
      v.upper = null;
    }
  }

  // Split free vars into x+ - x- by rewriting coefficients (handled as two cols later)
  const names: string[] = [];
  const origMap: number[] = []; // original var index → first column
  const splitNeg: number[] = []; // original var index → x- column or -1
  const varTypes: Variable["type"][] = [];

  vars.forEach((v, i) => {
    origMap[i] = names.length;
    names.push(v.name);
    varTypes.push(v.type);
    if (v.free || (v.lower !== 0 && v.lower !== null && v.lower !== undefined)) {
      // shift later via constraint; free → two columns
    }
    if (v.free) {
      splitNeg[i] = names.length;
      names.push(v.name + "⁻");
      varTypes.push("continuous");
    } else {
      splitNeg[i] = -1;
    }
  });

  const origN = names.length;

  // Lower bound x >= L  (if L != 0 and not free): add constraint
  vars.forEach((v) => {
    if (v.free) return;
    const L = v.lower ?? 0;
    if (L !== 0) {
      cons.push({
        id: `lb-${v.id}`,
        name: `${v.name}≥${L}`,
        coeffs: { [v.id]: 1 },
        relation: ">=",
        rhs: L,
      });
    }
    if (v.upper !== null && v.upper !== undefined) {
      cons.push({
        id: `ub-${v.id}`,
        name: `${v.name}≤${v.upper}`,
        coeffs: { [v.id]: 1 },
        relation: "<=",
        rhs: v.upper,
      });
    }
  });

  const m = cons.length;
  const A0: Q[][] = [];
  const b: Q[] = [];
  const relations: Relation[] = [];
  const conNames: string[] = [];

  for (let i = 0; i < m; i++) {
    const row: Q[] = Array.from({ length: origN }, () => ZERO);
    vars.forEach((v, vi) => {
      const a = coeff(cons[i].coeffs, v.id);
      row[origMap[vi]] = a;
      if (splitNeg[vi] >= 0) row[splitNeg[vi]] = a.neg();
    });
    A0.push(row);
    b.push(Q.fromDecimal(cons[i].rhs));
    relations.push(cons[i].relation);
    conNames.push(cons[i].name || `R${i + 1}`);
  }

  // Flip rows with negative RHS
  for (let i = 0; i < m; i++) {
    if (b[i].isNegative()) {
      b[i] = b[i].neg();
      A0[i] = A0[i].map((x) => x.neg());
      relations[i] = relations[i] === "<=" ? ">=" : relations[i] === ">=" ? "<=" : "=";
    }
  }

  const slackCol: number[] = Array(m).fill(-1);
  const artCol: number[] = Array(m).fill(-1);
  const artCols: number[] = [];
  const A = A0.map((r) => r.slice());
  let n = origN;
  const kinds: ColKind[] = Array.from({ length: origN }, () => "var");

  const addCol = (name: string, column: Q[], kind: ColKind) => {
    names.push(name);
    kinds.push(kind);
    varTypes.push("continuous");
    for (let i = 0; i < m; i++) A[i].push(column[i] ?? ZERO);
    n++;
    return n - 1;
  };

  for (let i = 0; i < m; i++) {
    const tag = (conNames[i] || `R${i + 1}`).replace(/[^\wáéíóúñÁÉÍÓÚÑ]/gi, "").slice(0, 12) || `R${i + 1}`;
    if (relations[i] === "<=") {
      const col = Array.from({ length: m }, (_, r) => (r === i ? ONE : ZERO));
      slackCol[i] = addCol(`h_${tag}`, col, "slack");
    } else if (relations[i] === ">=") {
      const sur = Array.from({ length: m }, (_, r) => (r === i ? Q.NEG_ONE : ZERO));
      slackCol[i] = addCol(`e_${tag}`, sur, "surplus");
      const art = Array.from({ length: m }, (_, r) => (r === i ? ONE : ZERO));
      const ac = addCol(`a_${tag}`, art, "art");
      artCols.push(ac);
      artCol[i] = ac;
    } else {
      const art = Array.from({ length: m }, (_, r) => (r === i ? ONE : ZERO));
      const ac = addCol(`a_${tag}`, art, "art");
      artCols.push(ac);
      artCol[i] = ac;
    }
  }

  const c: Q[] = Array.from({ length: n }, () => ZERO);
  const cOrig: Q[] = Array.from({ length: n }, () => ZERO);
  vars.forEach((v, vi) => {
    const cj = coeff(model.objective, v.id);
    const signed = model.sense === "max" ? cj : cj.neg();
    c[origMap[vi]] = signed;
    cOrig[origMap[vi]] = cj;
    if (splitNeg[vi] >= 0) c[splitNeg[vi]] = signed.neg();
  });

  const intIdx: number[] = [];
  vars.forEach((v, vi) => {
    if (v.type === "integer" || v.type === "binary") intIdx.push(origMap[vi]);
  });

  return {
    names,
    origN,
    slackCol,
    artCol,
    artCols,
    intIdx,
    c,
    cOrig,
    kinds,
    A,
    b,
    relations,
    conNames,
    varTypes,
    sense: model.sense,
  };
}

interface Tableau {
  /** (m+1) x (n+1) ; row 0 is z-row (negated reduced costs for max), last col RHS */
  M: Q[][];
  basis: number[];
  names: string[];
  kinds: ColKind[];
  cOrig: Q[];
  n: number;
  m: number;
}

function primalZ(t: Tableau): Q {
  let z = ZERO;
  for (let i = 0; i < t.m; i++) {
    const j = t.basis[i];
    const cj = t.cOrig[j] ?? ZERO;
    z = z.add(cj.mul(t.M[i + 1][t.n]));
  }
  return z;
}

function snapshot(t: Tableau, extra: Partial<TableauSnap> & { phase: 1 | 2; iteration: number }): TableauSnap {
  const matrix: string[][] = t.M.map((row) => row.map((x) => x.toFraction()));
  return {
    labels: [...t.names, "LD"],
    kinds: t.kinds.slice(),
    cj: t.cOrig.map((q) => q.toFraction()),
    z: primalZ(t).toFraction(),
    basis: t.basis.map((j) => t.names[j] ?? `x${j}`),
    matrix,
    ...extra,
  };
}

function pivot(t: Tableau, row: number, col: number) {
  const piv = t.M[row][col];
  if (piv.isZero()) throw new Error("Pivote nulo");
  const width = t.n + 1;
  for (let j = 0; j < width; j++) {
    t.M[row][j] = t.M[row][j].div(piv);
  }
  for (let i = 0; i <= t.m; i++) {
    if (i === row) continue;
    const f = t.M[i][col];
    if (f.isZero()) continue;
    for (let j = 0; j < width; j++) {
      t.M[i][j] = t.M[i][j].sub(f.mul(t.M[row][j]));
    }
  }
  t.basis[row - 1] = col;
}

function minRatio(t: Tableau, col: number): number {
  let bestRow = -1;
  let bestRatio: Q | null = null;
  let bestBasis = Infinity;
  for (let i = 1; i <= t.m; i++) {
    const a = t.M[i][col];
    if (!a.isPositive()) continue;
    const ratio = t.M[i][t.n].div(a);
    const bidx = t.basis[i - 1];
    if (
      bestRatio === null ||
      ratio.cmp(bestRatio) < 0 ||
      (ratio.eq(bestRatio) && bidx < bestBasis)
    ) {
      bestRatio = ratio;
      bestRow = i;
      bestBasis = bidx;
    }
  }
  return bestRow;
}

function entering(t: Tableau, artSet: Set<number>): number {
  let best = -1;
  let bestVal: Q | null = null;
  for (let j = 0; j < t.n; j++) {
    if (artSet.has(j)) continue;
    if (t.basis.includes(j)) continue;
    const v = t.M[0][j];
    if (!v.isNegative()) continue;
    if (bestVal === null || v.cmp(bestVal) < 0 || (v.eq(bestVal) && j < best)) {
      bestVal = v;
      best = j;
    }
  }
  return best;
}

function solveTableau(
  t: Tableau,
  artSet: Set<number>,
  snaps: TableauSnap[],
  phase: 1 | 2,
  startIter: number,
  keepSnaps: boolean,
  maxIter = 400,
): { status: "optimal" | "unbounded"; iterations: number } {
  let iter = startIter;
  if (keepSnaps) snaps.push(snapshot(t, { phase, iteration: iter, note: `Inicio fase ${phase}` }));
  for (;;) {
    if (iter - startIter > maxIter) throw new Error("Límite de iteraciones del simplex");
    const col = entering(t, artSet);
    if (col < 0) return { status: "optimal", iterations: iter };
    const row = minRatio(t, col);
    if (row < 0) return { status: "unbounded", iterations: iter };
    const leaving = t.names[t.basis[row - 1]] ?? "?";
    pivot(t, row, col);
    iter++;
    if (keepSnaps) {
      snaps.push(
        snapshot(t, {
          phase,
          iteration: iter,
          entering: t.names[col],
          leaving,
          note: `Entra ${t.names[col]}, sale ${leaving}`,
        }),
      );
    }
  }
}

function twoPhase(built: Built, keepSnaps: boolean): {
  status: "optimal" | "infeasible" | "unbounded";
  t: Tableau;
  snaps: TableauSnap[];
  iterations: number;
} {
  const { A, b, c, names, artCols } = built;
  const m = A.length;
  const n = names.length;
  const M: Q[][] = [];
  // z row
  M.push(Array.from({ length: n + 1 }, () => ZERO));
  for (let i = 0; i < m; i++) {
    M.push([...A[i], b[i]]);
  }
  const basis: number[] = [];
  // Initial basis: slack for <=, artificial for >= and =
  const used = new Set<number>();
  for (let i = 0; i < m; i++) {
    let col = -1;
    if (built.slackCol[i] >= 0 && built.relations[i] === "<=") {
      col = built.slackCol[i];
    } else {
      col = artCols.find((a) => !used.has(a) && !A[i][a].isZero()) ?? -1;
    }
    if (col < 0) throw new Error("No se pudo armar una base inicial");
    used.add(col);
    basis.push(col);
  }

  const t: Tableau = { M, basis, names: names.slice(), kinds: built.kinds.slice(), cOrig: built.cOrig.slice(), n, m };
  const artSet = new Set(artCols);
  const snaps: TableauSnap[] = [];

  const needPhase1 = artCols.length > 0;
  let iterations = 0;

  if (needPhase1) {
    // Phase I: maximize -∑artificials. z-row starts as -c with c_art = -1 → +1 on art cols,
    // then eliminate basic artificials so those columns are 0.
    for (let j = 0; j <= n; j++) t.M[0][j] = ZERO;
    for (const a of artCols) t.M[0][a] = ONE;
    for (const a of artCols) {
      const r = t.basis.findIndex((bidx) => bidx === a) + 1;
      if (r <= 0) continue;
      const f = t.M[0][a];
      if (f.isZero()) continue;
      for (let j = 0; j <= n; j++) t.M[0][j] = t.M[0][j].sub(f.mul(t.M[r][j]));
    }
    const p1 = solveTableau(t, new Set(), snaps, 1, 0, keepSnaps);
    iterations = p1.iterations;
    if (p1.status === "unbounded") {
      return { status: "infeasible", t, snaps, iterations };
    }
    const w = t.M[0][n];
    if (w.isNegative()) {
      return { status: "infeasible", t, snaps, iterations };
    }
    for (let i = 0; i < m; i++) {
      if (!artSet.has(t.basis[i])) continue;
      if (!t.M[i + 1][n].isZero()) {
        return { status: "infeasible", t, snaps, iterations };
      }
      for (let j = 0; j < n; j++) {
        if (artSet.has(j)) continue;
        if (!t.M[i + 1][j].isZero()) {
          pivot(t, i + 1, j);
          break;
        }
      }
    }
  }

  // Restore original objective (always maximize the signed c)
  for (let j = 0; j <= n; j++) t.M[0][j] = ZERO;
  for (let j = 0; j < n; j++) {
    t.M[0][j] = c[j] ? c[j].neg() : ZERO;
  }
  // Eliminate basic columns from z-row
  for (let i = 0; i < m; i++) {
    const col = t.basis[i];
    const f = t.M[0][col];
    if (f.isZero()) continue;
    for (let j = 0; j <= n; j++) {
      t.M[0][j] = t.M[0][j].sub(f.mul(t.M[i + 1][j]));
    }
  }

  // Ignore artificial columns in entering (treat as already optimal if only they are negative)
  const p2 = solveTableau(t, artSet, snaps, 2, iterations, keepSnaps);
  iterations = p2.iterations;
  if (p2.status === "unbounded") return { status: "unbounded", t, snaps, iterations };

  // If a non-artificial still has negative reduced cost but was blocked... already handled
  return { status: "optimal", t, snaps, iterations };
}

function extractLP(model: LpModel, built: Built, keepSnaps: boolean): SolveResult {
  const { t, snaps, iterations, status } = twoPhase(built, keepSnaps);

  if (status === "infeasible") {
    return {
      status: "infeasible",
      message: "El modelo es infactible: no existe un punto que cumpla todas las restricciones.",
      sense: model.sense,
      z: ZERO,
      variables: [],
      constraints: [],
      objRanges: [],
      tableaus: snaps,
      iterations,
    };
  }
  if (status === "unbounded") {
    return {
      status: "unbounded",
      message:
        "El modelo no está acotado: la función objetivo puede mejorar indefinidamente.",
      sense: model.sense,
      z: ZERO,
      variables: [],
      constraints: [],
      objRanges: [],
      tableaus: snaps,
      iterations,
    };
  }

  const n = t.n;
  const shownVars = model.variables;
  const nameCol = new Map<string, number>();
  built.names.forEach((nm, j) => nameCol.set(nm, j));

  const varResults: VarResult[] = shownVars.map((v) => {
    const j = nameCol.get(v.name) ?? -1;
    const jn = nameCol.get(v.name + "⁻") ?? -1;
    let val = ZERO;
    if (j >= 0) {
      const bi = t.basis.indexOf(j);
      if (bi >= 0) val = t.M[bi + 1][n];
    }
    if (jn >= 0) {
      const bi = t.basis.indexOf(jn);
      if (bi >= 0) val = val.sub(t.M[bi + 1][n]);
    }
    const reducedCost = j >= 0 ? t.M[0][j] : ZERO;
    return {
      name: v.name,
      value: val,
      reducedCost,
      type: v.type,
    };
  });

  // Objective value: tableau RHS of z is the max of signed c. If original min, z_orig = -z_tab
  let z = t.M[0][n];
  if (model.sense === "min") z = z.neg();

  const cons: ConResult[] = [];
  const objRanges: ObjRange[] = [];

  built.conNames.forEach((name, i) => {
    // skip generated bound constraints? include them — actually they pollute the report.
    const origCount = model.constraints.length;
    if (i >= origCount) return;

    const sCol = built.slackCol[i];
    let slack = ZERO;
    if (sCol >= 0) {
      const bi = t.basis.indexOf(sCol);
      if (bi >= 0) slack = t.M[bi + 1][n];
      // for >= , slack col is surplus (e), value is excess
    }
    // Dual: for max, dual of <= is the z-row coeff of the slack
    // Tableau z-row of slack s_i equals the shadow price y_i (for max / <=)
    let dual = ZERO;
    if (sCol >= 0) dual = t.M[0][sCol];
    else if (built.artCol[i] >= 0) dual = t.M[0][built.artCol[i]];
    if (model.sense === "min") dual = dual.neg();
    if (built.relations[i] === ">=") dual = dual.neg();

    // RHS ranging from B^{-1} column = slack column of tableau (for <=)
    let rhsDec: Q | null = null;
    let rhsInc: Q | null = null;
    if (sCol >= 0) {
      const d: Q[] = [];
      const rhs: Q[] = [];
      for (let r = 1; r <= t.m; r++) {
        d.push(t.M[r][sCol]);
        rhs.push(t.M[r][n]);
      }
      // For <=, Δb maps through +d. Need rhs + Δ d >= 0
      // For >= surplus column is -B^{-1}a, signs differ.
      const sign = built.relations[i] === ">=" ? Q.NEG_ONE : ONE;
      let lo: Q | null = null;
      let hi: Q | null = null;
      for (let r = 0; r < d.length; r++) {
        const dd = d[r].mul(sign);
        if (dd.isZero()) continue;
        const bound = rhs[r].div(dd).neg(); // Δ >= -b/d if d>0?  b + Δ d >= 0 → Δ d >= -b
        if (dd.isPositive()) {
          // Δ >= -b/d
          const lim = rhs[r].div(dd).neg();
          if (lo === null || lim.cmp(lo) > 0) lo = lim;
        } else {
          const lim = rhs[r].div(dd).neg();
          if (hi === null || lim.cmp(hi) < 0) hi = lim;
        }
      }
      rhsDec = lo === null ? null : lo.abs().isZero() && lo.isNegative() ? ZERO : lo.neg().isPositive() ? lo.abs() : lo.isNegative() ? lo.abs() : ZERO;
      // lo is the most restrictive lower bound on Δ (typically negative or 0)
      // allowable decrease = -lo if lo < 0 else 0 if lo>=0 blocked
      rhsDec = lo === null ? null : lo.isNegative() ? lo.neg() : ZERO;
      rhsInc = hi === null ? null : hi.isPositive() ? hi : ZERO;
    }

    cons.push({
      name,
      slack,
      dual,
      relation: model.constraints[i].relation,
      rhs: model.constraints[i].rhs,
      rhsDec,
      rhsInc,
      objDec: null,
      objInc: null,
    });
  });

  // Objective coefficient ranges for original variables
  shownVars.forEach((v, vi) => {
    const j = nameCol.get(v.name) ?? -1;
    if (j < 0) {
      objRanges.push({ name: v.name, coeff: model.objective[v.id] ?? 0, dec: null, inc: null });
      return;
    }
    const isBasic = t.basis.includes(j);
    let dec: Q | null = null;
    let inc: Q | null = null;
    if (!isBasic) {
      // nonbasic: reduced cost rc = z_j. For max, can decrease c freely? 
      // tableau coeff ẑ_j = -rc_true for our sign... We stored z-row as (z_j - c_j) after max convention.
      // Nonbasic reduced cost r = M[0][j] >= 0 at opt for max.
      // Increasing c_j by δ (max) decreases r by δ → r-δ >= 0 → δ <= r
      const r = t.M[0][j];
      if (model.sense === "max") {
        dec = null;
        inc = r;
      } else {
        dec = r;
        inc = null;
      }
    } else {
      // basic: changing c_j changes the z-row of nonbasics
      const brow = t.basis.indexOf(j) + 1;
      // ẑ_k(new) = ẑ_k - δ * A_bk  (because z-row -= δ * basic row when c_j += δ for max)
      // Need ẑ_k - δ a_k >= 0 for all nonbasic k
      let lo: Q | null = null;
      let hi: Q | null = null;
      for (let k = 0; k < n; k++) {
        if (k === j) continue;
        if (built.artCols.includes(k)) continue;
        if (t.basis.includes(k) && t.M[0][k].isZero()) continue;
        const a = t.M[brow][k];
        const zk = t.M[0][k];
        if (a.isZero()) continue;
        // zk - δ a >= 0 → -δ a >= -zk → signs
        if (a.isPositive()) {
          // δ <= zk/a
          const lim = zk.div(a);
          if (hi === null || lim.cmp(hi) < 0) hi = lim;
        } else {
          // δ >= zk/a
          const lim = zk.div(a);
          if (lo === null || lim.cmp(lo) > 0) lo = lim;
        }
      }
      dec = lo === null ? null : lo.isNegative() ? lo.neg() : ZERO;
      inc = hi === null ? null : hi.isPositive() ? hi : ZERO;
    }
    objRanges.push({
      name: v.name,
      coeff: model.objective[v.id] ?? 0,
      dec,
      inc,
    });
  });

  return {
    status: "optimal",
    message: "Solución óptima global encontrada.",
    sense: model.sense,
    z,
    variables: varResults,
    constraints: cons,
    objRanges,
    tableaus: snaps,
    iterations,
  };
}

function isInt(q: Q): boolean {
  return q.d === 1n;
}

function fractionalScore(q: Q): Q {
  if (q.isInteger()) return ZERO;
  const fl = q.floor();
  const frac = q.sub(fl);
  const dist = frac.cmp(new Q(1n, 2n)) > 0 ? ONE.sub(frac) : frac;
  return dist;
}

function applyBound(model: LpModel, varId: string, which: "upper" | "lower", value: number): LpModel {
  return {
    ...model,
    variables: model.variables.map((v) =>
      v.id === varId
        ? {
            ...v,
            upper: which === "upper" ? value : v.upper,
            lower: which === "lower" ? value : v.lower ?? 0,
          }
        : v,
    ),
  };
}

function branchBound(model: LpModel): SolveResult {
  const intVars = model.variables.filter((v) => v.type === "integer" || v.type === "binary");
  const keepRootSnaps = true;
  const rootBuilt = build(model);
  const root = extractLP(model, rootBuilt, keepRootSnaps);
  if (root.status !== "optimal") return root;
  if (intVars.length === 0) return root;

  const allInt = root.variables.every((vr) => {
    const v = model.variables.find((x) => x.name === vr.name);
    if (!v || (v.type !== "integer" && v.type !== "binary")) return true;
    return isInt(vr.value);
  });
  if (allInt) {
    return { ...root, status: "integer-optimal", message: "Solución entera óptima encontrada." };
  }

  type Node = { model: LpModel; bound: Q };
  const sense = model.sense;
  let best: SolveResult | null = null;
  let nodes = 0;
  const stack: Node[] = [{ model, bound: root.z }];
  const MAX_NODES = 250;

  while (stack.length && nodes < MAX_NODES) {
    const node = stack.pop()!;
    nodes++;
    if (best) {
      if (sense === "max" && node.bound.cmp(best.z) <= 0) continue;
      if (sense === "min" && node.bound.cmp(best.z) >= 0) continue;
    }
    let rel: SolveResult;
    try {
      rel = extractLP(node.model, build(node.model), false);
    } catch {
      continue;
    }
    if (rel.status !== "optimal") continue;
    const fracVar = rel.variables
      .map((vr) => {
        const v = node.model.variables.find((x) => x.name === vr.name);
        if (!v || (v.type !== "integer" && v.type !== "binary")) return null;
        if (isInt(vr.value)) return null;
        return { v, vr, score: fractionalScore(vr.value) };
      })
      .filter((x): x is { v: Variable; vr: VarResult; score: Q } => x !== null)
      .sort((a, b) => b.score.cmp(a.score))[0];

    if (!fracVar) {
      if (
        !best ||
        (sense === "max" && rel.z.cmp(best.z) > 0) ||
        (sense === "min" && rel.z.cmp(best.z) < 0)
      ) {
        best = {
          ...rel,
          status: "integer-optimal",
          message: "Solución entera óptima encontrada.",
          tableaus: root.tableaus,
        };
      }
      continue;
    }
    const fl = fracVar.vr.value.floor().toNumber();
    const cl = fracVar.vr.value.ceil().toNumber();
    const down = applyBound(node.model, fracVar.v.id, "upper", fl);
    const up = applyBound(node.model, fracVar.v.id, "lower", cl);
    stack.push({ model: down, bound: rel.z }, { model: up, bound: rel.z });
  }

  if (!best) {
    return {
      ...root,
      status: "infeasible",
      message: "No se encontró una solución entera factible.",
      nodes,
    };
  }
  return { ...best, nodes, iterations: root.iterations, tableaus: root.tableaus };
}

export function solveModel(model: LpModel): SolveResult {
  try {
    if (model.variables.length === 0) {
      return {
        status: "error",
        message: "Definí al menos una variable de decisión.",
        sense: model.sense,
        z: ZERO,
        variables: [],
        constraints: [],
        objRanges: [],
        tableaus: [],
        iterations: 0,
      };
    }
    const hasInt = model.variables.some((v) => v.type === "integer" || v.type === "binary");
    if (hasInt) return branchBound(model);
    return extractLP(model, build(model), true);
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Error al resolver el modelo.",
      sense: model.sense,
      z: ZERO,
      variables: [],
      constraints: [],
      objRanges: [],
      tableaus: [],
      iterations: 0,
    };
  }
}

export function modelHasTwoVars(model: LpModel): boolean {
  return model.variables.filter((v) => !v.free).length === 2;
}
