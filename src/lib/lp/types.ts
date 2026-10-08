import type { Q } from "./fraction";

export type Sense = "max" | "min";
export type Relation = "<=" | ">=" | "=";
export type VarType = "continuous" | "integer" | "binary";

export interface Variable {
  id: string;
  name: string;
  type: VarType;
  /** null = 0 default lower (unless free). */
  lower: number | null;
  /** null = +∞ */
  upper: number | null;
  free?: boolean;
}

export interface Constraint {
  id: string;
  name: string;
  /** variable id → coefficient */
  coeffs: Record<string, number>;
  relation: Relation;
  rhs: number;
}

export interface LpModel {
  id: string;
  name: string;
  description: string;
  sense: Sense;
  /** variable id → objective coefficient */
  objective: Record<string, number>;
  variables: Variable[];
  constraints: Constraint[];
  lingoSource: string;
  updatedAt: number;
  exampleId?: string;
}

export type SolveStatus =
  | "optimal"
  | "infeasible"
  | "unbounded"
  | "integer-optimal"
  | "error";

export type ColKind = "var" | "slack" | "surplus" | "art";

export interface TableauSnap {
  labels: string[];
  /** Parallel to labels without the LD column. */
  kinds: ColKind[];
  /** Original objective coefficients, parallel to kinds. */
  cj: string[];
  /** Functional z = c·x at this basis (original sense). */
  z: string;
  basis: string[];
  /** rows: [z row, ...constraint rows]; last col is RHS */
  matrix: string[][];
  entering?: string;
  leaving?: string;
  phase: 1 | 2;
  iteration: number;
  note?: string;
}

export interface VarResult {
  name: string;
  value: Q;
  reducedCost: Q;
  type: VarType;
}

export interface ConResult {
  name: string;
  slack: Q;
  dual: Q;
  relation: Relation;
  rhs: number;
  /** Allowable decrease / increase of RHS keeping basis (null = unbounded). */
  rhsDec: Q | null;
  rhsInc: Q | null;
  objDec: Q | null;
  objInc: Q | null;
}

export interface ObjRange {
  name: string;
  coeff: number;
  dec: Q | null;
  inc: Q | null;
}

export interface SolveResult {
  status: SolveStatus;
  message: string;
  sense: Sense;
  z: Q;
  variables: VarResult[];
  constraints: ConResult[];
  objRanges: ObjRange[];
  tableaus: TableauSnap[];
  iterations: number;
  nodes?: number;
  unboundedRay?: Record<string, number>;
}

export interface Vertex {
  x: number;
  y: number;
  z: number;
  label: string;
  optimal?: boolean;
}

export interface GraphicLine {
  a: number;
  b: number;
  c: number;
  name: string;
  relation: Relation;
}

export interface GraphicModel {
  varX: string;
  varY: string;
  sense: Sense;
  cx: number;
  cy: number;
  lines: GraphicLine[];
  vertices: Vertex[];
  hull: { x: number; y: number }[];
  unbounded: boolean;
  infeasible: boolean;
  bounds: { xmin: number; xmax: number; ymin: number; ymax: number };
}
