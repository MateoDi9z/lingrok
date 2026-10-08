import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useApp, u as isBlankModel } from "./router-CmfGc1qH.mjs";
import { t as Button } from "./theme-switcher-BLJgEMKV.mjs";
import { t as PageHeader } from "./page-header-oto3MjeO.mjs";
import { t as formatNum } from "./format-CkGvcGht.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grafico-ttXUM0xm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GraphicPlot({ g }) {
	const vb = g.bounds;
	const w = vb.xmax - vb.xmin;
	const h = vb.ymax - vb.ymin;
	const pad = 56;
	const W = 640;
	const H = 520;
	const xOf = (x) => pad + (x - vb.xmin) / w * (W - pad * 1.55);
	const yOf = (y) => 464 - (y - vb.ymin) / h * (H - pad * 1.55);
	const ticks = (min, max) => {
		const step = niceStep((max - min) / 6);
		const out = [];
		const start = Math.ceil(min / step) * step;
		for (let v = start; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(8)));
		return out;
	};
	const hullD = g.hull.length ? `M ${g.hull.map((p) => `${xOf(p.x)} ${yOf(p.y)}`).join(" L ")} Z` : "";
	const [iso, setIso] = (0, import_react.useState)(() => {
		const opt = g.vertices.find((v) => v.optimal);
		return opt ? opt.z : 0;
	});
	const isoLine = (0, import_react.useMemo)(() => {
		const { cx, cy } = g;
		if (Math.abs(cx) < 1e-12 && Math.abs(cy) < 1e-12) return null;
		const pts = [];
		const edges = [
			[
				vb.xmin,
				vb.ymin,
				vb.xmax,
				vb.ymin
			],
			[
				vb.xmin,
				vb.ymax,
				vb.xmax,
				vb.ymax
			],
			[
				vb.xmin,
				vb.ymin,
				vb.xmin,
				vb.ymax
			],
			[
				vb.xmax,
				vb.ymin,
				vb.xmax,
				vb.ymax
			]
		];
		for (const [x1, y1, x2, y2] of edges) {
			const d1 = cx * x1 + cy * y1 - iso;
			const d2 = cx * x2 + cy * y2 - iso;
			if (Math.abs(d1) < 1e-8) pts.push({
				x: x1,
				y: y1
			});
			if (Math.abs(d2) < 1e-8) pts.push({
				x: x2,
				y: y2
			});
			if (d1 * d2 < 0) {
				const t = d1 / (d1 - d2);
				pts.push({
					x: x1 + t * (x2 - x1),
					y: y1 + t * (y2 - y1)
				});
			}
		}
		if (pts.length < 2) return null;
		return {
			a: pts[0],
			b: pts[pts.length - 1]
		};
	}, [
		g,
		iso,
		vb
	]);
	const constraintSegs = g.lines.map((L) => {
		const pts = [];
		const box = [
			{
				x: vb.xmin,
				y: L.b === 0 ? 0 : (L.c - L.a * vb.xmin) / (L.b || 1e-12)
			},
			{
				x: vb.xmax,
				y: L.b === 0 ? 0 : (L.c - L.a * vb.xmax) / (L.b || 1e-12)
			},
			{
				x: L.a === 0 ? 0 : (L.c - L.b * vb.ymin) / (L.a || 1e-12),
				y: vb.ymin
			},
			{
				x: L.a === 0 ? 0 : (L.c - L.b * vb.ymax) / (L.a || 1e-12),
				y: vb.ymax
			}
		];
		for (const p of box) if (p.x >= vb.xmin - 1e-6 && p.x <= vb.xmax + 1e-6 && p.y >= vb.ymin - 1e-6 && p.y <= vb.ymax + 1e-6) {
			if (Math.abs(L.a * p.x + L.b * p.y - L.c) < 1e-4) pts.push(p);
		}
		const uniq = pts.filter((p, i) => pts.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-6) === i);
		if (uniq.length < 2) return {
			...L,
			a1: uniq[0],
			a2: uniq[0]
		};
		return {
			...L,
			a1: uniq[0],
			a2: uniq[1]
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl border border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: `0 0 ${W} ${H}`,
					className: "h-auto w-full",
					role: "img",
					"aria-label": "Región factible",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							width: W,
							height: H,
							fill: "var(--surface)"
						}),
						ticks(vb.xmin, vb.xmax).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(x),
							y1: yOf(vb.ymin),
							x2: xOf(x),
							y2: yOf(vb.ymax),
							stroke: "var(--fg)",
							strokeOpacity: "0.07"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: xOf(x),
							y: yOf(0) + 16,
							fill: "var(--subtle)",
							fontSize: "11",
							textAnchor: "middle",
							children: formatNum(x, 2)
						})] }, `vx${x}`)),
						ticks(vb.ymin, vb.ymax).map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(vb.xmin),
							y1: yOf(y),
							x2: xOf(vb.xmax),
							y2: yOf(y),
							stroke: "var(--fg)",
							strokeOpacity: "0.07"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: xOf(0) - 8,
							y: yOf(y) + 4,
							fill: "var(--subtle)",
							fontSize: "11",
							textAnchor: "end",
							children: formatNum(y, 2)
						})] }, `vy${y}`)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(vb.xmin),
							y1: yOf(0),
							x2: xOf(vb.xmax),
							y2: yOf(0),
							stroke: "var(--muted)",
							strokeWidth: "1.2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(0),
							y1: yOf(vb.ymin),
							x2: xOf(0),
							y2: yOf(vb.ymax),
							stroke: "var(--muted)",
							strokeWidth: "1.2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: xOf(vb.xmax) - 8,
							y: yOf(0) - 8,
							fill: "var(--steel)",
							fontSize: "12",
							children: g.varX
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: xOf(0) + 8,
							y: yOf(vb.ymax) + 14,
							fill: "var(--steel)",
							fontSize: "12",
							children: g.varY
						}),
						constraintSegs.map((s, i) => s.a1 && s.a2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(s.a1.x),
							y1: yOf(s.a1.y),
							x2: xOf(s.a2.x),
							y2: yOf(s.a2.y),
							stroke: "var(--steel)",
							strokeWidth: "1.4",
							strokeOpacity: "0.85"
						}, i)),
						hullD && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: hullD,
							fill: "var(--steel)",
							fillOpacity: "0.18",
							stroke: "var(--steel)",
							strokeWidth: "1.8"
						}),
						isoLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(isoLine.a.x),
							y1: yOf(isoLine.a.y),
							x2: xOf(isoLine.b.x),
							y2: yOf(isoLine.b.y),
							stroke: "var(--fg)",
							strokeDasharray: "6 4",
							strokeWidth: "1.5"
						}),
						g.vertices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: xOf(v.x),
							cy: yOf(v.y),
							r: v.optimal ? 7 : 4.5,
							fill: v.optimal ? "var(--opt)" : "var(--fg)"
						}), v.optimal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: xOf(v.x) + 12,
							y: yOf(v.y) + 16,
							fill: "var(--opt)",
							fontSize: "12",
							fontFamily: "IBM Plex Sans, sans-serif",
							children: `óptimo (${formatNum(v.x, 2)}, ${formatNum(v.y, 2)})`
						})] }, v.label))
					]
				})
			}),
			g.infeasible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: "La región factible está vacía."
			}),
			g.unbounded && !g.infeasible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-warn",
				children: "La región factible no está acotada (el recorte es solo visual)."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted",
					children: [
						"Curva de nivel z = ",
						formatNum(iso, 2),
						g.cx || g.cy ? `  ·  ${formatNum(g.cx, 2)}${g.varX} + ${formatNum(g.cy, 2)}${g.varY}` : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: isoMin(g),
					max: isoMax(g),
					step: (isoMax(g) - isoMin(g)) / 80 || 1,
					value: iso,
					onChange: (e) => setIso(Number(e.target.value)),
					className: "h-11 w-full accent-steel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-elevated text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-left font-medium",
								children: "Vértice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right font-medium",
								children: g.varX
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right font-medium",
								children: g.varY
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-right font-medium",
								children: "z"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: g.vertices.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `px-3 py-2 ${v.optimal ? "text-opt font-medium" : ""}`,
								children: v.optimal ? "Óptimo" : v.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: formatNum(v.x, 4)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: formatNum(v.y, 4)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right font-mono tabular",
								children: formatNum(v.z, 4)
							})
						]
					}, v.label)) })]
				})
			})
		]
	});
}
function niceStep(raw) {
	if (raw <= 0) return 1;
	const exp = Math.pow(10, Math.floor(Math.log10(raw)));
	const f = raw / exp;
	if (f < 1.5) return exp;
	if (f < 3) return 2 * exp;
	if (f < 7) return 5 * exp;
	return 10 * exp;
}
function isoMin(g) {
	if (!g.vertices.length) return -10;
	const zs = g.vertices.map((v) => v.z);
	return Math.min(...zs) - Math.abs(Math.min(...zs)) * .4 - 1;
}
function isoMax(g) {
	if (!g.vertices.length) return 10;
	const zs = g.vertices.map((v) => v.z);
	return Math.max(...zs) + Math.abs(Math.max(...zs)) * .4 + 1;
}
var EPS = 1e-8;
function halfplanes(model) {
	if (model.variables.length !== 2) return null;
	const [vx, vy] = model.variables;
	const cx = model.objective[vx.id] ?? 0;
	const cy = model.objective[vy.id] ?? 0;
	const lines = [];
	const push = (a, b, c, name, relation) => {
		if (Math.abs(a) < EPS && Math.abs(b) < EPS) return;
		lines.push({
			a,
			b,
			c,
			name,
			relation
		});
	};
	for (const con of model.constraints) push(con.coeffs[vx.id] ?? 0, con.coeffs[vy.id] ?? 0, con.rhs, con.name, con.relation);
	if (!vx.free && (vx.lower ?? 0) === 0) push(1, 0, 0, `${vx.name} ≥ 0`, ">=");
	else if (!vx.free && vx.lower != null && vx.lower !== 0) push(1, 0, vx.lower, `${vx.name} ≥ ${vx.lower}`, ">=");
	if (!vy.free && (vy.lower ?? 0) === 0) push(0, 1, 0, `${vy.name} ≥ 0`, ">=");
	else if (!vy.free && vy.lower != null && vy.lower !== 0) push(0, 1, vy.lower, `${vy.name} ≥ ${vy.lower}`, ">=");
	if (vx.upper != null) push(1, 0, vx.upper, `${vx.name} ≤ ${vx.upper}`, "<=");
	if (vy.upper != null) push(0, 1, vy.upper, `${vy.name} ≤ ${vy.upper}`, "<=");
	return {
		lines,
		cx,
		cy,
		vx: vx.name,
		vy: vy.name
	};
}
function satisfies(x, y, lines) {
	for (const L of lines) {
		const v = L.a * x + L.b * y;
		if (L.relation === "<=" && v > L.c + EPS) return false;
		if (L.relation === ">=" && v < L.c - EPS) return false;
		if (L.relation === "=" && Math.abs(v - L.c) > 1e-5) return false;
	}
	return true;
}
function intersect(p, q) {
	const det = p.a * q.b - q.a * p.b;
	if (Math.abs(det) < 1e-12) return null;
	const x = (p.c * q.b - q.c * p.b) / det;
	const y = (p.a * q.c - q.a * p.c) / det;
	if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
	return {
		x,
		y
	};
}
function hull(points) {
	const uniq = [];
	for (const p of points) {
		if (uniq.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1e-7)) continue;
		uniq.push(p);
	}
	if (uniq.length <= 2) return uniq;
	uniq.sort((a, b) => a.x - b.x || a.y - b.y);
	const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
	const lower = [];
	for (const p of uniq) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
		lower.push(p);
	}
	const upper = [];
	for (let i = uniq.length - 1; i >= 0; i--) {
		const p = uniq[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
		upper.push(p);
	}
	lower.pop();
	upper.pop();
	return lower.concat(upper);
}
function buildGraphic(model) {
	const hp = halfplanes(model);
	if (!hp) return null;
	const { lines, cx, cy, vx, vy } = hp;
	const raw = [];
	for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
		const p = intersect(lines[i], lines[j]);
		if (!p) continue;
		if (Math.abs(p.x) > 1e7 || Math.abs(p.y) > 1e7) continue;
		if (satisfies(p.x, p.y, lines)) raw.push(p);
	}
	const h = hull(raw);
	const vertices = h.map((p, idx) => ({
		x: Math.abs(p.x) < 1e-10 ? 0 : p.x,
		y: Math.abs(p.y) < 1e-10 ? 0 : p.y,
		z: cx * p.x + cy * p.y,
		label: `V${idx + 1}`
	}));
	let unbounded = false;
	let infeasible = h.length === 0;
	if (!infeasible) {
		const xs = h.map((p) => p.x);
		const ys = h.map((p) => p.y);
		const probe = Math.max(1, ...xs.map(Math.abs), ...ys.map(Math.abs)) * 20;
		for (const [dx, dy] of [
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
			[1, 1],
			[-1, 1],
			[1, -1],
			[-1, -1]
		]) if (satisfies(dx * probe, dy * probe, lines)) unbounded = true;
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
	let xmin = 0, ymin = 0, xmax = 1, ymax = 1;
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
	xmin -= dx * .25;
	ymin -= dy * .25;
	xmax += dx * .25;
	ymax += dy * .25;
	if (xmin > -.05) xmin = Math.min(xmin, -dx * .08);
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
		bounds: {
			xmin,
			xmax,
			ymin,
			ymax
		}
	};
}
function GraficoPage() {
	const nav = useNavigate();
	const model = useApp((s) => s.model);
	const blank = isBlankModel(model);
	const g = (0, import_react.useMemo)(() => blank ? null : buildGraphic(model), [model, blank]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 pt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Método gráfico",
			title: "Región factible",
			description: "Vértices y curvas de nivel de la función objetivo. Aplica cuando hay exactamente dos variables."
		}), blank ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Todavía no hay un modelo. Cargá dos variables y restricciones en el editor, o un ejemplo de dos variables."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => nav({ to: "/editor" }),
					children: "Ir al editor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => nav({ to: "/" }),
					children: "Ver ejemplos"
				})]
			})]
		}) : !g ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted",
				children: [
					"Este modelo tiene ",
					model.variables.length,
					" variables. El método gráfico aplica cuando hay exactamente dos."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				variant: "outline",
				onClick: () => nav({ to: "/editor" }),
				children: "Ir al editor"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphicPlot, { g })]
	});
}
//#endregion
export { GraficoPage as component };
