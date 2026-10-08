import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as ChevronRight, f as ChevronLeft } from "../_libs/lucide-react.mjs";
import { r as useApp, s as Q } from "./router-CmfGc1qH.mjs";
import { t as Button } from "./theme-switcher-BLJgEMKV.mjs";
import { t as PageHeader } from "./page-header-oto3MjeO.mjs";
import { i as statusLabel, n as formatQ, r as formatRange } from "./format-CkGvcGht.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/informe-GBLNOMut.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_LABEL = {
	var: "Variable",
	slack: "Holgura",
	surplus: "Exceso",
	art: "Artificial"
};
function fmtCell(s, frac) {
	if (!frac) try {
		return Q.parse(s.includes("/") ? s : s).toDecimal(4);
	} catch {
		return s;
	}
	return s;
}
function SimplexView({ tableaus, frac }) {
	const [i, setI] = (0, import_react.useState)(0);
	if (!tableaus.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No hay tabla simplex (modelos enteros muestran la relajación raíz si está disponible)."
	});
	const t = tableaus[Math.min(i, tableaus.length - 1)];
	const fmt = (s) => fmtCell(s, frac);
	const zRow = t.matrix[0] ?? [];
	const rhs = zRow.length ? zRow[zRow.length - 1] : "0";
	const kinds = t.kinds ?? [];
	const cj = t.cj ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						size: "icon",
						onClick: () => setI((x) => Math.max(0, x - 1)),
						disabled: i === 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 text-center text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium",
							children: [
								"Fase ",
								t.phase,
								" · Iteración ",
								t.iteration
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: t.note
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "subtle",
						size: "icon",
						onClick: () => setI((x) => Math.min(tableaus.length - 1, x + 1)),
						disabled: i >= tableaus.length - 1,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 18 })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center gap-1 overflow-x-auto pb-1",
				children: tableaus.map((_, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `size-2 rounded-full ${k === i ? "bg-accent" : "bg-elevated"}`,
					onClick: () => setI(k),
					"aria-label": `Paso ${k + 1}`
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted",
						children: "Funcional en este paso"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-mono text-2xl font-semibold tabular text-steel",
						children: ["z = ", fmt(t.z ?? rhs)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: t.phase === 1 ? "Fase I: se minimiza la suma de artificiales. z es el funcional original evaluado en la base actual." : "z = c·x con la base actual. La fila z de la tabla son los coeficientes del funcional (tablero)."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "kind-dot kind-var" }), " Variable de decisión"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "kind-dot kind-slack" }), " Holgura (≤)"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "kind-dot kind-surplus" }), " Exceso (≥)"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "kind-dot kind-art" }), " Artificial"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "tableau w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("thead", { children: [cj.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "cj-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "cₖ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {}),
							t.labels.slice(0, -1).map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								"data-kind": kinds[j],
								children: fmt(cj[j] ?? "0")
							}, `ck-${l}-${j}`))
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Cₖ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Xₖ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Bₖ"
						}),
						t.labels.slice(0, -1).map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
							"data-enter": l === t.entering ? "true" : void 0,
							"data-kind": kinds[j],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: l }), kinds[j] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "kind-label",
								children: KIND_LABEL[kinds[j]]
							})]
						}, `${l}-${j}`))
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [t.matrix.slice(1).map((row, ri) => {
						const basic = t.basis[ri] ?? "";
						const col = t.labels.indexOf(basic);
						const ck = col >= 0 ? cj[col] ?? "0" : "0";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							"data-leave": basic === t.leaving ? "true" : void 0,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "text-left",
									children: fmt(ck)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "text-left text-steel",
									children: basic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "bk",
									children: fmt(row[row.length - 1] ?? "0")
								}),
								row.slice(0, -1).map((cell, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									"data-kind": kinds[ci],
									children: fmt(cell)
								}, ci))
							]
						}, ri);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "z-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-left",
								children: "z"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "bk",
								children: fmt(t.z ?? rhs)
							}),
							zRow.slice(0, -1).map((cell, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								"data-kind": kinds[ci],
								children: fmt(cell)
							}, ci))
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Cₖ"
					}),
					" es el coeficiente del funcional de la variable básica (el mismo de la fila",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "cₖ"
					}),
					" de arriba). ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Xₖ"
					}),
					" es la base y",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Bₖ"
					}),
					" es el valor de la variable básica. La fila ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "z"
					}),
					" son los coeficientes actuales del tablero."
				]
			}),
			t.entering && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Entra ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: t.entering
					}),
					t.leaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" ",
						"· Sale ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: t.leaving
						})
					] }) : null
				]
			})
		]
	});
}
function lingoText(r, frac) {
	const mode = frac ? "frac" : "dec";
	const lines = [];
	lines.push(" " + statusLabel(r.status));
	if (r.status === "optimal" || r.status === "integer-optimal") {
		lines.push(` Valor de la función objetivo:          ${formatQ(r.z, mode).padStart(16)}`);
		lines.push(` Iteraciones del solver:                ${String(r.iterations).padStart(16)}`);
		if (r.nodes) lines.push(` Nodos branch & bound:                  ${String(r.nodes).padStart(16)}`);
		lines.push("");
		lines.push(" Variable           Valor          Costo reducido");
		for (const v of r.variables) lines.push(` ${v.name.padEnd(16)} ${formatQ(v.value, mode).padStart(14)} ${formatQ(v.reducedCost, mode).padStart(18)}`);
		lines.push("");
		lines.push(" Fila               Holgura o exceso     Precio dual");
		lines.push(` OBJETIVO          ${formatQ(r.z, mode).padStart(16)} ${"1".padStart(16)}`);
		for (const c of r.constraints) lines.push(` ${c.name.padEnd(16)} ${formatQ(c.slack, mode).padStart(16)} ${formatQ(c.dual, mode).padStart(16)}`);
	} else lines.push(" " + r.message);
	return lines.join("\n");
}
function SolutionReport({ result, frac }) {
	const [tab, setTab] = (0, import_react.useState)("informe");
	const mode = frac ? "frac" : "dec";
	const text = (0, import_react.useMemo)(() => lingoText(result, frac), [result, frac]);
	const ok = result.status === "optimal" || result.status === "integer-optimal";
	const tone = result.status === "infeasible" || result.status === "error" ? "text-danger" : result.status === "unbounded" ? "text-warn" : "text-opt";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-xl font-semibold ${tone}`,
						children: statusLabel(result.status)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: result.message
					}),
					ok && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: result.sense === "max" ? "Máximo z" : "Mínimo z",
								value: formatQ(result.z, mode)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Iteraciones",
								value: String(result.iterations)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Variables",
								value: String(result.variables.length)
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto rounded-md border border-border bg-surface p-1",
				children: [
					["informe", "Informe"],
					["sens", "Sensibilidad"],
					["simplex", "Simplex"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `h-10 flex-1 rounded-sm px-3 text-sm font-medium whitespace-nowrap ${tab === id ? "bg-accent text-accent-fg" : "text-muted"}`,
					onClick: () => setTab(id),
					children: label
				}, id))
			}),
			tab === "informe" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg border border-border bg-surface p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "report-pre",
							children: text
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => navigator.clipboard.writeText(text),
						children: "Copiar informe"
					}),
					ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-elevated text-xs text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-left font-medium",
										children: "Variable"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Valor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Costo red."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-left font-medium",
										children: "Tipo"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.variables.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-medium",
										children: v.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular",
										children: formatQ(v.value, mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular text-muted",
										children: formatQ(v.reducedCost, mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-muted",
										children: v.type === "continuous" ? "cont" : v.type === "integer" ? "entera" : "binaria"
									})
								]
							}, v.name)) })]
						})
					})
				]
			}),
			tab === "sens" && ok && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 text-base font-semibold",
						children: "RHS (precios duales)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs text-subtle",
						children: "El precio dual es el cambio en z si el RHS aumenta en una unidad, dentro del rango."
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
										children: "Fila"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Holgura"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Dual"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "↓ RHS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "↑ RHS"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.constraints.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: c.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular",
										children: formatQ(c.slack, mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular",
										children: formatQ(c.dual, mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular",
										children: formatRange(c.rhsDec, mode)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular",
										children: formatRange(c.rhsInc, mode)
									})
								]
							}, c.name)) })]
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-2 text-base font-semibold",
					children: "Coeficientes de la función objetivo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-lg border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-elevated text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left font-medium",
									children: "Variable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "cⱼ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "↓ cⱼ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "↑ cⱼ"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.objRanges.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: o.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono tabular",
									children: o.coeff
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono tabular",
									children: formatRange(o.dec, mode)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono tabular",
									children: formatRange(o.inc, mode)
								})
							]
						}, o.name)) })]
					})
				})] })]
			}),
			tab === "sens" && !ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No hay análisis de sensibilidad para este estado."
			}),
			tab === "simplex" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimplexView, {
				tableaus: result.tableaus,
				frac
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono text-lg tabular",
			children: value
		})]
	});
}
function InformePage() {
	const nav = useNavigate();
	const result = useApp((s) => s.result);
	const solve = useApp((s) => s.solve);
	const frac = useApp((s) => s.frac);
	const setFrac = useApp((s) => s.setFrac);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 pt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Informe",
			title: "Solución"
		}), !result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: "Todavía no hay una solución. Resolvé el modelo para ver el informe tipo LINGO."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => solve(),
					children: "Resolver ahora"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => nav({ to: "/editor" }),
					children: "Ir al editor"
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `h-10 rounded-md px-3 text-xs font-medium ${frac ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
					onClick: () => setFrac(!frac),
					children: frac ? "Fracciones" : "Decimales"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SolutionReport, {
				result,
				frac
			})]
		})]
	});
}
//#endregion
export { InformePage as component };
