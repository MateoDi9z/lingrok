export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultVariable(index: number): {
  id: string;
  name: string;
  type: "continuous";
  lower: number;
  upper: null;
} {
  return {
    id: uid("v"),
    name: `X${index}`,
    type: "continuous",
    lower: 0,
    upper: null,
  };
}

export function defaultConstraint(index: number): {
  id: string;
  name: string;
  coeffs: Record<string, number>;
  relation: "<=";
  rhs: number;
} {
  return {
    id: uid("c"),
    name: `R${index}`,
    coeffs: {},
    relation: "<=",
    rhs: 0,
  };
}

export function blankModel(): import("./types").LpModel {
  const v1 = defaultVariable(1);
  const v2 = defaultVariable(2);
  const c1 = defaultConstraint(1);
  return {
    id: uid("m"),
    name: "Nuevo modelo",
    description: "",
    sense: "max",
    objective: { [v1.id]: 0, [v2.id]: 0 },
    variables: [v1, v2],
    constraints: [c1],
    lingoSource: "",
    updatedAt: Date.now(),
  };
}

export function isBlankModel(m: import("./types").LpModel): boolean {
  if (m.exampleId) return false;
  if (m.constraints.length > 1 || m.variables.length > 2) return false;
  if (Object.values(m.objective).some((n) => n)) return false;
  if (m.constraints.some((c) => c.rhs || Object.values(c.coeffs).some((n) => n))) return false;
  return true;
}
