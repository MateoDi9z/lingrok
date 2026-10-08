import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as ThemeSwitcher } from "./theme-switcher-BLJgEMKV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-header-oto3MjeO.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ kicker, title, description, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-[0.16em] text-steel uppercase",
				children: kicker
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [extra, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitcher, {})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-2xl font-semibold tracking-tight",
			children: title
		}),
		description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: description
		}) : null
	] });
}
//#endregion
export { PageHeader as t };
