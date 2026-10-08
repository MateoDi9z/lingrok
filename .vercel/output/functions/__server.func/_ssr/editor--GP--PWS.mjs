import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as Bookmark, o as Plus, s as Play, u as Minus } from "../_libs/lucide-react.mjs";
import { a as parseLingo, c as defaultConstraint, l as defaultVariable, o as toLingo, r as useApp, s as Q } from "./router-CmfGc1qH.mjs";
import { r as cn, t as Button } from "./theme-switcher-BLJgEMKV.mjs";
import { t as PageHeader } from "./page-header-oto3MjeO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor--GP--PWS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LingoEditor({ model, onApply, error }) {
	const [src, setSrc] = (0, import_react.useState)(model.lingoSource);
	const [localErr, setLocalErr] = (0, import_react.useState)(error);
	(0, import_react.useEffect)(() => {
		setSrc(model.lingoSource);
	}, [
		model.id,
		model.updatedAt,
		model.lingoSource
	]);
	const apply = () => {
		const res = parseLingo(src, model);
		if (res.errors.length || !res.model) {
			setLocalErr(res.errors.map((e) => `Línea ${e.line}: ${e.message}`).join("\n") || "No se pudo interpretar el modelo.");
			return;
		}
		setLocalErr(null);
		onApply({
			...res.model,
			lingoSource: src
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "lingo-area",
				spellCheck: false,
				value: src,
				onChange: (e) => {
					setSrc(e.target.value);
					setLocalErr(null);
				},
				"aria-label": "Código LINGO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "steel",
					onClick: apply,
					children: "Aplicar al modelo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Sintaxis LINGO: filas con nombre), coeficientes pegados, y SETS / @SUM / @FOR."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "overflow-x-auto rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs leading-relaxed text-muted",
				children: `MAX = 20XA + 30XB;
BI) 5XA + 8XB <= 10;

SETS:
    Productos / P1..P5 /: X, Costo, Demanda;
ENDSETS
DATA:
    Costo = 12 15 10 18 14;
    Demanda = 100 80 120 90 110;
ENDDATA
MIN = @SUM(Productos(i): Costo(i)*X(i));
@FOR(Productos(i): X(i) <= Demanda(i));`
			}),
			localErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger whitespace-pre-wrap",
				children: localErr
			})
		]
	});
}
function numOrEmpty(n) {
	if (n === void 0 || n === null || Number.isNaN(n) || n === 0) return "";
	return String(n);
}
function parseCell(raw) {
	const t = raw.trim();
	if (!t) return 0;
	try {
		return Q.parse(t).toNumber();
	} catch {
		const n = Number(t.replace(",", "."));
		return Number.isFinite(n) ? n : 0;
	}
}
var RELS = [
	"<=",
	">=",
	"="
];
var TYPES = [
	{
		id: "continuous",
		label: "Cont"
	},
	{
		id: "integer",
		label: "Ent"
	},
	{
		id: "binary",
		label: "Bin"
	}
];
var NAME_W = 128;
var VAR_W = 100;
var REL_W = 72;
var RHS_W = 88;
var MIN_W = 64;
var MAX_W = 280;
function fitName(name, pad = 48) {
	return Math.min(MAX_W, Math.max(MIN_W, Math.round(name.length * 9 + pad)));
}
function ResizeHandle({ width, onWidth, onFit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "col-resizer",
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": "Cambiar ancho de columna",
		onPointerDown: (e) => {
			e.preventDefault();
			e.stopPropagation();
			const startX = e.clientX;
			const startW = width;
			const el = e.currentTarget;
			el.setPointerCapture(e.pointerId);
			const move = (ev) => {
				onWidth(Math.max(MIN_W, Math.min(MAX_W, startW + (ev.clientX - startX))));
			};
			const up = (ev) => {
				el.releasePointerCapture(ev.pointerId);
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		},
		onDoubleClick: (e) => {
			e.preventDefault();
			onFit?.();
		}
	});
}
function MatrixEditor({ model, onChange }) {
	const [widths, setWidths] = (0, import_react.useState)({});
	const [epoch, setEpoch] = (0, import_react.useState)(model.updatedAt);
	const wrapRef = (0, import_react.useRef)(null);
	const selfEdit = (0, import_react.useRef)(false);
	const nameW = widths._name ?? NAME_W;
	const relW = widths._rel ?? REL_W;
	const rhsW = widths._rhs ?? RHS_W;
	const varW = (id, name) => widths[id] ?? Math.max(VAR_W, fitName(name, 40));
	const setW = (key, w) => setWidths((s) => ({
		...s,
		[key]: w
	}));
	const autoFit = () => {
		const next = {
			_name: Math.max(NAME_W, ...model.constraints.map((c) => fitName(c.name, 56))),
			_rel: REL_W,
			_rhs: RHS_W
		};
		for (const v of model.variables) next[v.id] = Math.max(VAR_W, fitName(v.name, 44));
		setWidths(next);
	};
	const commit = (next) => {
		selfEdit.current = true;
		onChange({
			...next,
			lingoSource: toLingo(next),
			updatedAt: Date.now()
		});
	};
	(0, import_react.useEffect)(() => {
		if (selfEdit.current) {
			selfEdit.current = false;
			return;
		}
		setEpoch(model.updatedAt);
	}, [model.updatedAt, model.id]);
	const setObj = (id, raw) => {
		const n = parseCell(raw);
		if ((model.objective[id] ?? 0) === n) return;
		commit({
			...model,
			objective: {
				...model.objective,
				[id]: n
			}
		});
	};
	const setCoeff = (cid, vid, raw) => {
		const n = parseCell(raw);
		if ((model.constraints.find((c) => c.id === cid)?.coeffs[vid] ?? 0) === n) return;
		commit({
			...model,
			constraints: model.constraints.map((c) => c.id === cid ? {
				...c,
				coeffs: {
					...c.coeffs,
					[vid]: n
				}
			} : c)
		});
	};
	const setRhs = (cid, raw) => {
		const n = parseCell(raw);
		const cur = model.constraints.find((c) => c.id === cid);
		if (cur && cur.rhs === n) return;
		commit({
			...model,
			constraints: model.constraints.map((c) => c.id === cid ? {
				...c,
				rhs: n
			} : c)
		});
	};
	const setRel = (cid, relation) => {
		commit({
			...model,
			constraints: model.constraints.map((c) => c.id === cid ? {
				...c,
				relation
			} : c)
		});
	};
	const renameVar = (id, name) => {
		const clean = name.replace(/\s+/g, "") || "X";
		commit({
			...model,
			variables: model.variables.map((v) => v.id === id ? {
				...v,
				name: clean
			} : v)
		});
	};
	const renameCon = (id, name) => {
		commit({
			...model,
			constraints: model.constraints.map((c) => c.id === id ? {
				...c,
				name: name.replace(/\s+/g, "") || "R"
			} : c)
		});
	};
	const setType = (id, type) => {
		commit({
			...model,
			variables: model.variables.map((v) => v.id === id ? {
				...v,
				type,
				upper: type === "binary" ? 1 : v.upper,
				lower: type === "binary" ? 0 : v.lower
			} : v)
		});
	};
	const addVar = () => {
		const nv = defaultVariable(model.variables.length + 1);
		commit({
			...model,
			variables: [...model.variables, nv],
			objective: {
				...model.objective,
				[nv.id]: 0
			}
		});
	};
	const addCon = () => {
		commit({
			...model,
			constraints: [...model.constraints, defaultConstraint(model.constraints.length + 1)]
		});
	};
	const delVar = (id) => {
		if (model.variables.length <= 1) return;
		const { [id]: _, ...objective } = model.objective;
		commit({
			...model,
			variables: model.variables.filter((v) => v.id !== id),
			objective,
			constraints: model.constraints.map((c) => {
				const { [id]: __, ...coeffs } = c.coeffs;
				return {
					...c,
					coeffs
				};
			})
		});
	};
	const delCon = (id) => {
		commit({
			...model,
			constraints: model.constraints.filter((c) => c.id !== id)
		});
	};
	const style = (0, import_react.useMemo)(() => ({ ["--rhs-w"]: `${rhsW}px` }), [rhsW]);
	const nv = model.variables.length;
	const nav = (r, c) => ({ "data-nav": `${r},${c}` });
	const focusNav = (r, c) => {
		const root = wrapRef.current;
		if (!root) return false;
		const el = root.querySelector(`[data-nav="${r},${c}"]`);
		if (!el) return false;
		el.focus();
		if (el instanceof HTMLInputElement && el.inputMode === "decimal") el.select();
		return true;
	};
	const stepNav = (r, c, dr, dc) => {
		for (let k = 0; k < 48; k++) {
			r += dr;
			c += dc;
			if (r < 0 || c < 0 || r > 2 + model.constraints.length + 2 || c > nv + 4) return;
			if (focusNav(r, c)) return;
			if (dc === 0 && dr !== 0) {
				for (const d of [
					0,
					-1,
					1,
					-2,
					2,
					3,
					-3,
					nv + 1,
					nv + 2
				]) if (focusNav(r, c + d)) return;
			}
		}
	};
	const onGridKey = (e) => {
		const target = e.target;
		const raw = target.getAttribute("data-nav");
		if (!raw) return;
		const [r, c] = raw.split(",").map(Number);
		if (target instanceof HTMLInputElement && target.classList.contains("name") && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.altKey) {
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
	const onNumFocus = (e) => {
		e.currentTarget.select();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex rounded-md border border-border bg-surface p-1",
					children: ["max", "min"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: cn("h-9 rounded-sm px-3 text-sm font-medium", model.sense === s ? "bg-accent text-accent-fg" : "text-muted"),
						onClick: () => commit({
							...model,
							sense: s
						}),
						children: s === "max" ? "Maximizar" : "Minimizar"
					}, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "subtle",
							size: "sm",
							onClick: autoFit,
							children: "Ajustar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "subtle",
							size: "sm",
							onClick: addVar,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Variable"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "subtle",
							size: "sm",
							onClick: addCon,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Restricción"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "matrix-wrap",
				style,
				ref: wrapRef,
				onKeyDown: onGridKey,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "matrix",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("colgroup", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { style: { width: nameW } }),
							model.variables.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { style: { width: varW(v.id, v.name) } }, v.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { style: { width: relW } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { style: { width: rhsW } })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("thead", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "sticky-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-3 py-2 text-left text-xs font-medium text-muted",
									children: "Fila"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
									width: nameW,
									onWidth: (w) => setW("_name", w),
									onFit: () => setW("_name", NAME_W)
								})]
							}),
							model.variables.map((v, vi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "cell-input name",
									value: v.name,
									"aria-label": "Nombre de variable",
									autoComplete: "off",
									autoCorrect: "off",
									spellCheck: false,
									...nav(0, vi + 1),
									onChange: (e) => renameVar(v.id, e.target.value)
								}),
								model.variables.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "cell-del",
									"aria-label": `Quitar ${v.name}`,
									onClick: () => delVar(v.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 14 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
									width: varW(v.id, v.name),
									onWidth: (w) => setW(v.id, w),
									onFit: () => setW(v.id, fitName(v.name, 44))
								})
							] }, v.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "sticky-rel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-1 py-2 text-center text-xs font-medium text-muted",
									children: "Rel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
									width: relW,
									onWidth: (w) => setW("_rel", w),
									onFit: () => setW("_rel", REL_W)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "sticky-rhs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-1 py-2 text-center text-xs font-medium text-muted",
									children: "RHS"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResizeHandle, {
									width: rhsW,
									onWidth: (w) => setW("_rhs", w),
									onFit: () => setW("_rhs", RHS_W)
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky-col",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-3 py-1 text-left text-xs font-medium text-muted",
									children: "Tipo"
								})
							}),
							model.variables.map((v, vi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "cell-input type",
								value: v.type,
								"aria-label": `Tipo de ${v.name}`,
								...nav(1, vi + 1),
								onChange: (e) => setType(v.id, e.target.value),
								children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.id,
									children: t.label
								}, t.id))
							}) }, v.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "sticky-rel" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "sticky-rhs" })
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "sticky-col",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-3 text-left text-xs font-medium text-steel",
									children: model.sense === "max" ? "MAX" : "MIN"
								})
							}),
							model.variables.map((v, vi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "cell-input",
								inputMode: "decimal",
								placeholder: "0",
								defaultValue: numOrEmpty(model.objective[v.id]),
								...nav(2, vi + 1),
								onFocus: onNumFocus,
								onBlur: (e) => setObj(v.id, e.target.value)
							}, `obj-${v.id}-${epoch}`) }, v.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky-rel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-center text-muted",
									children: "="
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky-rhs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-2 text-center font-mono text-sm text-subtle",
									children: "z"
								})
							})
						] }), model.constraints.map((c, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "sticky-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "cell-input name",
									value: c.name,
									autoComplete: "off",
									autoCorrect: "off",
									spellCheck: false,
									...nav(3 + ci, 0),
									onChange: (e) => renameCon(c.id, e.target.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "cell-del",
									onClick: () => delCon(c.id),
									"aria-label": `Quitar ${c.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 14 })
								})]
							}),
							model.variables.map((v, vi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "cell-input",
								inputMode: "decimal",
								placeholder: "0",
								defaultValue: numOrEmpty(c.coeffs[v.id]),
								...nav(3 + ci, vi + 1),
								onFocus: onNumFocus,
								onBlur: (e) => setCoeff(c.id, v.id, e.target.value)
							}, `${c.id}-${v.id}-${epoch}`) }, v.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky-rel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "cell-input type",
									value: c.relation,
									"aria-label": `Relación ${c.name}`,
									...nav(3 + ci, nv + 1),
									onChange: (e) => setRel(c.id, e.target.value),
									children: RELS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: r,
										children: r
									}, r))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "sticky-rhs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "cell-input",
									inputMode: "decimal",
									defaultValue: String(c.rhs),
									...nav(3 + ci, nv + 2),
									onFocus: onNumFocus,
									onBlur: (e) => setRhs(c.id, e.target.value)
								}, `rhs-${c.id}-${epoch}`)
							})
						] }, c.id))] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Arrastrá el borde de una columna para ensancharla. Flechas, Enter y Tab recorren las celdas. Vacío = 0."
			})
		]
	});
}
function EditorPage() {
	const nav = useNavigate();
	const model = useApp((s) => s.model);
	const setModel = useApp((s) => s.setModel);
	const saveCurrent = useApp((s) => s.saveCurrent);
	const solve = useApp((s) => s.solve);
	const editorTab = useApp((s) => s.editorTab);
	const setEditorTab = useApp((s) => s.setEditorTab);
	const parseError = useApp((s) => s.parseError);
	const [savedFlash, setSavedFlash] = (0, import_react.useState)(false);
	const run = () => {
		solve();
		nav({ to: "/informe" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				kicker: "Modelo",
				title: "Editor",
				description: "Cargá coeficientes en la tabla o escribí el modelo en LINGO."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-md border border-border bg-surface p-1",
				children: [["visual", "Visual"], ["lingo", "LINGO"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: cn("h-10 flex-1 rounded-sm text-sm font-medium", editorTab === id ? "bg-accent text-accent-fg" : "text-muted"),
					onClick: () => setEditorTab(id),
					children: label
				}, id))
			}),
			editorTab === "visual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatrixEditor, {
				model,
				onChange: setModel
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LingoEditor, {
				model,
				onApply: setModel,
				error: parseError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky bottom-24 z-10 flex gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "flex-1",
					onClick: run,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
						size: 16,
						fill: "currentColor"
					}), " Resolver"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => {
						saveCurrent();
						setSavedFlash(true);
						setTimeout(() => setSavedFlash(false), 1200);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { size: 16 }), savedFlash ? "Listo" : "Guardar"]
				})]
			})
		]
	});
}
//#endregion
export { EditorPage as component };
