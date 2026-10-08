import { uid } from "./ids";
import { parseLingo, toLingo } from "./parser";
import type { LpModel, Variable } from "./types";

function v(name: string, extra?: Partial<Variable>): Variable {
  return {
    id: uid("v"),
    name,
    type: "continuous",
    lower: 0,
    upper: null,
    ...extra,
  };
}

function pack(
  name: string,
  description: string,
  sense: "max" | "min",
  vars: Variable[],
  obj: number[],
  cons: { name: string; a: number[]; rel: "<=" | ">=" | "="; rhs: number }[],
): LpModel {
  const objective: Record<string, number> = {};
  vars.forEach((vr, i) => {
    objective[vr.id] = obj[i] ?? 0;
  });
  const model: LpModel = {
    id: uid("m"),
    name,
    description,
    sense,
    objective,
    variables: vars,
    constraints: cons.map((c) => {
      const coeffs: Record<string, number> = {};
      vars.forEach((vr, i) => {
        if (c.a[i]) coeffs[vr.id] = c.a[i];
      });
      return { id: uid("c"), name: c.name, coeffs, relation: c.rel, rhs: c.rhs };
    }),
    lingoSource: "",
    updatedAt: Date.now(),
    exampleId: name,
  };
  model.lingoSource = toLingo(model);
  return model;
}

function fromSets(name: string, src: string): LpModel {
  const r = parseLingo(src);
  if (!r.model) {
    throw new Error(r.errors.map((e) => e.message).join("; ") || "SETS parse");
  }
  return { ...r.model, name, exampleId: name, description: "", lingoSource: src.trim() + "\n" };
}

export interface ExampleMeta {
  id: string;
  name: string;
  topic: string;
  blurb: string;
  vars: number;
  integer?: boolean;
  graphic?: boolean;
  build: () => LpModel;
}

export const EXAMPLES: ExampleMeta[] = [
  {
    id: "estampado",
    name: "Estampado Soldado Pintado",
    topic: "Mezcla de producción",
    blurb: "Dos productos y tres procesos. Maximizar utilidad. Sirve para el gráfico y el simplex.",
    vars: 2,
    graphic: true,
    build: () =>
      pack(
        "Estampado Soldado Pintado",
        "Maximizar la utilidad z = 4X1 + 3X2. Estampado, soldado y pintado limitan las horas. X3, X4 y X5 son los sobrantes de cada proceso.",
        "max",
        [v("X1"), v("X2")],
        [4, 3],
        [
          { name: "EST", a: [6, 16], rel: "<=", rhs: 48000 },
          { name: "SOL", a: [12, 6], rel: "<=", rhs: 42000 },
          { name: "PIN", a: [9, 9], rel: "<=", rhs: 36000 },
        ],
      ),
  },
  {
    id: "mesas",
    name: "Mesas y sillas",
    topic: "Mezcla de producción",
    blurb: "Clásico de 2 variables. Ideal para el método gráfico y la tabla simplex.",
    vars: 2,
    graphic: true,
    build: () =>
      pack(
        "Mesas y sillas",
        "Una carpintería fabrica mesas y sillas. Cada mesa deja $20 de ganancia y cada silla $15. Hay 100 hs de carpintería y 80 hs de acabado.",
        "max",
        [v("Mesas"), v("Sillas")],
        [20, 15],
        [
          { name: "Carpinteria", a: [2, 1], rel: "<=", rhs: 100 },
          { name: "Acabado", a: [1, 2], rel: "<=", rhs: 80 },
        ],
      ),
  },
  {
    id: "hillier",
    name: "Wyndor Glass",
    topic: "Producción",
    blurb: "El ejemplo de Hillier: 3 plantas, 2 productos. Óptimo (2, 6) con z = 36.",
    vars: 2,
    graphic: true,
    build: () =>
      pack(
        "Wyndor Glass",
        "Productos: puertas de vidrio (x1) y ventanas (x2). Ganancias 3 y 5. Capacidades de las plantas 1, 2 y 3.",
        "max",
        [v("Puertas"), v("Ventanas")],
        [3, 5],
        [
          { name: "Planta1", a: [1, 0], rel: "<=", rhs: 4 },
          { name: "Planta2", a: [0, 2], rel: "<=", rhs: 12 },
          { name: "Planta3", a: [3, 2], rel: "<=", rhs: 18 },
        ],
      ),
  },
  {
    id: "dieta",
    name: "Problema de la dieta",
    topic: "Dieta / mezcla",
    blurb: "Minimizar el costo de una dieta que cubre requerimientos nutricionales.",
    vars: 2,
    graphic: true,
    build: () =>
      pack(
        "Dieta",
        "Alimento A cuesta $2 y B cuesta $3. Se necesitan al menos 12 u. de proteína, 8 de calcio y 10 de vitaminas.",
        "min",
        [v("AlimA"), v("AlimB")],
        [2, 3],
        [
          { name: "Proteina", a: [2, 1], rel: ">=", rhs: 12 },
          { name: "Calcio", a: [1, 2], rel: ">=", rhs: 8 },
          { name: "Vitaminas", a: [1, 1], rel: ">=", rhs: 10 },
        ],
      ),
  },
  {
    id: "publicidad",
    name: "Mix de publicidad",
    topic: "Marketing",
    blurb: "Asignar presupuesto entre TV y redes con cupos de audiencia.",
    vars: 2,
    graphic: true,
    build: () =>
      pack(
        "Mix de publicidad",
        "Cada aviso de TV llega a 30 mil personas ($8) y cada posteo a 10 mil ($3). Presupuesto $120. Máximo 10 avisos de TV.",
        "max",
        [v("TV"), v("Redes")],
        [30, 10],
        [
          { name: "Presupuesto", a: [8, 3], rel: "<=", rhs: 120 },
          { name: "CupoTV", a: [1, 0], rel: "<=", rhs: 10 },
          { name: "MinRedes", a: [0, 1], rel: ">=", rhs: 4 },
        ],
      ),
  },
  {
    id: "transporte",
    name: "Transporte 2×2",
    topic: "Transporte",
    blurb: "Dos orígenes y dos destinos. Minimizar el costo de envío.",
    vars: 4,
    build: () => {
      const vars = [v("F1C1"), v("F1C2"), v("F2C1"), v("F2C2")];
      return pack(
        "Transporte 2×2",
        "Fábricas F1 (oferta 20) y F2 (oferta 25). Clientes C1 (demanda 15) y C2 (demanda 30). Costos 4, 7, 6 y 3.",
        "min",
        vars,
        [4, 7, 6, 3],
        [
          { name: "OfertaF1", a: [1, 1, 0, 0], rel: "<=", rhs: 20 },
          { name: "OfertaF2", a: [0, 0, 1, 1], rel: "<=", rhs: 25 },
          { name: "DemandaC1", a: [1, 0, 1, 0], rel: ">=", rhs: 15 },
          { name: "DemandaC2", a: [0, 1, 0, 1], rel: ">=", rhs: 30 },
        ],
      );
    },
  },
  {
    id: "mezcla",
    name: "Mezcla de naftas",
    topic: "Blending",
    blurb: "Mezclar crudos para obtener nafta regular y premium.",
    vars: 4,
    build: () =>
      pack(
        "Mezcla de naftas",
        "Crudo A y B se mezclan en Regular y Premium. Márgenes 9 y 15. Disponibilidad A=5000, B=6000. Demanda mín. Regular 4000, Premium 3000.",
        "max",
        [v("A_Reg"), v("A_Pre"), v("B_Reg"), v("B_Pre")],
        [9, 15, 9, 15],
        [
          { name: "DispA", a: [1, 1, 0, 0], rel: "<=", rhs: 5000 },
          { name: "DispB", a: [0, 0, 1, 1], rel: "<=", rhs: 6000 },
          { name: "MinReg", a: [1, 0, 1, 0], rel: ">=", rhs: 4000 },
          { name: "MinPre", a: [0, 1, 0, 1], rel: ">=", rhs: 3000 },
        ],
      ),
  },
  {
    id: "mochila",
    name: "Mochila (entera)",
    topic: "Entera / knapsack",
    blurb: "Elegir proyectos 0-1 con presupuesto limitado. Usa @BIN.",
    vars: 4,
    integer: true,
    build: () =>
      pack(
        "Selección de proyectos",
        "Cuatro proyectos binarios. Beneficios 16, 22, 12, 8. Costos 5, 7, 4, 3. Presupuesto 14.",
        "max",
        [
          v("P1", { type: "binary", upper: 1 }),
          v("P2", { type: "binary", upper: 1 }),
          v("P3", { type: "binary", upper: 1 }),
          v("P4", { type: "binary", upper: 1 }),
        ],
        [16, 22, 12, 8],
        [{ name: "Presupuesto", a: [5, 7, 4, 3], rel: "<=", rhs: 14 }],
      ),
  },
  {
    id: "turnos",
    name: "Turnos de personal",
    topic: "Programación de personal",
    blurb: "Cubrir demanda por franja con turnos de 8 horas. Variables enteras.",
    vars: 4,
    integer: true,
    build: () =>
      pack(
        "Turnos de personal",
        "Turnos que empiezan a las 0, 6, 12 y 18 hs. Cada turno cubre 8 hs. Demandas 4, 8, 10 y 6. Minimizar cabezas.",
        "min",
        [
          v("T0", { type: "integer" }),
          v("T6", { type: "integer" }),
          v("T12", { type: "integer" }),
          v("T18", { type: "integer" }),
        ],
        [1, 1, 1, 1],
        [
          { name: "Franja0_6", a: [1, 0, 0, 1], rel: ">=", rhs: 4 },
          { name: "Franja6_12", a: [1, 1, 0, 0], rel: ">=", rhs: 8 },
          { name: "Franja12_18", a: [0, 1, 1, 0], rel: ">=", rhs: 10 },
          { name: "Franja18_24", a: [0, 0, 1, 1], rel: ">=", rhs: 6 },
        ],
      ),
  },
  {
    id: "inversion",
    name: "Inversión de capital",
    topic: "Entera binaria",
    blurb: "Elegir un portafolio de inversiones con capital y riesgo.",
    vars: 5,
    integer: true,
    build: () =>
      pack(
        "Inversión de capital",
        "Cinco inversiones 0-1. NPVs 12, 8, 15, 6, 10. Capital 20, 12, 28, 10, 18. Presupuesto 40. Máximo riesgo 25 (3, 2, 5, 1, 4).",
        "max",
        [
          v("I1", { type: "binary", upper: 1 }),
          v("I2", { type: "binary", upper: 1 }),
          v("I3", { type: "binary", upper: 1 }),
          v("I4", { type: "binary", upper: 1 }),
          v("I5", { type: "binary", upper: 1 }),
        ],
        [12, 8, 15, 6, 10],
        [
          { name: "Capital", a: [20, 12, 28, 10, 18], rel: "<=", rhs: 40 },
          { name: "Riesgo", a: [3, 2, 5, 1, 4], rel: "<=", rhs: 25 },
        ],
      ),
  },
  {
    id: "corte",
    name: "Corte de rollos",
    topic: "Cutting stock",
    blurb: "Patrones de corte enteros para satisfacer pedidos con el mínimo de rollos.",
    vars: 3,
    integer: true,
    build: () =>
      pack(
        "Corte de rollos",
        "Rollo de 100 cm. Pedidos: 45 cm × 50, 30 cm × 70, 20 cm × 60. Patrones: (2,0,0), (1,1,1), (0,2,2). Minimizar rollos.",
        "min",
        [v("PatA", { type: "integer" }), v("PatB", { type: "integer" }), v("PatC", { type: "integer" })],
        [1, 1, 1],
        [
          { name: "Pedido45", a: [2, 1, 0], rel: ">=", rhs: 50 },
          { name: "Pedido30", a: [0, 1, 2], rel: ">=", rhs: 70 },
          { name: "Pedido20", a: [0, 1, 2], rel: ">=", rhs: 60 },
        ],
      ),
  },
  {
    id: "sets-prod",
    name: "SETS: 5 productos",
    topic: "Lenguaje LINGO",
    blurb: "SETS, DATA, @SUM y @FOR con índices P1..P5. Plantilla para copiar y editar.",
    vars: 5,
    build: () =>
      fromSets(
        "SETS: 5 productos",
        `
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
`,
      ),
  },
  {
    id: "sets-trans",
    name: "SETS: transporte",
    topic: "Lenguaje LINGO",
    blurb: "Conjuntos derivados ORIGEN×DESTINO, @FOR y @SUM sobre rutas.",
    vars: 4,
    build: () =>
      fromSets(
        "SETS: transporte",
        `
SETS:
    Origen / F1 F2 /: Oferta;
    Destino / C1 C2 /: Demanda;
    Rutas(Origen, Destino): Costo, X;
ENDSETS
DATA:
    Oferta = 20 25;
    Demanda = 15 30;
    Costo = 4 7
            6 3;
ENDDATA
MIN = @SUM(Rutas(i,j): Costo(i,j) * X(i,j));
@FOR(Origen(i):
    @SUM(Destino(j): X(i,j)) <= Oferta(i)
);
@FOR(Destino(j):
    @SUM(Origen(i): X(i,j)) >= Demanda(j)
);
`,
      ),
  },
];

export function exampleById(id: string): LpModel | null {
  const ex = EXAMPLES.find((e) => e.id === id);
  return ex ? ex.build() : null;
}
