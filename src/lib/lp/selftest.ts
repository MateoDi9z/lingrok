import { EXAMPLES } from "./examples";
import { parseLingo, toLingo } from "./parser";
import { solveModel } from "./solver";
import type { LpModel } from "./types";
import { uid } from "./ids";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function close(a: number, b: number, eps = 1e-6) {
  assert(Math.abs(a - b) < eps, `expected ${b}, got ${a}`);
}

function v(name: string, type: LpModel["variables"][0]["type"] = "continuous"): LpModel["variables"][0] {
  return { id: uid("v"), name, type, lower: 0, upper: type === "binary" ? 1 : null };
}

function model(
  sense: "max" | "min",
  vars: ReturnType<typeof v>[],
  obj: number[],
  cons: { a: number[]; rel: "<=" | ">=" | "="; rhs: number }[],
): LpModel {
  const objective: Record<string, number> = {};
  vars.forEach((vr, i) => {
    objective[vr.id] = obj[i] ?? 0;
  });
  return {
    id: "t",
    name: "t",
    description: "",
    sense,
    objective,
    variables: vars,
    constraints: cons.map((c, i) => {
      const coeffs: Record<string, number> = {};
      vars.forEach((vr, j) => {
        if (c.a[j]) coeffs[vr.id] = c.a[j];
      });
      return { id: "c" + i, name: "R" + (i + 1), coeffs, relation: c.rel, rhs: c.rhs };
    }),
    lingoSource: "",
    updatedAt: 0,
  };
}

function val(r: ReturnType<typeof solveModel>, name: string) {
  return r.variables.find((x) => x.name === name)?.value.toNumber() ?? NaN;
}

export function runSelftest() {
  const wyndor = EXAMPLES.find((e) => e.id === "hillier")!.build();
  const r1 = solveModel(wyndor);
  assert(r1.status === "optimal", "wyndor status " + r1.status);
  close(r1.z.toNumber(), 36);
  close(val(r1, "Puertas"), 2);
  close(val(r1, "Ventanas"), 6);

  const diet = EXAMPLES.find((e) => e.id === "dieta")!.build();
  const r2 = solveModel(diet);
  assert(r2.status === "optimal", "diet status " + r2.status);
  close(r2.z.toNumber(), 20);
  close(val(r2, "AlimA"), 10);
  close(val(r2, "AlimB"), 0);

  const mesas = EXAMPLES.find((e) => e.id === "mesas")!.build();
  const r3 = solveModel(mesas);
  assert(r3.status === "optimal", "mesas " + r3.status);
  // 20 M + 15 S, 2M+S<=100, M+2S<=80 → M=40, S=20, z=1100
  close(r3.z.toNumber(), 1100);
  close(val(r3, "Mesas"), 40);
  close(val(r3, "Sillas"), 20);

  const inf = model("max", [v("X")], [1], [
    { a: [1], rel: "<=", rhs: 1 },
    { a: [1], rel: ">=", rhs: 4 },
  ]);
  assert(solveModel(inf).status === "infeasible", "infeasible");

  const unb = model("max", [v("X")], [1], [{ a: [1], rel: ">=", rhs: 0 }]);
  assert(solveModel(unb).status === "unbounded", "unbounded got " + solveModel(unb).status);

  const knap = EXAMPLES.find((e) => e.id === "mochila")!.build();
  const r4 = solveModel(knap);
  assert(r4.status === "integer-optimal", "knap " + r4.status);
  close(r4.z.toNumber(), 42);

  const src = toLingo(wyndor);
  const parsed = parseLingo(src);
  assert(!!parsed.model && parsed.errors.length === 0, "parse errors " + JSON.stringify(parsed.errors));
  const r5 = solveModel(parsed.model!);
  close(r5.z.toNumber(), 36);

  const lingo = `
MAX = 3*X1 + 5*X2;
X1 <= 4;
2*X2 <= 12;
3*X1 + 2*X2 <= 18;
`;
  const p = parseLingo(lingo);
  assert(!!p.model, "lingo parse");
  const r6 = solveModel(p.model!);
  close(r6.z.toNumber(), 36);
  close(val(r6, "X1"), 2);
  close(val(r6, "X2"), 6);

  const classic = `
MODEL:
MAX = 20XA + 30XB;
BI) 5XA + 8XB <= 10;
END
`;
  const pc = parseLingo(classic);
  assert(!!pc.model && pc.errors.length === 0, "classic parse " + JSON.stringify(pc.errors));
  assert(pc.model!.constraints[0].name === "BI", "row name BI");
  assert(pc.model!.variables.some((x) => x.name === "XA"), "XA");
  const xa = pc.model!.variables.find((x) => x.name === "XA")!;
  const xb = pc.model!.variables.find((x) => x.name === "XB")!;
  assert(pc.model!.constraints[0].coeffs[xa.id] === 5, "5XA");
  assert(pc.model!.constraints[0].coeffs[xb.id] === 8, "8XB");

  const out = toLingo(pc.model!);
  assert(out.includes("BI) 5XA + 8XB <= 10;"), "emit classic, got:\n" + out);
  assert(!out.includes("*"), "no asterisks:\n" + out);
  assert(!out.includes("[BI]"), "no bracket names:\n" + out);

  const glued = `
MAX = 3X1 + 5X2;
C1) X1 <= 4;
C2) 2X2 <= 12;
C3) 3X1 + 2X2 <= 18;
`;
  const pg = parseLingo(glued);
  assert(!!pg.model, "glued parse");
  const rg = solveModel(pg.model!);
  close(rg.z.toNumber(), 36);
  close(val(rg, "X1"), 2);
  close(val(rg, "X2"), 6);

  const setsSrc = `
SETS:
    Productos / P1..P5 /: X, Costo, Demanda;
ENDSETS
DATA:
    Costo = 12 15 10 18 14;
    Demanda = 100 80 120 90 110;
ENDDATA
MIN = @SUM( Productos(i): Costo(i) * X(i) );
@FOR( Productos(i):
    X(i) <= Demanda(i)
);
@FOR( Productos(i):
    X(i) >= 0
);
`;
  const ps = parseLingo(setsSrc);
  assert(!!ps.model && ps.errors.length === 0, "sets parse " + JSON.stringify(ps.errors));
  assert(ps.model!.variables.length === 5, "5 products, got " + ps.model!.variables.length);
  const names = ps.model!.variables.map((v) => v.name).sort();
  assert(names.join(" ") === "X_P1 X_P2 X_P3 X_P4 X_P5", "names " + names.join(" "));
  const xp1 = ps.model!.variables.find((v) => v.name === "X_P1")!;
  assert(ps.model!.objective[xp1.id] === 12, "costo P1");
  assert(ps.model!.sense === "min", "min");
  assert(ps.model!.constraints.length === 5, "5 demand rows (x>=0 dropped), got " + ps.model!.constraints.length);
  const rSets = solveModel(ps.model!);
  assert(rSets.status === "optimal", "sets status " + rSets.status);
  close(rSets.z.toNumber(), 0);

  const sets2 = `
SETS:
    Prod / A B /: X, G;
    Rec / R1 /: Bnd;
    Uso(Rec, Prod): A;
ENDSETS
DATA:
    G = 20 15;
    Bnd = 100;
    A = 2 1;
ENDDATA
MAX = @SUM(Prod(i): G(i) * X(i));
@FOR(Rec(j):
    @SUM(Prod(i): A(j,i) * X(i)) <= Bnd(j)
);
`;
  const p2 = parseLingo(sets2);
  assert(!!p2.model && p2.errors.length === 0, "sets2 " + JSON.stringify(p2.errors));
  const rMix = solveModel(p2.model!);
  assert(rMix.status === "optimal", "mix " + rMix.status);
  close(rMix.z.toNumber(), 1500);

  return "ok";
}
