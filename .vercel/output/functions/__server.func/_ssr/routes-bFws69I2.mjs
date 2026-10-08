import { C as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as ChevronRight, n as Trash2, o as Plus } from "../_libs/lucide-react.mjs";
import { i as EXAMPLES, r as useApp, u as isBlankModel } from "./router-CmfGc1qH.mjs";
import { n as ThemeSwitcher, t as Button } from "./theme-switcher-BLJgEMKV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-bFws69I2.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const nav = useNavigate();
	const saved = useApp((s) => s.saved);
	const loadExample = useApp((s) => s.loadExample);
	const loadSaved = useApp((s) => s.loadSaved);
	const newModel = useApp((s) => s.newModel);
	const deleteSaved = useApp((s) => s.deleteSaved);
	const model = useApp((s) => s.model);
	const inProgress = !isBlankModel(model);
	const openExample = (id) => {
		loadExample(id);
		nav({ to: "/editor" });
	};
	const openNew = () => {
		newModel();
		nav({ to: "/editor" });
	};
	const openSaved = (id) => {
		loadSaved(id);
		nav({ to: "/editor" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-steel uppercase",
						children: "Investigación operativa"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitcher, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-semibold tracking-tight",
					children: "Lingrok"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
					children: "Armá un modelo de programación lineal, resolvélo y leé el informe. Los ejemplos de abajo son opcionales: sirven para practicar, no hace falta usarlos."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: openNew,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Nuevo modelo"]
					}), inProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => nav({ to: "/editor" }),
						children: "Continuar"
					})]
				})
			] }),
			saved.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-lg font-semibold",
				children: "Recientes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: saved.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "min-w-0 flex-1 text-left",
						onClick: () => openSaved(m.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-medium",
							children: m.name || "Modelo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-subtle",
							children: [
								m.variables.length,
								" var · ",
								m.constraints.length,
								" rest · ",
								m.sense.toUpperCase()
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "size-11 text-subtle hover:text-danger",
						"aria-label": "Eliminar",
						onClick: () => deleteSaved(m.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
					})]
				}) }, m.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-lg font-semibold",
					children: "Ejemplos"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-sm text-muted",
					children: "Casos clásicos de cátedra, por si querés ver uno resuelto antes de cargar el tuyo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => openExample(ex.id),
						className: "rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-150 hover:bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs tracking-wide text-steel uppercase",
									children: ex.topic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-medium",
									children: ex.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: ex.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex gap-2 text-xs text-subtle",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [ex.vars, " var"] }),
										ex.graphic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "gráfico" }),
										ex.integer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "entera" })
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								size: 18,
								className: "mt-1 shrink-0 text-subtle"
							})]
						})
					}, ex.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "En el iPhone"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Abrí Compartir en Safari y elegí «Agregar a inicio»." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Lingrok queda como una app, a pantalla completa." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Los modelos se guardan en este aparato (no hace falta cuenta)." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pb-2 text-center text-[11px] text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://github.com/MateoDi9z",
					target: "_blank",
					rel: "noreferrer",
					className: "hover:text-muted",
					title: "Autor",
					children: "MateoDi9z"
				})
			})
		]
	});
}
//#endregion
export { Home as component };
