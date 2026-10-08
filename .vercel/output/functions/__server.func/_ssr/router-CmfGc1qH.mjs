import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, Y as require_react, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Sigma, h as BookOpen, i as SlidersHorizontal, p as ChartLine, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CmfGc1qH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
function defaultVariable(index) {
	return {
		id: uid("v"),
		name: `X${index}`,
		type: "continuous",
		lower: 0,
		upper: null
	};
}
function defaultConstraint(index) {
	return {
		id: uid("c"),
		name: `R${index}`,
		coeffs: {},
		relation: "<=",
		rhs: 0
	};
}
function blankModel() {
	const v1 = defaultVariable(1);
	const v2 = defaultVariable(2);
	const c1 = defaultConstraint(1);
	return {
		id: uid("m"),
		name: "Nuevo modelo",
		description: "",
		sense: "max",
		objective: {
			[v1.id]: 0,
			[v2.id]: 0
		},
		variables: [v1, v2],
		constraints: [c1],
		lingoSource: "",
		updatedAt: Date.now()
	};
}
function isBlankModel(m) {
	if (m.exampleId) return false;
	if (m.constraints.length > 1 || m.variables.length > 2) return false;
	if (Object.values(m.objective).some((n) => n)) return false;
	if (m.constraints.some((c) => c.rhs || Object.values(c.coeffs).some((n) => n))) return false;
	return true;
}
/** Exact rational arithmetic for simplex tableaus and reports. */
function gcd(a, b) {
	a = a < 0n ? -a : a;
	b = b < 0n ? -b : b;
	while (b !== 0n) {
		const t = a % b;
		a = b;
		b = t;
	}
	return a === 0n ? 1n : a;
}
var Q = class Q {
	n;
	d;
	constructor(n, d = 1n) {
		let nn = typeof n === "number" ? BigInt(Math.trunc(n)) : n;
		let dd = typeof d === "number" ? BigInt(Math.trunc(d)) : d;
		if (dd === 0n) throw new Error("División por cero");
		if (dd < 0n) {
			nn = -nn;
			dd = -dd;
		}
		const g = gcd(nn, dd);
		this.n = nn / g;
		this.d = dd / g;
	}
	static ZERO = new Q(0n, 1n);
	static ONE = new Q(1n, 1n);
	static NEG_ONE = new Q(-1n, 1n);
	static from(n) {
		if (n instanceof Q) return n;
		return new Q(n, 1n);
	}
	static fromDecimal(value) {
		if (!Number.isFinite(value)) return Q.ZERO;
		if (Number.isInteger(value)) return new Q(value, 1n);
		return Q.parse(String(value));
	}
	/** Parse "3", "-2.5", "3,14", "1/2", " - 4 / 3 ". Empty → 0. */
	static parse(raw) {
		const s = raw.trim().replace(/\s+/g, "");
		if (!s || s === "+" || s === "-") return Q.ZERO;
		const sign = s.startsWith("-") ? -1n : 1n;
		const body = s.replace(/^[+-]/, "");
		if (body.includes("/")) {
			const [a, b] = body.split("/");
			const num = Q.parseUnsignedDecimal(a ?? "0");
			const den = Q.parseUnsignedDecimal(b ?? "1");
			if (den.isZero()) throw new Error("División por cero");
			return num.div(den).mul(new Q(sign, 1n));
		}
		return Q.parseUnsignedDecimal(body).mul(new Q(sign, 1n));
	}
	static parseUnsignedDecimal(body) {
		const t = body.replace(",", ".");
		if (!t) return Q.ZERO;
		const i = t.indexOf(".");
		if (i < 0) return new Q(BigInt(t || "0"), 1n);
		const whole = t.slice(0, i) || "0";
		let frac = t.slice(i + 1).replace(/\./g, "");
		if (frac.length > 12) frac = frac.slice(0, 12);
		const den = 10n ** BigInt(frac.length);
		const num = BigInt(whole) * den + BigInt(frac || "0");
		return new Q(num, den);
	}
	add(o) {
		return new Q(this.n * o.d + o.n * this.d, this.d * o.d);
	}
	sub(o) {
		return new Q(this.n * o.d - o.n * this.d, this.d * o.d);
	}
	mul(o) {
		return new Q(this.n * o.n, this.d * o.d);
	}
	div(o) {
		if (o.n === 0n) throw new Error("División por cero");
		return new Q(this.n * o.d, this.d * o.n);
	}
	neg() {
		return new Q(-this.n, this.d);
	}
	abs() {
		return this.n < 0n ? this.neg() : this;
	}
	cmp(o) {
		const d = this.n * o.d - o.n * this.d;
		return d < 0n ? -1 : d > 0n ? 1 : 0;
	}
	eq(o) {
		return this.n === o.n && this.d === o.d;
	}
	isZero() {
		return this.n === 0n;
	}
	isPositive() {
		return this.n > 0n;
	}
	isNegative() {
		return this.n < 0n;
	}
	isInteger() {
		return this.d === 1n;
	}
	/** Near-integer for MIP (already exact; used when mixing floats). */
	floor() {
		const q = this.n / this.d;
		if (this.n % this.d === 0n) return new Q(q, 1n);
		if (this.n < 0n) return new Q(q - 1n, 1n);
		return new Q(q, 1n);
	}
	ceil() {
		const q = this.n / this.d;
		if (this.n % this.d === 0n) return new Q(q, 1n);
		if (this.n < 0n) return new Q(q, 1n);
		return new Q(q + 1n, 1n);
	}
	toNumber() {
		return Number(this.n) / Number(this.d);
	}
	/** Pretty fraction, mixed if |n|>d, else improper. */
	toFraction() {
		if (this.d === 1n) return this.n.toString();
		return `${this.n < 0n ? "-" : ""}${(this.n < 0n ? -this.n : this.n).toString()}/${this.d.toString()}`;
	}
	toDecimal(places = 6) {
		const neg = this.n < 0n;
		const n = this.n < 0n ? -this.n : this.n;
		const whole = n / this.d;
		let rem = n % this.d;
		if (rem === 0n) return `${neg ? "-" : ""}${whole.toString()}`;
		let frac = "";
		for (let i = 0; i < places && rem !== 0n; i++) {
			rem *= 10n;
			frac += (rem / this.d).toString();
			rem = rem % this.d;
		}
		frac = frac.replace(/0+$/, "");
		return `${neg ? "-" : ""}${whole.toString()}${frac ? "." + frac : ""}`;
	}
	toString() {
		return this.toFraction();
	}
};
var RESERVED = /* @__PURE__ */ new Set([
	"MAX",
	"MIN",
	"MAXIMIZE",
	"MINIMIZE",
	"MODEL",
	"END",
	"TITLE",
	"SETS",
	"ENDSETS",
	"DATA",
	"ENDDATA",
	"SUBJECT",
	"TO",
	"ST",
	"S.T."
]);
function isNameStart(c) {
	return /[A-Za-z_]/.test(c);
}
function isNameChar(c) {
	return /[A-Za-z0-9_]/.test(c);
}
function tokenize(src) {
	const out = [];
	const lines = src.replace(/\r\n/g, "\n").split("\n");
	for (let li = 0; li < lines.length; li++) {
		let s = lines[li];
		const bang = s.indexOf("!");
		if (bang >= 0) s = s.slice(0, bang);
		s = s.trim();
		if (!s) continue;
		let i = 0;
		const line = li + 1;
		const push = (kind, v) => out.push({
			kind,
			v,
			line
		});
		while (i < s.length) {
			const c = s[i];
			if (c === " " || c === "	") {
				i++;
				continue;
			}
			if (c === "<") {
				if (s[i + 1] === "=") {
					push("op", "<=");
					i += 2;
				} else {
					push("op", "<=");
					i++;
				}
				continue;
			}
			if (c === ">") {
				if (s[i + 1] === "=") {
					push("op", ">=");
					i += 2;
				} else {
					push("op", ">=");
					i++;
				}
				continue;
			}
			if (c === "=") {
				push("op", "=");
				i++;
				continue;
			}
			if (c === "+" || c === "-" || c === "*" || c === "/" || c === "(" || c === ")" || c === ";" || c === ":" || c === "[" || c === "]" || c === "," || c === "|") {
				push("op", c);
				i++;
				continue;
			}
			if (c === "." && s[i + 1] === ".") {
				push("op", "..");
				i += 2;
				continue;
			}
			if (c === "#") {
				let j = i + 1;
				while (j < s.length && s[j] !== "#") j++;
				if (s[j] === "#") j++;
				push("op", s.slice(i, j).toUpperCase());
				i = j;
				continue;
			}
			if (c === "@") {
				let j = i + 1;
				while (j < s.length && isNameChar(s[j])) j++;
				push("dir", s.slice(i, j).toUpperCase());
				i = j;
				continue;
			}
			if (isNameStart(c)) {
				let j = i + 1;
				while (j < s.length && isNameChar(s[j])) j++;
				push("name", s.slice(i, j));
				i = j;
				continue;
			}
			if (/[0-9]/.test(c) || c === "." && /[0-9]/.test(s[i + 1] ?? "")) {
				let j = i;
				let buf = "";
				let seenDot = false;
				while (j < s.length) {
					const ch = s[j];
					if (/[0-9]/.test(ch)) {
						buf += ch;
						j++;
						continue;
					}
					if (ch === "." && s[j + 1] === ".") break;
					if (ch === "." && !seenDot) {
						seenDot = true;
						buf += ch;
						j++;
						continue;
					}
					break;
				}
				push("num", buf);
				i = j;
				continue;
			}
			throw {
				line,
				message: `Carácter no válido: "${c}"`
			};
		}
		push("eol", "");
	}
	out.push({
		kind: "eof",
		v: "",
		line: lines.length
	});
	return out;
}
function emptyLinear() {
	return {
		terms: /* @__PURE__ */ new Map(),
		k: Q.ZERO
	};
}
function addLinear(a, b) {
	const terms = new Map(a.terms);
	b.terms.forEach((q, n) => terms.set(n, (terms.get(n) ?? Q.ZERO).add(q)));
	return {
		terms,
		k: a.k.add(b.k)
	};
}
function scaleLinear(a, s) {
	if (s.isZero()) return emptyLinear();
	const terms = /* @__PURE__ */ new Map();
	a.terms.forEach((q, n) => {
		const p = q.mul(s);
		if (!p.isZero()) terms.set(n, p);
	});
	return {
		terms,
		k: a.k.mul(s)
	};
}
function mulLinear(a, b, line) {
	if (a.terms.size > 0 && b.terms.size > 0) throw {
		line,
		message: "Término no lineal (producto de variables). Solo se admite PL."
	};
	if (b.terms.size > 0) return scaleLinear(b, a.k);
	return scaleLinear(a, b.k);
}
function keyOf(members) {
	return members.join(",");
}
function flattenName(attr, members) {
	return [attr, ...members].join("_");
}
function expandRange(from, to, line) {
	const m1 = from.match(/^(.*?)(\d+)$/);
	const m2 = to.match(/^(.*?)(\d+)$/);
	if (m1 && m2 && m1[1] === m2[1]) {
		const prefix = m1[1];
		const a = Number(m1[2]);
		const b = Number(m2[2]);
		const width = m1[2].length === m2[2].length && m1[2].startsWith("0") ? m1[2].length : 0;
		const out = [];
		const step = a <= b ? 1 : -1;
		for (let n = a; step > 0 ? n <= b : n >= b; n += step) out.push(prefix + (width ? String(n).padStart(width, "0") : String(n)));
		return out;
	}
	if (from.length === 1 && to.length === 1) {
		const a = from.charCodeAt(0);
		const b = to.charCodeAt(0);
		const out = [];
		const step = a <= b ? 1 : -1;
		for (let c = a; step > 0 ? c <= b : c >= b; c += step) out.push(String.fromCharCode(c));
		return out;
	}
	throw {
		line,
		message: `Rango no válido: ${from}..${to}`
	};
}
function skipWs(toks, i) {
	while (toks[i.n]?.kind === "eol") i.n++;
}
function cartesian(parents) {
	return parents.reduce((acc, dim) => {
		if (!acc.length) return dim.map((m) => [m]);
		const out = [];
		for (const prev of acc) for (const m of dim) out.push([...prev, m]);
		return out;
	}, []);
}
function setByName(env, name) {
	const up = name.toUpperCase();
	for (const s of env.sets.values()) if (s.name.toUpperCase() === up) return s;
}
function attrByName(env, name) {
	const up = name.toUpperCase();
	for (const [k, a] of env.attrs) if (k.toUpperCase() === up) return a;
}
function attrKey(env, name) {
	const up = name.toUpperCase();
	for (const k of env.attrs.keys()) if (k.toUpperCase() === up) return k;
}
function parseMemberList(toks, i, arity) {
	skipWs(toks, i);
	if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "/")) return [];
	const line = toks[i.n].line;
	i.n++;
	const raw = [];
	while (toks[i.n] && !(toks[i.n].kind === "op" && toks[i.n].v === "/") && toks[i.n].kind !== "eof") {
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === "/") break;
		const t = toks[i.n];
		if (!t || t.kind === "eof") break;
		if (t.kind === "op" && t.v === ",") {
			i.n++;
			continue;
		}
		if (t.kind === "op" && t.v === "..") {
			i.n++;
			skipWs(toks, i);
			const b = toks[i.n];
			if (!b || b.kind !== "name" && b.kind !== "num") throw {
				line,
				message: "Rango .. incompleto"
			};
			const from = raw.pop();
			if (!from) throw {
				line,
				message: "Rango .. sin origen"
			};
			raw.push(...expandRange(from, b.v, line));
			i.n++;
			continue;
		}
		if (t.kind === "name" || t.kind === "num") {
			raw.push(t.v);
			i.n++;
			continue;
		}
		throw {
			line: t.line,
			message: `Miembro de conjunto no válido: ${t.v}`
		};
	}
	if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "/")) throw {
		line,
		message: "Falta / de cierre en la lista de miembros"
	};
	i.n++;
	if (arity <= 1) return raw.map((m) => [m]);
	if (raw.length % arity !== 0) throw {
		line,
		message: `Se esperaban tuplas de ${arity} miembros`
	};
	const out = [];
	for (let k = 0; k < raw.length; k += arity) out.push(raw.slice(k, k + arity));
	return out;
}
function parseNameList(toks, i) {
	const names = [];
	skipWs(toks, i);
	while (toks[i.n]?.kind === "name") {
		names.push(toks[i.n].v);
		i.n++;
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") {
			i.n++;
			skipWs(toks, i);
		}
	}
	return names;
}
function parseSetsSection(toks, i, env) {
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
	skipWs(toks, i);
	while (toks[i.n] && toks[i.n].kind !== "eof") {
		skipWs(toks, i);
		const t = toks[i.n];
		if (!t || t.kind === "eof") break;
		if (t.kind === "name" && t.v.toUpperCase() === "ENDSETS") {
			i.n++;
			eatSemi(toks, i);
			return;
		}
		if (t.kind !== "name") throw {
			line: t.line,
			message: "Se esperaba un nombre de conjunto"
		};
		const setName = t.v;
		i.n++;
		skipWs(toks, i);
		const parents = [];
		if (toks[i.n]?.kind === "op" && toks[i.n].v === "(") {
			i.n++;
			while (toks[i.n] && !(toks[i.n].kind === "op" && toks[i.n].v === ")")) {
				skipWs(toks, i);
				if (toks[i.n]?.kind === "name") {
					parents.push(toks[i.n].v);
					i.n++;
				}
				skipWs(toks, i);
				if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") i.n++;
			}
			if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
		}
		skipWs(toks, i);
		const listed = parseMemberList(toks, i, parents.length || 1);
		skipWs(toks, i);
		const attributes = [];
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") {
			i.n++;
			attributes.push(...parseNameList(toks, i));
		}
		eatSemi(toks, i);
		let members = listed;
		if (!members.length && parents.length) members = cartesian(parents.map((p) => {
			const ps = setByName(env, p);
			if (!ps) throw {
				line: t.line,
				message: `Conjunto padre "${p}" no definido`
			};
			return ps.members.map((m) => m.length === 1 ? m[0] : keyOf(m));
		}));
		const set = {
			name: setName,
			members,
			parents,
			attributes
		};
		env.sets.set(setName.toUpperCase(), set);
		for (const a of attributes) env.attrs.set(a, {
			setName,
			data: /* @__PURE__ */ new Map(),
			isData: false
		});
	}
	throw {
		line: toks[i.n]?.line ?? 0,
		message: "Falta ENDSETS"
	};
}
function parseDataSection(toks, i, env) {
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
	skipWs(toks, i);
	while (toks[i.n] && toks[i.n].kind !== "eof") {
		skipWs(toks, i);
		const t = toks[i.n];
		if (!t || t.kind === "eof") break;
		if (t.kind === "name" && t.v.toUpperCase() === "ENDDATA") {
			i.n++;
			eatSemi(toks, i);
			return;
		}
		if (t.kind !== "name") throw {
			line: t.line,
			message: "Se esperaba un atributo o conjunto en DATA"
		};
		const names = parseNameList(toks, i);
		skipWs(toks, i);
		if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "=")) throw {
			line: t.line,
			message: `Se esperaba = después de ${names.join(", ")}`
		};
		i.n++;
		const values = [];
		while (toks[i.n] && !(toks[i.n].kind === "op" && toks[i.n].v === ";") && toks[i.n].kind !== "eof") {
			skipWs(toks, i);
			if (toks[i.n]?.kind === "op" && toks[i.n].v === ";") break;
			if (toks[i.n]?.kind === "name" && toks[i.n].v.toUpperCase() === "ENDDATA") break;
			const v = toks[i.n];
			if (!v) break;
			if (v.kind === "op" && (v.v === "," || v.v === "/")) {
				i.n++;
				continue;
			}
			if (v.kind === "op" && v.v === "..") {
				i.n++;
				skipWs(toks, i);
				const b = toks[i.n];
				const from = values.pop();
				if (!from || !b || b.kind !== "name" && b.kind !== "num") throw {
					line: v.line,
					message: "Rango .. incompleto en DATA"
				};
				values.push(...expandRange(from, b.v, v.line));
				i.n++;
				continue;
			}
			if (v.kind === "num" || v.kind === "name") {
				values.push(v.v);
				i.n++;
				continue;
			}
			throw {
				line: v.line,
				message: `Valor DATA no válido: ${v.v}`
			};
		}
		eatSemi(toks, i);
		for (const nm of names) {
			const set = setByName(env, nm);
			if (set && !attrByName(env, nm)) {
				if (!set.members.length) set.members = values.map((m) => [m]);
				continue;
			}
			const attrName = attrKey(env, nm);
			if (!attrName) throw {
				line: t.line,
				message: `"${nm}" no es un atributo ni un conjunto declarado en SETS`
			};
			const info = env.attrs.get(attrName);
			const setRef = setByName(env, info.setName);
			if (!setRef) throw {
				line: t.line,
				message: `Conjunto de ${nm} no encontrado`
			};
			if (values.length !== setRef.members.length) throw {
				line: t.line,
				message: `${nm} tiene ${values.length} valores y el conjunto ${setRef.name} tiene ${setRef.members.length} miembros`
			};
			info.isData = true;
			info.data.clear();
			setRef.members.forEach((m, idx) => {
				info.data.set(keyOf(m), Q.parse(values[idx]));
			});
		}
	}
	throw {
		line: toks[i.n]?.line ?? 0,
		message: "Falta ENDDATA"
	};
}
function resolveIndex(toks, i, bind) {
	skipWs(toks, i);
	const t = toks[i.n];
	if (!t || t.kind !== "name" && t.kind !== "num") throw {
		line: t?.line ?? 0,
		message: "Se esperaba un índice"
	};
	i.n++;
	if (t.kind === "name" && bind.has(t.v)) return bind.get(t.v);
	const up = t.v.toUpperCase();
	for (const [k, v] of bind) if (k.toUpperCase() === up) return v;
	return t.v;
}
function parseIndexList(toks, i, bind) {
	skipWs(toks, i);
	if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) return [];
	i.n++;
	const idx = [];
	while (toks[i.n] && !(toks[i.n].kind === "op" && toks[i.n].v === ")")) {
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") break;
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") {
			i.n++;
			continue;
		}
		idx.push(resolveIndex(toks, i, bind));
		skipWs(toks, i);
	}
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
	return idx;
}
function lookupIndexed(env, attr, members, line) {
	const info = attrByName(env, attr);
	if (!info) {
		if (members.length) throw {
			line,
			message: `"${attr}" no es un atributo de ningún conjunto`
		};
		const lin = emptyLinear();
		lin.terms.set(attr, Q.ONE);
		return lin;
	}
	const set = setByName(env, info.setName);
	if (!set) throw {
		line,
		message: `Conjunto de ${attr} no encontrado`
	};
	const mem = members.length ? members : [];
	if (mem.length !== (set.parents.length || 1) && mem.length !== set.members[0]?.length) {
		if (mem.length === 0) throw {
			line,
			message: `${attr} requiere índices (p.ej. ${attr}(i))`
		};
	}
	const k = keyOf(mem);
	if (info.isData) {
		const q = info.data.get(k);
		if (!q) throw {
			line,
			message: `No hay dato de ${attr}(${mem.join(",")})`
		};
		return {
			terms: /* @__PURE__ */ new Map(),
			k: q
		};
	}
	const lin = emptyLinear();
	lin.terms.set(flattenName(attrKey(env, attr) ?? attr, mem), Q.ONE);
	return lin;
}
function parseExpr(toks, i, ctx) {
	skipWs(toks, i);
	let acc = parseTerm(toks, i, ctx);
	while (true) {
		skipWs(toks, i);
		const t = toks[i.n];
		if (t?.kind === "op" && t.v === "+") {
			i.n++;
			acc = addLinear(acc, parseTerm(toks, i, ctx));
			continue;
		}
		if (t?.kind === "op" && t.v === "-") {
			i.n++;
			acc = addLinear(acc, scaleLinear(parseTerm(toks, i, ctx), Q.NEG_ONE));
			continue;
		}
		break;
	}
	return acc;
}
function parseTerm(toks, i, ctx) {
	skipWs(toks, i);
	let acc = parseFactor(toks, i, ctx);
	while (true) {
		skipWs(toks, i);
		const t = toks[i.n];
		if (t?.kind === "op" && t.v === "*") {
			i.n++;
			acc = mulLinear(acc, parseFactor(toks, i, ctx), t.line);
			continue;
		}
		if (t?.kind === "op" && t.v === "/") {
			i.n++;
			const den = parseFactor(toks, i, ctx);
			if (den.terms.size > 0) throw {
				line: t.line,
				message: "No se puede dividir por una variable"
			};
			if (den.k.isZero()) throw {
				line: t.line,
				message: "División por cero"
			};
			acc = scaleLinear(acc, Q.ONE.div(den.k));
			continue;
		}
		break;
	}
	return acc;
}
function implicitMembers(ctx, attr, line) {
	const info = attrByName(ctx.env, attr);
	if (!info) return [];
	const set = setByName(ctx.env, info.setName);
	if (!set) return [];
	const arity = set.members[0]?.length ?? 1;
	if (arity === 1) {
		for (const v of ctx.bind.values()) if (set.members.some((m) => keyOf(m) === v || m[0] === v)) {
			const tup = set.members.find((m) => keyOf(m) === v || m[0] === v);
			if (tup) return tup;
		}
	} else {
		const parents = set.parents.map((p) => setByName(ctx.env, p));
		const tuple = [];
		for (let d = 0; d < arity; d++) {
			const parent = parents[d];
			let found;
			for (const v of ctx.bind.values()) if (!parent || parent.members.some((m) => keyOf(m) === v || m[0] === v)) {
				found = v;
				break;
			}
			if (!found) break;
			tuple.push(found);
		}
		if (tuple.length === arity) return tuple;
	}
	throw {
		line,
		message: `${attr} necesita índices explícitos`
	};
}
function parseFactor(toks, i, ctx) {
	skipWs(toks, i);
	const t = toks[i.n];
	if (!t || t.kind === "eof") throw {
		line: t?.line ?? 0,
		message: "Expresión incompleta"
	};
	if (t.kind === "op" && t.v === "+") {
		i.n++;
		return parseFactor(toks, i, ctx);
	}
	if (t.kind === "op" && t.v === "-") {
		i.n++;
		return scaleLinear(parseFactor(toks, i, ctx), Q.NEG_ONE);
	}
	if (t.kind === "op" && t.v === "(") {
		i.n++;
		const inner = parseExpr(toks, i, ctx);
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
		else throw {
			line: t.line,
			message: "Falta ) en la expresión"
		};
		return inner;
	}
	if (t.kind === "dir" && t.v === "@SUM") return parseSum(toks, i, ctx);
	if (t.kind === "dir" && t.v === "@SIZE") {
		i.n++;
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === "(") i.n++;
		skipWs(toks, i);
		const nm = toks[i.n];
		if (nm?.kind !== "name") throw {
			line: t.line,
			message: "@SIZE espera un conjunto"
		};
		i.n++;
		skipWs(toks, i);
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
		const set = ctx ? setByName(ctx.env, nm.v) : void 0;
		if (!set) throw {
			line: t.line,
			message: `Conjunto "${nm.v}" no definido`
		};
		return {
			terms: /* @__PURE__ */ new Map(),
			k: new Q(set.members.length, 1n)
		};
	}
	if (t.kind === "num") {
		i.n++;
		const coef = Q.parse(t.v);
		skipWs(toks, i);
		const nxt = toks[i.n];
		if (nxt?.kind === "name") {
			i.n++;
			const idx = ctx && toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, ctx.bind) : [];
			if (ctx && (idx.length || attrByName(ctx.env, nxt.v))) {
				const mem = idx.length ? idx : implicitMembers(ctx, nxt.v, t.line);
				return scaleLinear(lookupIndexed(ctx.env, nxt.v, mem, t.line), coef);
			}
			const lin = emptyLinear();
			lin.terms.set(nxt.v, coef);
			return lin;
		}
		return {
			terms: /* @__PURE__ */ new Map(),
			k: coef
		};
	}
	if (t.kind === "name") {
		i.n++;
		const idx = ctx && toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, ctx.bind) : [];
		if (ctx && (idx.length || attrByName(ctx.env, t.v))) {
			const mem = idx.length ? idx : implicitMembers(ctx, t.v, t.line);
			return lookupIndexed(ctx.env, t.v, mem, t.line);
		}
		const lin = emptyLinear();
		lin.terms.set(t.v, Q.ONE);
		return lin;
	}
	throw {
		line: t.line,
		message: `Expresión no válida cerca de "${t.v}"`
	};
}
function parseSetHead(toks, i, env, line) {
	skipWs(toks, i);
	const nm = toks[i.n];
	if (nm?.kind !== "name") throw {
		line,
		message: "Se esperaba un conjunto"
	};
	const set = setByName(env, nm.v);
	if (!set) throw {
		line: nm.line,
		message: `Conjunto "${nm.v}" no definido`
	};
	i.n++;
	skipWs(toks, i);
	const indices = [];
	if (toks[i.n]?.kind === "op" && toks[i.n].v === "(") {
		i.n++;
		while (toks[i.n] && !(toks[i.n].kind === "op" && toks[i.n].v === ")")) {
			skipWs(toks, i);
			if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") break;
			if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") {
				i.n++;
				continue;
			}
			if (toks[i.n]?.kind === "name" || toks[i.n]?.kind === "num") {
				indices.push(toks[i.n].v);
				i.n++;
				continue;
			}
			throw {
				line: toks[i.n].line,
				message: "Índice no válido"
			};
		}
		if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
	} else {
		const arity = set.members[0]?.length ?? 1;
		for (let k = 0; k < arity; k++) indices.push(`_${k + 1}`);
	}
	skipWs(toks, i);
	let cond = null;
	if (toks[i.n]?.kind === "op" && toks[i.n].v === "|") {
		i.n++;
		cond = parseCondition(toks, i, env);
	}
	skipWs(toks, i);
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
	else throw {
		line,
		message: "Falta : en @SUM/@FOR"
	};
	return {
		set,
		indices,
		cond
	};
}
function bindMember(indices, mem) {
	const bind = /* @__PURE__ */ new Map();
	indices.forEach((idx, k) => bind.set(idx, mem[k] ?? keyOf(mem)));
	return bind;
}
function mergeBind(outer, inner) {
	const m = new Map(outer);
	inner.forEach((v, k) => m.set(k, v));
	return m;
}
function parseSum(toks, i, ctx) {
	const t = toks[i.n];
	if (!ctx) throw {
		line: t.line,
		message: "@SUM requiere una sección SETS"
	};
	i.n++;
	skipWs(toks, i);
	if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) throw {
		line: t.line,
		message: "@SUM espera ("
	};
	i.n++;
	const head = parseSetHead(toks, i, ctx.env, t.line);
	const start = i.n;
	let acc = emptyLinear();
	let end = start;
	for (const mem of head.set.members) {
		const bind = mergeBind(ctx.bind, bindMember(head.indices, mem));
		if (head.cond && !head.cond(bind)) continue;
		i.n = start;
		acc = addLinear(acc, parseExpr(toks, i, {
			env: ctx.env,
			bind
		}));
		end = i.n;
	}
	if (!head.set.members.length) {
		parseExpr(toks, i, ctx);
		end = i.n;
	}
	i.n = end;
	skipWs(toks, i);
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
	else throw {
		line: t.line,
		message: "Falta ) de cierre en @SUM"
	};
	return acc;
}
function condValue(toks, i, env, bind) {
	skipWs(toks, i);
	const t = toks[i.n];
	if (t?.kind === "num") {
		i.n++;
		return {
			q: Q.parse(t.v),
			s: t.v
		};
	}
	if (t?.kind === "name") {
		i.n++;
		const idx = toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, bind) : [];
		if (bind.has(t.v) && !idx.length) {
			const s = bind.get(t.v);
			const m = s.match(/-?\d+/);
			return {
				q: m ? Q.fromDecimal(Number(m[0])) : null,
				s
			};
		}
		const info = attrByName(env, t.v);
		if (info) {
			const mem = idx.length ? idx : implicitMembers({
				env,
				bind
			}, t.v, t.line);
			return {
				q: info.data.get(keyOf(mem)) ?? null,
				s: keyOf(mem)
			};
		}
		const s = t.v;
		const n = Number(s);
		return {
			q: Number.isFinite(n) ? Q.fromDecimal(n) : null,
			s
		};
	}
	throw {
		line: t?.line ?? 0,
		message: "Valor de condición no válido"
	};
}
function cmpQ(op, a, b) {
	if (a.q && b.q) {
		const c = a.q.cmp(b.q);
		if (op === "#EQ#" || op === "=") return c === 0;
		if (op === "#NE#") return c !== 0;
		if (op === "#GT#") return c > 0;
		if (op === "#GE#") return c >= 0;
		if (op === "#LT#") return c < 0;
		if (op === "#LE#") return c <= 0;
	}
	const c = a.s < b.s ? -1 : a.s > b.s ? 1 : 0;
	if (op === "#EQ#" || op === "=") return c === 0;
	if (op === "#NE#") return c !== 0;
	if (op === "#GT#") return c > 0;
	if (op === "#GE#") return c >= 0;
	if (op === "#LT#") return c < 0;
	if (op === "#LE#") return c <= 0;
	return true;
}
function parseCondition(toks, i, env) {
	const start = i.n;
	let depth = 0;
	while (i.n < toks.length) {
		const t = toks[i.n];
		if (!t || t.kind === "eof") break;
		if (t.kind === "op" && t.v === "(") depth++;
		if (t.kind === "op" && t.v === ")" && depth === 0) break;
		if (t.kind === "op" && t.v === ")" && depth > 0) depth--;
		if (t.kind === "op" && t.v === ":" && depth === 0) break;
		i.n++;
	}
	i.n;
	return (bind) => {
		const j = { n: start };
		skipWs(toks, j);
		const left = condValue(toks, j, env, bind);
		skipWs(toks, j);
		const op = toks[j.n];
		if (!op || op.kind !== "op") return true;
		j.n++;
		const right = condValue(toks, j, env, bind);
		return cmpQ(op.v.toUpperCase(), left, right);
	};
}
function parseRefName(toks, i, ctx) {
	skipWs(toks, i);
	const t = toks[i.n];
	if (t?.kind !== "name") throw {
		line: t?.line ?? 0,
		message: "Se esperaba un nombre"
	};
	i.n++;
	const idx = toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, ctx.bind) : [];
	const info = attrByName(ctx.env, t.v);
	if (info) {
		const set = setByName(ctx.env, info.setName);
		if (idx.length) return [flattenName(attrKey(ctx.env, t.v) ?? t.v, idx)];
		if (ctx.bind.size) {
			const mem = implicitMembers(ctx, t.v, t.line);
			return [flattenName(attrKey(ctx.env, t.v) ?? t.v, mem)];
		}
		return set.members.map((m) => flattenName(attrKey(ctx.env, t.v) ?? t.v, m));
	}
	return [t.v];
}
function splitConstraint(lhs, rhs, rel) {
	const terms = new Map(lhs.terms);
	rhs.terms.forEach((q, n) => terms.set(n, (terms.get(n) ?? Q.ZERO).sub(q)));
	return {
		terms,
		rhs: rhs.k.sub(lhs.k),
		relation: rel
	};
}
function parseFor(toks, i, ctx, conList, types, free, bounds) {
	const t = toks[i.n];
	i.n++;
	skipWs(toks, i);
	if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) throw {
		line: t.line,
		message: "@FOR espera ("
	};
	i.n++;
	const head = parseSetHead(toks, i, ctx.env, t.line);
	const bodyStart = i.n;
	let depth = 1;
	let k = bodyStart;
	for (; k < toks.length; k++) {
		const tk = toks[k];
		if (tk.kind === "op" && tk.v === "(") depth++;
		else if (tk.kind === "op" && tk.v === ")") {
			depth--;
			if (depth === 0) break;
		}
	}
	if (depth !== 0) throw {
		line: t.line,
		message: "Falta ) de cierre en @FOR"
	};
	const bodyEnd = k;
	const parseBody = (bind) => {
		const j = { n: bodyStart };
		const inner = {
			env: ctx.env,
			bind
		};
		while (j.n < bodyEnd) {
			skipWs(toks, j);
			if (j.n >= bodyEnd) break;
			if (toks[j.n]?.kind === "op" && toks[j.n].v === ";") {
				j.n++;
				continue;
			}
			if (toks[j.n]?.kind === "dir" && toks[j.n].v === "@FOR") {
				parseFor(toks, j, inner, conList, types, free, bounds);
				continue;
			}
			if (toks[j.n]?.kind === "dir" && toks[j.n].v !== "@SUM" && toks[j.n].v !== "@SIZE") {
				const dir = toks[j.n].v;
				const dline = toks[j.n].line;
				j.n++;
				skipWs(toks, j);
				if (toks[j.n]?.kind === "op" && toks[j.n].v === "(") j.n++;
				if (dir === "@GIN" || dir === "@INT" || dir === "@BIN" || dir === "@FREE") {
					const names = parseRefName(toks, j, inner);
					for (const n of names) if (dir === "@BIN") types.set(n, "binary");
					else if (dir === "@FREE") free.add(n);
					else types.set(n, "integer");
				} else if (dir === "@BND") {
					const loE = parseExpr(toks, j, inner);
					skipWs(toks, j);
					if (toks[j.n]?.kind === "op" && toks[j.n].v === ",") j.n++;
					const names = parseRefName(toks, j, inner);
					skipWs(toks, j);
					if (toks[j.n]?.kind === "op" && toks[j.n].v === ",") j.n++;
					const hiE = parseExpr(toks, j, inner);
					for (const n of names) bounds.set(n, {
						lo: loE.k.toNumber(),
						hi: hiE.k.toNumber()
					});
				} else throw {
					line: dline,
					message: `Directiva ${dir} no soportada en @FOR`
				};
				skipWs(toks, j);
				if (toks[j.n]?.kind === "op" && toks[j.n].v === ")") j.n++;
				continue;
			}
			let cname = `${head.set.name}_${[...bind.values()].join("_")}`;
			if (toks[j.n]?.kind === "op" && toks[j.n].v === "[") {
				j.n++;
				cname = toks[j.n]?.v ?? cname;
				j.n++;
				if (toks[j.n]?.kind === "op" && toks[j.n].v === "]") j.n++;
			} else if (toks[j.n]?.kind === "name" && toks[j.n + 1]?.kind === "op" && toks[j.n + 1].v === ")") {
				cname = `${toks[j.n].v}_${[...bind.values()].join("_")}`;
				j.n += 2;
			}
			const lhs = parseExpr(toks, j, inner);
			skipWs(toks, j);
			const relT = toks[j.n];
			if (!relT || relT.kind !== "op" || relT.v !== "<=" && relT.v !== ">=" && relT.v !== "=") throw {
				line: toks[bodyStart]?.line ?? t.line,
				message: "Se esperaba una restricción con <=, >= o = dentro de @FOR"
			};
			j.n++;
			const split = splitConstraint(lhs, parseExpr(toks, j, inner), relT.v);
			if (conList.some((c) => c.name === cname)) cname = `${cname}_${conList.length + 1}`;
			conList.push({
				name: cname,
				terms: split.terms,
				relation: split.relation,
				rhs: split.rhs
			});
		}
	};
	for (const mem of head.set.members) {
		const bind = mergeBind(ctx.bind, bindMember(head.indices, mem));
		if (head.cond && !head.cond(bind)) continue;
		parseBody(bind);
	}
	i.n = bodyEnd + 1;
	eatSemi(toks, i);
}
function skipEols(toks, i) {
	while (toks[i.n]?.kind === "eol") i.n++;
}
function eatSemi(toks, i) {
	if (toks[i.n]?.kind === "op" && toks[i.n].v === ";") i.n++;
	skipEols(toks, i);
}
function parseLingo(src, existing) {
	const errors = [];
	let toks;
	try {
		toks = tokenize(src);
	} catch (e) {
		return {
			model: null,
			errors: [e]
		};
	}
	let sense = "max";
	let title = existing?.name ?? "Modelo LINGO";
	const objTerms = /* @__PURE__ */ new Map();
	const conList = [];
	const types = /* @__PURE__ */ new Map();
	const free = /* @__PURE__ */ new Set();
	const bounds = /* @__PURE__ */ new Map();
	let sawObj = false;
	const env = {
		sets: /* @__PURE__ */ new Map(),
		attrs: /* @__PURE__ */ new Map()
	};
	const ctx = {
		env,
		bind: /* @__PURE__ */ new Map()
	};
	const i = { n: 0 };
	const ensureVar = (name) => {
		if (RESERVED.has(name.toUpperCase())) throw {
			line: toks[i.n]?.line ?? 0,
			message: `"${name}" es una palabra reservada`
		};
	};
	try {
		while (i.n < toks.length) {
			skipEols(toks, i);
			const t = toks[i.n];
			if (!t || t.kind === "eof") break;
			if (t.kind === "name" && t.v.toUpperCase() === "MODEL") {
				i.n++;
				if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
				skipEols(toks, i);
				continue;
			}
			if (t.kind === "name" && t.v.toUpperCase() === "END") break;
			if (t.kind === "name" && t.v.toUpperCase() === "TITLE") {
				i.n++;
				const rest = [];
				while (toks[i.n] && toks[i.n].kind !== "eol" && !(toks[i.n].kind === "op" && toks[i.n].v === ";")) {
					rest.push(toks[i.n].v);
					i.n++;
				}
				title = rest.join(" ").replace(/;$/, "").trim() || title;
				eatSemi(toks, i);
				continue;
			}
			if (t.kind === "name" && t.v.toUpperCase() === "SETS") {
				i.n++;
				parseSetsSection(toks, i, env);
				continue;
			}
			if (t.kind === "name" && t.v.toUpperCase() === "DATA") {
				i.n++;
				parseDataSection(toks, i, env);
				continue;
			}
			if (t.kind === "dir" && t.v === "@FOR") {
				parseFor(toks, i, ctx, conList, types, free, bounds);
				continue;
			}
			if (t.kind === "dir" && t.v !== "@SUM" && t.v !== "@SIZE") {
				const dir = t.v;
				i.n++;
				if (toks[i.n]?.kind === "op" && toks[i.n].v === "(") i.n++;
				if (dir === "@GIN" || dir === "@INT" || dir === "@BIN" || dir === "@FREE") {
					const names = parseRefName(toks, i, ctx);
					for (const n of names) if (dir === "@BIN") types.set(n, "binary");
					else if (dir === "@FREE") free.add(n);
					else types.set(n, "integer");
				} else if (dir === "@BND") {
					toks[i.n];
					const loE = parseExpr(toks, i, ctx);
					if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") i.n++;
					const names = parseRefName(toks, i, ctx);
					if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") i.n++;
					const hiE = parseExpr(toks, i, ctx);
					for (const n of names) bounds.set(n, {
						lo: loE.k.toNumber(),
						hi: hiE.k.toNumber()
					});
				} else throw {
					line: t.line,
					message: `Directiva ${dir} no soportada`
				};
				if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
				eatSemi(toks, i);
				continue;
			}
			if (t.kind === "op" && t.v === "[") {
				const nm = toks[i.n + 1];
				const close = toks[i.n + 2];
				const kw = toks[i.n + 3];
				if (nm?.kind === "name" && close?.kind === "op" && close.v === "]" && kw?.kind === "name") {
					const k = kw.v.toUpperCase();
					if (k === "MAX" || k === "MIN" || k === "MAXIMIZE" || k === "MINIMIZE") i.n += 3;
				}
			} else if (t.kind === "name" && toks[i.n + 1]?.kind === "op" && toks[i.n + 1].v === ")") {
				const kw = toks[i.n + 2];
				if (kw?.kind === "name") {
					const k = kw.v.toUpperCase();
					if (k === "MAX" || k === "MIN" || k === "MAXIMIZE" || k === "MINIMIZE") i.n += 2;
				}
			}
			const t2 = toks[i.n];
			const up2 = t2?.kind === "name" ? t2.v.toUpperCase() : "";
			if (up2 === "MAX" || up2 === "MIN" || up2 === "MAXIMIZE" || up2 === "MINIMIZE") {
				sense = up2.startsWith("MIN") ? "min" : "max";
				i.n++;
				if (toks[i.n]?.kind === "op" && toks[i.n].v === "=") i.n++;
				else if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
				const expr = parseExpr(toks, i, ctx);
				if (!expr.k.isZero()) errors.push({
					line: t2.line,
					message: "La función objetivo no puede tener un término constante (se ignora)."
				});
				objTerms.clear();
				expr.terms.forEach((q, n) => {
					ensureVar(n);
					objTerms.set(n, q);
				});
				sawObj = true;
				eatSemi(toks, i);
				continue;
			}
			let cname = `R${conList.length + 1}`;
			const tCon = toks[i.n];
			if (tCon.kind === "op" && tCon.v === "[") {
				i.n++;
				cname = toks[i.n++].v;
				if (toks[i.n]?.kind === "op" && toks[i.n].v === "]") i.n++;
			} else if (tCon.kind === "name" && toks[i.n + 1]?.kind === "op" && toks[i.n + 1].v === ")") {
				cname = tCon.v;
				i.n += 2;
			}
			const lhs = parseExpr(toks, i, ctx);
			const relT = toks[i.n];
			if (!relT || relT.kind !== "op" || relT.v !== "<=" && relT.v !== ">=" && relT.v !== "=") throw {
				line: tCon.line,
				message: "Se esperaba una restricción con <=, >= o ="
			};
			i.n++;
			const rhs = parseExpr(toks, i, ctx);
			const terms = new Map(lhs.terms);
			rhs.terms.forEach((q, n) => {
				terms.set(n, (terms.get(n) ?? Q.ZERO).sub(q));
			});
			const rhsVal = rhs.k.sub(lhs.k);
			terms.forEach((_, n) => ensureVar(n));
			conList.push({
				name: cname,
				terms,
				relation: relT.v,
				rhs: rhsVal
			});
			eatSemi(toks, i);
		}
	} catch (e) {
		const err = e;
		errors.push({
			line: err.line ?? 0,
			message: err.message ?? "Error de sintaxis"
		});
		return {
			model: null,
			errors
		};
	}
	if (!sawObj) {
		errors.push({
			line: 1,
			message: "Falta la función objetivo (MAX = … o MIN = …)."
		});
		return {
			model: null,
			errors
		};
	}
	const names = /* @__PURE__ */ new Set();
	objTerms.forEach((_, n) => names.add(n));
	conList.forEach((c) => c.terms.forEach((_, n) => names.add(n)));
	types.forEach((_, n) => names.add(n));
	free.forEach((n) => names.add(n));
	bounds.forEach((_, n) => names.add(n));
	const variables = [...names].map((name) => {
		const b = bounds.get(name);
		const isFree = free.has(name);
		const type = types.get(name) ?? "continuous";
		return {
			id: uid("v"),
			name,
			type,
			lower: isFree ? null : b?.lo ?? 0,
			upper: type === "binary" ? 1 : b?.hi ?? null,
			free: isFree
		};
	});
	const byName = new Map(variables.map((v) => [v.name, v]));
	const objective = {};
	objTerms.forEach((q, n) => {
		const v = byName.get(n);
		if (v) objective[v.id] = q.toNumber();
	});
	const constraints = conList.filter((c) => {
		if (c.terms.size === 1) {
			const [n, q] = [...c.terms][0];
			const v = byName.get(n);
			if (v && q.eq(Q.ONE) && c.relation === ">=" && c.rhs.isZero() && (v.lower ?? 0) === 0) return false;
		}
		return true;
	}).map((c) => {
		const coeffs = {};
		c.terms.forEach((q, n) => {
			const v = byName.get(n);
			if (v && !q.isZero()) coeffs[v.id] = q.toNumber();
		});
		return {
			id: uid("c"),
			name: c.name,
			coeffs,
			relation: c.relation,
			rhs: c.rhs.toNumber()
		};
	});
	return {
		model: {
			id: existing?.id ?? uid("m"),
			name: title,
			description: existing?.description ?? "",
			sense,
			objective,
			variables,
			constraints,
			lingoSource: src,
			updatedAt: Date.now(),
			exampleId: existing?.exampleId
		},
		errors
	};
}
function toLingo(model) {
	const lines = [];
	lines.push("MODEL:");
	if (model.name) lines.push(`TITLE ${model.name};`);
	if (model.description) for (const d of model.description.split("\n")) {
		const t = d.trim();
		if (t) lines.push(`! ${t}`);
	}
	const term = (id, coef, first) => {
		const v = model.variables.find((x) => x.id === id);
		if (!v || coef === 0) return "";
		const abs = Q.fromDecimal(Math.abs(coef)).toDecimal(6);
		const glued = abs === "1" ? v.name : `${abs}${v.name}`;
		if (first) return coef < 0 ? `-${glued}` : glued;
		return coef < 0 ? ` - ${glued}` : ` + ${glued}`;
	};
	const sense = model.sense === "max" ? "MAX" : "MIN";
	const objParts = [];
	let first = true;
	for (const v of model.variables) {
		const c = model.objective[v.id] ?? 0;
		const p = term(v.id, c, first);
		if (p) {
			objParts.push(p);
			first = false;
		}
	}
	lines.push(`${sense} = ${objParts.join("") || "0"};`);
	lines.push("");
	for (const c of model.constraints) {
		const parts = [];
		let f = true;
		for (const v of model.variables) {
			const a = c.coeffs[v.id] ?? 0;
			const p = term(v.id, a, f);
			if (p) {
				parts.push(p);
				f = false;
			}
		}
		const rhs = Q.fromDecimal(c.rhs).toDecimal(6);
		lines.push(`${c.name}) ${parts.join("") || "0"} ${c.relation} ${rhs};`);
	}
	const dirs = [];
	for (const v of model.variables) {
		if (v.type === "integer") dirs.push(`@GIN(${v.name});`);
		if (v.type === "binary") dirs.push(`@BIN(${v.name});`);
		if (v.free) dirs.push(`@FREE(${v.name});`);
		else if ((v.lower ?? 0) !== 0 || v.upper !== null) {
			const lo = v.lower ?? 0;
			const hi = v.upper ?? 1e9;
			if (v.upper !== null) dirs.push(`@BND(${lo}, ${v.name}, ${hi});`);
		}
	}
	if (dirs.length) {
		lines.push("");
		lines.push(...dirs);
	}
	lines.push("END");
	return lines.join("\n");
}
function v(name, extra) {
	return {
		id: uid("v"),
		name,
		type: "continuous",
		lower: 0,
		upper: null,
		...extra
	};
}
function pack(name, description, sense, vars, obj, cons) {
	const objective = {};
	vars.forEach((vr, i) => {
		objective[vr.id] = obj[i] ?? 0;
	});
	const model = {
		id: uid("m"),
		name,
		description,
		sense,
		objective,
		variables: vars,
		constraints: cons.map((c) => {
			const coeffs = {};
			vars.forEach((vr, i) => {
				if (c.a[i]) coeffs[vr.id] = c.a[i];
			});
			return {
				id: uid("c"),
				name: c.name,
				coeffs,
				relation: c.rel,
				rhs: c.rhs
			};
		}),
		lingoSource: "",
		updatedAt: Date.now(),
		exampleId: name
	};
	model.lingoSource = toLingo(model);
	return model;
}
function fromSets(name, src) {
	const r = parseLingo(src);
	if (!r.model) throw new Error(r.errors.map((e) => e.message).join("; ") || "SETS parse");
	return {
		...r.model,
		name,
		exampleId: name,
		description: "",
		lingoSource: src.trim() + "\n"
	};
}
var EXAMPLES = [
	{
		id: "estampado",
		name: "Estampado Soldado Pintado",
		topic: "Mezcla de producción",
		blurb: "Dos productos y tres procesos. Maximizar utilidad. Sirve para el gráfico y el simplex.",
		vars: 2,
		graphic: true,
		build: () => pack("Estampado Soldado Pintado", "Maximizar la utilidad z = 4X1 + 3X2. Estampado, soldado y pintado limitan las horas. X3, X4 y X5 son los sobrantes de cada proceso.", "max", [v("X1"), v("X2")], [4, 3], [
			{
				name: "EST",
				a: [6, 16],
				rel: "<=",
				rhs: 48e3
			},
			{
				name: "SOL",
				a: [12, 6],
				rel: "<=",
				rhs: 42e3
			},
			{
				name: "PIN",
				a: [9, 9],
				rel: "<=",
				rhs: 36e3
			}
		])
	},
	{
		id: "mesas",
		name: "Mesas y sillas",
		topic: "Mezcla de producción",
		blurb: "Clásico de 2 variables. Ideal para el método gráfico y la tabla simplex.",
		vars: 2,
		graphic: true,
		build: () => pack("Mesas y sillas", "Una carpintería fabrica mesas y sillas. Cada mesa deja $20 de ganancia y cada silla $15. Hay 100 hs de carpintería y 80 hs de acabado.", "max", [v("Mesas"), v("Sillas")], [20, 15], [{
			name: "Carpinteria",
			a: [2, 1],
			rel: "<=",
			rhs: 100
		}, {
			name: "Acabado",
			a: [1, 2],
			rel: "<=",
			rhs: 80
		}])
	},
	{
		id: "hillier",
		name: "Wyndor Glass",
		topic: "Producción",
		blurb: "El ejemplo de Hillier: 3 plantas, 2 productos. Óptimo (2, 6) con z = 36.",
		vars: 2,
		graphic: true,
		build: () => pack("Wyndor Glass", "Productos: puertas de vidrio (x1) y ventanas (x2). Ganancias 3 y 5. Capacidades de las plantas 1, 2 y 3.", "max", [v("Puertas"), v("Ventanas")], [3, 5], [
			{
				name: "Planta1",
				a: [1, 0],
				rel: "<=",
				rhs: 4
			},
			{
				name: "Planta2",
				a: [0, 2],
				rel: "<=",
				rhs: 12
			},
			{
				name: "Planta3",
				a: [3, 2],
				rel: "<=",
				rhs: 18
			}
		])
	},
	{
		id: "dieta",
		name: "Problema de la dieta",
		topic: "Dieta / mezcla",
		blurb: "Minimizar el costo de una dieta que cubre requerimientos nutricionales.",
		vars: 2,
		graphic: true,
		build: () => pack("Dieta", "Alimento A cuesta $2 y B cuesta $3. Se necesitan al menos 12 u. de proteína, 8 de calcio y 10 de vitaminas.", "min", [v("AlimA"), v("AlimB")], [2, 3], [
			{
				name: "Proteina",
				a: [2, 1],
				rel: ">=",
				rhs: 12
			},
			{
				name: "Calcio",
				a: [1, 2],
				rel: ">=",
				rhs: 8
			},
			{
				name: "Vitaminas",
				a: [1, 1],
				rel: ">=",
				rhs: 10
			}
		])
	},
	{
		id: "publicidad",
		name: "Mix de publicidad",
		topic: "Marketing",
		blurb: "Asignar presupuesto entre TV y redes con cupos de audiencia.",
		vars: 2,
		graphic: true,
		build: () => pack("Mix de publicidad", "Cada aviso de TV llega a 30 mil personas ($8) y cada posteo a 10 mil ($3). Presupuesto $120. Máximo 10 avisos de TV.", "max", [v("TV"), v("Redes")], [30, 10], [
			{
				name: "Presupuesto",
				a: [8, 3],
				rel: "<=",
				rhs: 120
			},
			{
				name: "CupoTV",
				a: [1, 0],
				rel: "<=",
				rhs: 10
			},
			{
				name: "MinRedes",
				a: [0, 1],
				rel: ">=",
				rhs: 4
			}
		])
	},
	{
		id: "transporte",
		name: "Transporte 2×2",
		topic: "Transporte",
		blurb: "Dos orígenes y dos destinos. Minimizar el costo de envío.",
		vars: 4,
		build: () => {
			return pack("Transporte 2×2", "Fábricas F1 (oferta 20) y F2 (oferta 25). Clientes C1 (demanda 15) y C2 (demanda 30). Costos 4, 7, 6 y 3.", "min", [
				v("F1C1"),
				v("F1C2"),
				v("F2C1"),
				v("F2C2")
			], [
				4,
				7,
				6,
				3
			], [
				{
					name: "OfertaF1",
					a: [
						1,
						1,
						0,
						0
					],
					rel: "<=",
					rhs: 20
				},
				{
					name: "OfertaF2",
					a: [
						0,
						0,
						1,
						1
					],
					rel: "<=",
					rhs: 25
				},
				{
					name: "DemandaC1",
					a: [
						1,
						0,
						1,
						0
					],
					rel: ">=",
					rhs: 15
				},
				{
					name: "DemandaC2",
					a: [
						0,
						1,
						0,
						1
					],
					rel: ">=",
					rhs: 30
				}
			]);
		}
	},
	{
		id: "mezcla",
		name: "Mezcla de naftas",
		topic: "Blending",
		blurb: "Mezclar crudos para obtener nafta regular y premium.",
		vars: 4,
		build: () => pack("Mezcla de naftas", "Crudo A y B se mezclan en Regular y Premium. Márgenes 9 y 15. Disponibilidad A=5000, B=6000. Demanda mín. Regular 4000, Premium 3000.", "max", [
			v("A_Reg"),
			v("A_Pre"),
			v("B_Reg"),
			v("B_Pre")
		], [
			9,
			15,
			9,
			15
		], [
			{
				name: "DispA",
				a: [
					1,
					1,
					0,
					0
				],
				rel: "<=",
				rhs: 5e3
			},
			{
				name: "DispB",
				a: [
					0,
					0,
					1,
					1
				],
				rel: "<=",
				rhs: 6e3
			},
			{
				name: "MinReg",
				a: [
					1,
					0,
					1,
					0
				],
				rel: ">=",
				rhs: 4e3
			},
			{
				name: "MinPre",
				a: [
					0,
					1,
					0,
					1
				],
				rel: ">=",
				rhs: 3e3
			}
		])
	},
	{
		id: "mochila",
		name: "Mochila (entera)",
		topic: "Entera / knapsack",
		blurb: "Elegir proyectos 0-1 con presupuesto limitado. Usa @BIN.",
		vars: 4,
		integer: true,
		build: () => pack("Selección de proyectos", "Cuatro proyectos binarios. Beneficios 16, 22, 12, 8. Costos 5, 7, 4, 3. Presupuesto 14.", "max", [
			v("P1", {
				type: "binary",
				upper: 1
			}),
			v("P2", {
				type: "binary",
				upper: 1
			}),
			v("P3", {
				type: "binary",
				upper: 1
			}),
			v("P4", {
				type: "binary",
				upper: 1
			})
		], [
			16,
			22,
			12,
			8
		], [{
			name: "Presupuesto",
			a: [
				5,
				7,
				4,
				3
			],
			rel: "<=",
			rhs: 14
		}])
	},
	{
		id: "turnos",
		name: "Turnos de personal",
		topic: "Programación de personal",
		blurb: "Cubrir demanda por franja con turnos de 8 horas. Variables enteras.",
		vars: 4,
		integer: true,
		build: () => pack("Turnos de personal", "Turnos que empiezan a las 0, 6, 12 y 18 hs. Cada turno cubre 8 hs. Demandas 4, 8, 10 y 6. Minimizar cabezas.", "min", [
			v("T0", { type: "integer" }),
			v("T6", { type: "integer" }),
			v("T12", { type: "integer" }),
			v("T18", { type: "integer" })
		], [
			1,
			1,
			1,
			1
		], [
			{
				name: "Franja0_6",
				a: [
					1,
					0,
					0,
					1
				],
				rel: ">=",
				rhs: 4
			},
			{
				name: "Franja6_12",
				a: [
					1,
					1,
					0,
					0
				],
				rel: ">=",
				rhs: 8
			},
			{
				name: "Franja12_18",
				a: [
					0,
					1,
					1,
					0
				],
				rel: ">=",
				rhs: 10
			},
			{
				name: "Franja18_24",
				a: [
					0,
					0,
					1,
					1
				],
				rel: ">=",
				rhs: 6
			}
		])
	},
	{
		id: "inversion",
		name: "Inversión de capital",
		topic: "Entera binaria",
		blurb: "Elegir un portafolio de inversiones con capital y riesgo.",
		vars: 5,
		integer: true,
		build: () => pack("Inversión de capital", "Cinco inversiones 0-1. NPVs 12, 8, 15, 6, 10. Capital 20, 12, 28, 10, 18. Presupuesto 40. Máximo riesgo 25 (3, 2, 5, 1, 4).", "max", [
			v("I1", {
				type: "binary",
				upper: 1
			}),
			v("I2", {
				type: "binary",
				upper: 1
			}),
			v("I3", {
				type: "binary",
				upper: 1
			}),
			v("I4", {
				type: "binary",
				upper: 1
			}),
			v("I5", {
				type: "binary",
				upper: 1
			})
		], [
			12,
			8,
			15,
			6,
			10
		], [{
			name: "Capital",
			a: [
				20,
				12,
				28,
				10,
				18
			],
			rel: "<=",
			rhs: 40
		}, {
			name: "Riesgo",
			a: [
				3,
				2,
				5,
				1,
				4
			],
			rel: "<=",
			rhs: 25
		}])
	},
	{
		id: "corte",
		name: "Corte de rollos",
		topic: "Cutting stock",
		blurb: "Patrones de corte enteros para satisfacer pedidos con el mínimo de rollos.",
		vars: 3,
		integer: true,
		build: () => pack("Corte de rollos", "Rollo de 100 cm. Pedidos: 45 cm × 50, 30 cm × 70, 20 cm × 60. Patrones: (2,0,0), (1,1,1), (0,2,2). Minimizar rollos.", "min", [
			v("PatA", { type: "integer" }),
			v("PatB", { type: "integer" }),
			v("PatC", { type: "integer" })
		], [
			1,
			1,
			1
		], [
			{
				name: "Pedido45",
				a: [
					2,
					1,
					0
				],
				rel: ">=",
				rhs: 50
			},
			{
				name: "Pedido30",
				a: [
					0,
					1,
					2
				],
				rel: ">=",
				rhs: 70
			},
			{
				name: "Pedido20",
				a: [
					0,
					1,
					2
				],
				rel: ">=",
				rhs: 60
			}
		])
	},
	{
		id: "sets-prod",
		name: "SETS: 5 productos",
		topic: "Lenguaje LINGO",
		blurb: "SETS, DATA, @SUM y @FOR con índices P1..P5. Plantilla para copiar y editar.",
		vars: 5,
		build: () => fromSets("SETS: 5 productos", `
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
`)
	},
	{
		id: "sets-trans",
		name: "SETS: transporte",
		topic: "Lenguaje LINGO",
		blurb: "Conjuntos derivados ORIGEN×DESTINO, @FOR y @SUM sobre rutas.",
		vars: 4,
		build: () => fromSets("SETS: transporte", `
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
`)
	}
];
var ZERO = Q.ZERO;
var ONE = Q.ONE;
function coeff(map, id) {
	const v = map[id];
	if (v === void 0 || v === null || Number.isNaN(v)) return ZERO;
	return Q.fromDecimal(v);
}
function build(model) {
	const vars = model.variables.map((v) => ({ ...v }));
	const cons = model.constraints.map((c) => ({
		...c,
		coeffs: { ...c.coeffs }
	}));
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
	const names = [];
	const origMap = [];
	const splitNeg = [];
	const varTypes = [];
	vars.forEach((v, i) => {
		origMap[i] = names.length;
		names.push(v.name);
		varTypes.push(v.type);
		if (v.free || v.lower !== 0 && v.lower !== null && v.lower !== void 0) {}
		if (v.free) {
			splitNeg[i] = names.length;
			names.push(v.name + "⁻");
			varTypes.push("continuous");
		} else splitNeg[i] = -1;
	});
	const origN = names.length;
	vars.forEach((v) => {
		if (v.free) return;
		const L = v.lower ?? 0;
		if (L !== 0) cons.push({
			id: `lb-${v.id}`,
			name: `${v.name}≥${L}`,
			coeffs: { [v.id]: 1 },
			relation: ">=",
			rhs: L
		});
		if (v.upper !== null && v.upper !== void 0) cons.push({
			id: `ub-${v.id}`,
			name: `${v.name}≤${v.upper}`,
			coeffs: { [v.id]: 1 },
			relation: "<=",
			rhs: v.upper
		});
	});
	const m = cons.length;
	const A0 = [];
	const b = [];
	const relations = [];
	const conNames = [];
	for (let i = 0; i < m; i++) {
		const row = Array.from({ length: origN }, () => ZERO);
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
	for (let i = 0; i < m; i++) if (b[i].isNegative()) {
		b[i] = b[i].neg();
		A0[i] = A0[i].map((x) => x.neg());
		relations[i] = relations[i] === "<=" ? ">=" : relations[i] === ">=" ? "<=" : "=";
	}
	const slackCol = Array(m).fill(-1);
	const artCol = Array(m).fill(-1);
	const artCols = [];
	const A = A0.map((r) => r.slice());
	let n = origN;
	const kinds = Array.from({ length: origN }, () => "var");
	const addCol = (name, column, kind) => {
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
			const col = Array.from({ length: m }, (_, r) => r === i ? ONE : ZERO);
			slackCol[i] = addCol(`h_${tag}`, col, "slack");
		} else if (relations[i] === ">=") {
			const sur = Array.from({ length: m }, (_, r) => r === i ? Q.NEG_ONE : ZERO);
			slackCol[i] = addCol(`e_${tag}`, sur, "surplus");
			const art = Array.from({ length: m }, (_, r) => r === i ? ONE : ZERO);
			const ac = addCol(`a_${tag}`, art, "art");
			artCols.push(ac);
			artCol[i] = ac;
		} else {
			const art = Array.from({ length: m }, (_, r) => r === i ? ONE : ZERO);
			const ac = addCol(`a_${tag}`, art, "art");
			artCols.push(ac);
			artCol[i] = ac;
		}
	}
	const c = Array.from({ length: n }, () => ZERO);
	const cOrig = Array.from({ length: n }, () => ZERO);
	vars.forEach((v, vi) => {
		const cj = coeff(model.objective, v.id);
		const signed = model.sense === "max" ? cj : cj.neg();
		c[origMap[vi]] = signed;
		cOrig[origMap[vi]] = cj;
		if (splitNeg[vi] >= 0) c[splitNeg[vi]] = signed.neg();
	});
	const intIdx = [];
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
		sense: model.sense
	};
}
function primalZ(t) {
	let z = ZERO;
	for (let i = 0; i < t.m; i++) {
		const j = t.basis[i];
		const cj = t.cOrig[j] ?? ZERO;
		z = z.add(cj.mul(t.M[i + 1][t.n]));
	}
	return z;
}
function snapshot(t, extra) {
	const matrix = t.M.map((row) => row.map((x) => x.toFraction()));
	return {
		labels: [...t.names, "LD"],
		kinds: t.kinds.slice(),
		cj: t.cOrig.map((q) => q.toFraction()),
		z: primalZ(t).toFraction(),
		basis: t.basis.map((j) => t.names[j] ?? `x${j}`),
		matrix,
		...extra
	};
}
function pivot(t, row, col) {
	const piv = t.M[row][col];
	if (piv.isZero()) throw new Error("Pivote nulo");
	const width = t.n + 1;
	for (let j = 0; j < width; j++) t.M[row][j] = t.M[row][j].div(piv);
	for (let i = 0; i <= t.m; i++) {
		if (i === row) continue;
		const f = t.M[i][col];
		if (f.isZero()) continue;
		for (let j = 0; j < width; j++) t.M[i][j] = t.M[i][j].sub(f.mul(t.M[row][j]));
	}
	t.basis[row - 1] = col;
}
function minRatio(t, col) {
	let bestRow = -1;
	let bestRatio = null;
	let bestBasis = Infinity;
	for (let i = 1; i <= t.m; i++) {
		const a = t.M[i][col];
		if (!a.isPositive()) continue;
		const ratio = t.M[i][t.n].div(a);
		const bidx = t.basis[i - 1];
		if (bestRatio === null || ratio.cmp(bestRatio) < 0 || ratio.eq(bestRatio) && bidx < bestBasis) {
			bestRatio = ratio;
			bestRow = i;
			bestBasis = bidx;
		}
	}
	return bestRow;
}
function entering(t, artSet) {
	let best = -1;
	let bestVal = null;
	for (let j = 0; j < t.n; j++) {
		if (artSet.has(j)) continue;
		if (t.basis.includes(j)) continue;
		const v = t.M[0][j];
		if (!v.isNegative()) continue;
		if (bestVal === null || v.cmp(bestVal) < 0 || v.eq(bestVal) && j < best) {
			bestVal = v;
			best = j;
		}
	}
	return best;
}
function solveTableau(t, artSet, snaps, phase, startIter, keepSnaps, maxIter = 400) {
	let iter = startIter;
	if (keepSnaps) snaps.push(snapshot(t, {
		phase,
		iteration: iter,
		note: `Inicio fase ${phase}`
	}));
	for (;;) {
		if (iter - startIter > maxIter) throw new Error("Límite de iteraciones del simplex");
		const col = entering(t, artSet);
		if (col < 0) return {
			status: "optimal",
			iterations: iter
		};
		const row = minRatio(t, col);
		if (row < 0) return {
			status: "unbounded",
			iterations: iter
		};
		const leaving = t.names[t.basis[row - 1]] ?? "?";
		pivot(t, row, col);
		iter++;
		if (keepSnaps) snaps.push(snapshot(t, {
			phase,
			iteration: iter,
			entering: t.names[col],
			leaving,
			note: `Entra ${t.names[col]}, sale ${leaving}`
		}));
	}
}
function twoPhase(built, keepSnaps) {
	const { A, b, c, names, artCols } = built;
	const m = A.length;
	const n = names.length;
	const M = [];
	M.push(Array.from({ length: n + 1 }, () => ZERO));
	for (let i = 0; i < m; i++) M.push([...A[i], b[i]]);
	const basis = [];
	const used = /* @__PURE__ */ new Set();
	for (let i = 0; i < m; i++) {
		let col = -1;
		if (built.slackCol[i] >= 0 && built.relations[i] === "<=") col = built.slackCol[i];
		else col = artCols.find((a) => !used.has(a) && !A[i][a].isZero()) ?? -1;
		if (col < 0) throw new Error("No se pudo armar una base inicial");
		used.add(col);
		basis.push(col);
	}
	const t = {
		M,
		basis,
		names: names.slice(),
		kinds: built.kinds.slice(),
		cOrig: built.cOrig.slice(),
		n,
		m
	};
	const artSet = new Set(artCols);
	const snaps = [];
	const needPhase1 = artCols.length > 0;
	let iterations = 0;
	if (needPhase1) {
		for (let j = 0; j <= n; j++) t.M[0][j] = ZERO;
		for (const a of artCols) t.M[0][a] = ONE;
		for (const a of artCols) {
			const r = t.basis.findIndex((bidx) => bidx === a) + 1;
			if (r <= 0) continue;
			const f = t.M[0][a];
			if (f.isZero()) continue;
			for (let j = 0; j <= n; j++) t.M[0][j] = t.M[0][j].sub(f.mul(t.M[r][j]));
		}
		const p1 = solveTableau(t, /* @__PURE__ */ new Set(), snaps, 1, 0, keepSnaps);
		iterations = p1.iterations;
		if (p1.status === "unbounded") return {
			status: "infeasible",
			t,
			snaps,
			iterations
		};
		if (t.M[0][n].isNegative()) return {
			status: "infeasible",
			t,
			snaps,
			iterations
		};
		for (let i = 0; i < m; i++) {
			if (!artSet.has(t.basis[i])) continue;
			if (!t.M[i + 1][n].isZero()) return {
				status: "infeasible",
				t,
				snaps,
				iterations
			};
			for (let j = 0; j < n; j++) {
				if (artSet.has(j)) continue;
				if (!t.M[i + 1][j].isZero()) {
					pivot(t, i + 1, j);
					break;
				}
			}
		}
	}
	for (let j = 0; j <= n; j++) t.M[0][j] = ZERO;
	for (let j = 0; j < n; j++) t.M[0][j] = c[j] ? c[j].neg() : ZERO;
	for (let i = 0; i < m; i++) {
		const col = t.basis[i];
		const f = t.M[0][col];
		if (f.isZero()) continue;
		for (let j = 0; j <= n; j++) t.M[0][j] = t.M[0][j].sub(f.mul(t.M[i + 1][j]));
	}
	const p2 = solveTableau(t, artSet, snaps, 2, iterations, keepSnaps);
	iterations = p2.iterations;
	if (p2.status === "unbounded") return {
		status: "unbounded",
		t,
		snaps,
		iterations
	};
	return {
		status: "optimal",
		t,
		snaps,
		iterations
	};
}
function extractLP(model, built, keepSnaps) {
	const { t, snaps, iterations, status } = twoPhase(built, keepSnaps);
	if (status === "infeasible") return {
		status: "infeasible",
		message: "El modelo es infactible: no existe un punto que cumpla todas las restricciones.",
		sense: model.sense,
		z: ZERO,
		variables: [],
		constraints: [],
		objRanges: [],
		tableaus: snaps,
		iterations
	};
	if (status === "unbounded") return {
		status: "unbounded",
		message: "El modelo no está acotado: la función objetivo puede mejorar indefinidamente.",
		sense: model.sense,
		z: ZERO,
		variables: [],
		constraints: [],
		objRanges: [],
		tableaus: snaps,
		iterations
	};
	const n = t.n;
	const shownVars = model.variables;
	const nameCol = /* @__PURE__ */ new Map();
	built.names.forEach((nm, j) => nameCol.set(nm, j));
	const varResults = shownVars.map((v) => {
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
			type: v.type
		};
	});
	let z = t.M[0][n];
	if (model.sense === "min") z = z.neg();
	const cons = [];
	const objRanges = [];
	built.conNames.forEach((name, i) => {
		if (i >= model.constraints.length) return;
		const sCol = built.slackCol[i];
		let slack = ZERO;
		if (sCol >= 0) {
			const bi = t.basis.indexOf(sCol);
			if (bi >= 0) slack = t.M[bi + 1][n];
		}
		let dual = ZERO;
		if (sCol >= 0) dual = t.M[0][sCol];
		else if (built.artCol[i] >= 0) dual = t.M[0][built.artCol[i]];
		if (model.sense === "min") dual = dual.neg();
		if (built.relations[i] === ">=") dual = dual.neg();
		let rhsDec = null;
		let rhsInc = null;
		if (sCol >= 0) {
			const d = [];
			const rhs = [];
			for (let r = 1; r <= t.m; r++) {
				d.push(t.M[r][sCol]);
				rhs.push(t.M[r][n]);
			}
			const sign = built.relations[i] === ">=" ? Q.NEG_ONE : ONE;
			let lo = null;
			let hi = null;
			for (let r = 0; r < d.length; r++) {
				const dd = d[r].mul(sign);
				if (dd.isZero()) continue;
				rhs[r].div(dd).neg();
				if (dd.isPositive()) {
					const lim = rhs[r].div(dd).neg();
					if (lo === null || lim.cmp(lo) > 0) lo = lim;
				} else {
					const lim = rhs[r].div(dd).neg();
					if (hi === null || lim.cmp(hi) < 0) hi = lim;
				}
			}
			rhsDec = lo === null ? null : lo.abs().isZero() && lo.isNegative() ? ZERO : lo.neg().isPositive() ? lo.abs() : lo.isNegative() ? lo.abs() : ZERO;
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
			objInc: null
		});
	});
	shownVars.forEach((v, vi) => {
		const j = nameCol.get(v.name) ?? -1;
		if (j < 0) {
			objRanges.push({
				name: v.name,
				coeff: model.objective[v.id] ?? 0,
				dec: null,
				inc: null
			});
			return;
		}
		const isBasic = t.basis.includes(j);
		let dec = null;
		let inc = null;
		if (!isBasic) {
			const r = t.M[0][j];
			if (model.sense === "max") {
				dec = null;
				inc = r;
			} else {
				dec = r;
				inc = null;
			}
		} else {
			const brow = t.basis.indexOf(j) + 1;
			let lo = null;
			let hi = null;
			for (let k = 0; k < n; k++) {
				if (k === j) continue;
				if (built.artCols.includes(k)) continue;
				if (t.basis.includes(k) && t.M[0][k].isZero()) continue;
				const a = t.M[brow][k];
				const zk = t.M[0][k];
				if (a.isZero()) continue;
				if (a.isPositive()) {
					const lim = zk.div(a);
					if (hi === null || lim.cmp(hi) < 0) hi = lim;
				} else {
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
			inc
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
		iterations
	};
}
function isInt(q) {
	return q.d === 1n;
}
function fractionalScore(q) {
	if (q.isInteger()) return ZERO;
	const fl = q.floor();
	const frac = q.sub(fl);
	return frac.cmp(new Q(1n, 2n)) > 0 ? ONE.sub(frac) : frac;
}
function applyBound(model, varId, which, value) {
	return {
		...model,
		variables: model.variables.map((v) => v.id === varId ? {
			...v,
			upper: which === "upper" ? value : v.upper,
			lower: which === "lower" ? value : v.lower ?? 0
		} : v)
	};
}
function branchBound(model) {
	const intVars = model.variables.filter((v) => v.type === "integer" || v.type === "binary");
	const root = extractLP(model, build(model), true);
	if (root.status !== "optimal") return root;
	if (intVars.length === 0) return root;
	if (root.variables.every((vr) => {
		const v = model.variables.find((x) => x.name === vr.name);
		if (!v || v.type !== "integer" && v.type !== "binary") return true;
		return isInt(vr.value);
	})) return {
		...root,
		status: "integer-optimal",
		message: "Solución entera óptima encontrada."
	};
	const sense = model.sense;
	let best = null;
	let nodes = 0;
	const stack = [{
		model,
		bound: root.z
	}];
	const MAX_NODES = 250;
	while (stack.length && nodes < MAX_NODES) {
		const node = stack.pop();
		nodes++;
		if (best) {
			if (sense === "max" && node.bound.cmp(best.z) <= 0) continue;
			if (sense === "min" && node.bound.cmp(best.z) >= 0) continue;
		}
		let rel;
		try {
			rel = extractLP(node.model, build(node.model), false);
		} catch {
			continue;
		}
		if (rel.status !== "optimal") continue;
		const fracVar = rel.variables.map((vr) => {
			const v = node.model.variables.find((x) => x.name === vr.name);
			if (!v || v.type !== "integer" && v.type !== "binary") return null;
			if (isInt(vr.value)) return null;
			return {
				v,
				vr,
				score: fractionalScore(vr.value)
			};
		}).filter((x) => x !== null).sort((a, b) => b.score.cmp(a.score))[0];
		if (!fracVar) {
			if (!best || sense === "max" && rel.z.cmp(best.z) > 0 || sense === "min" && rel.z.cmp(best.z) < 0) best = {
				...rel,
				status: "integer-optimal",
				message: "Solución entera óptima encontrada.",
				tableaus: root.tableaus
			};
			continue;
		}
		const fl = fracVar.vr.value.floor().toNumber();
		const cl = fracVar.vr.value.ceil().toNumber();
		const down = applyBound(node.model, fracVar.v.id, "upper", fl);
		const up = applyBound(node.model, fracVar.v.id, "lower", cl);
		stack.push({
			model: down,
			bound: rel.z
		}, {
			model: up,
			bound: rel.z
		});
	}
	if (!best) return {
		...root,
		status: "infeasible",
		message: "No se encontró una solución entera factible.",
		nodes
	};
	return {
		...best,
		nodes,
		iterations: root.iterations,
		tableaus: root.tableaus
	};
}
function solveModel(model) {
	try {
		if (model.variables.length === 0) return {
			status: "error",
			message: "Definí al menos una variable de decisión.",
			sense: model.sense,
			z: ZERO,
			variables: [],
			constraints: [],
			objRanges: [],
			tableaus: [],
			iterations: 0
		};
		if (model.variables.some((v) => v.type === "integer" || v.type === "binary")) return branchBound(model);
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
			iterations: 0
		};
	}
}
var MAX_SAVED = 24;
var LS_KEY = "optimo-lp";
function withLingo(m) {
	return {
		...m,
		lingoSource: toLingo(m),
		updatedAt: Date.now()
	};
}
function persistSlice(s) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(LS_KEY, JSON.stringify({
			model: s.model,
			saved: s.saved,
			frac: s.frac
		}));
	} catch {}
}
var useApp = create()((set, get) => ({
	model: withLingo(blankModel()),
	saved: [],
	result: null,
	frac: false,
	editorTab: "visual",
	parseError: null,
	hydrated: false,
	setModel: (m) => {
		set({
			model: {
				...m,
				updatedAt: Date.now()
			},
			result: null,
			parseError: null
		});
		persistSlice(get());
	},
	patchModel: (p) => {
		set({
			model: withLingo({
				...get().model,
				...p
			}),
			result: null
		});
		persistSlice(get());
	},
	newModel: () => {
		set({
			model: withLingo(blankModel()),
			result: null,
			parseError: null,
			editorTab: "visual"
		});
		persistSlice(get());
	},
	loadExample: (id) => {
		const ex = EXAMPLES.find((e) => e.id === id);
		if (!ex) return;
		set({
			model: withLingo(ex.build()),
			result: null,
			parseError: null,
			editorTab: "visual"
		});
		persistSlice(get());
	},
	loadSaved: (id) => {
		const m = get().saved.find((s) => s.id === id);
		if (m) {
			set({
				model: { ...m },
				result: null,
				parseError: null
			});
			persistSlice(get());
		}
	},
	saveCurrent: () => {
		const cur = {
			...get().model,
			id: get().model.id || uid("m"),
			updatedAt: Date.now()
		};
		set({
			model: cur,
			saved: [cur, ...get().saved.filter((s) => s.id !== cur.id)].slice(0, MAX_SAVED)
		});
		persistSlice(get());
	},
	deleteSaved: (id) => {
		set({ saved: get().saved.filter((s) => s.id !== id) });
		persistSlice(get());
	},
	solve: () => {
		const result = solveModel(get().model);
		set({ result });
		return result;
	},
	setFrac: (v) => {
		set({ frac: v });
		persistSlice(get());
	},
	setEditorTab: (t) => set({ editorTab: t }),
	setParseError: (m) => set({ parseError: m }),
	hydrate: () => {
		if (get().hydrated || typeof window === "undefined") return;
		try {
			const raw = localStorage.getItem(LS_KEY);
			if (raw) {
				const d = JSON.parse(raw);
				set({
					model: d.model ?? get().model,
					saved: d.saved ?? [],
					frac: d.frac ?? false,
					hydrated: true
				});
				return;
			}
		} catch {}
		set({ hydrated: true });
	}
}));
var TABS = [
	{
		to: "/",
		label: "Inicio",
		icon: BookOpen,
		match: (p) => p === "/"
	},
	{
		to: "/editor",
		label: "Modelo",
		icon: SlidersHorizontal,
		match: (p) => p.startsWith("/editor")
	},
	{
		to: "/informe",
		label: "Informe",
		icon: Sigma,
		match: (p) => p.startsWith("/informe")
	},
	{
		to: "/grafico",
		label: "Gráfico",
		icon: ChartLine,
		match: (p) => p.startsWith("/grafico")
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const hydrate = useApp((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "app-main",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "tabbar",
			"aria-label": "Navegación",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tabbar-inner",
				children: TABS.map((t) => {
					const Icon = t.icon;
					const active = t.match(pathname);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: t.to,
						className: "tab-item",
						"data-active": active,
						"aria-current": active ? "page" : void 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							size: 20,
							strokeWidth: active ? 2.2 : 1.7
						}), t.label]
					}, t.to);
				})
			})
		})]
	});
}
var THEME_KEY = "optimo-theme";
function prefersDark() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function resolveDark(mode) {
	if (mode === "dark") return true;
	if (mode === "light") return false;
	return prefersDark();
}
function readStoredTheme() {
	if (typeof document !== "undefined") {
		const fromDom = document.documentElement.dataset.theme;
		if (fromDom === "system" || fromDom === "light" || fromDom === "dark") return fromDom;
	}
	if (typeof localStorage === "undefined") return "system";
	try {
		const v = localStorage.getItem(THEME_KEY);
		if (v === "light" || v === "dark" || v === "system") return v;
	} catch {}
	return "system";
}
function applyTheme(mode) {
	if (typeof document === "undefined") return;
	const dark = resolveDark(mode);
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(dark ? "dark" : "light");
	root.dataset.theme = mode;
	root.style.colorScheme = dark ? "dark" : "light";
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", dark ? "#121318" : "#f3f1eb");
	try {
		localStorage.setItem(THEME_KEY, mode);
	} catch {}
}
var ThemeCtx = (0, import_react.createContext)({
	theme: "system",
	setTheme: () => {},
	dark: false
});
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("system");
	const [dark, setDark] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const initial = readStoredTheme();
		setThemeState(initial);
		applyTheme(initial);
		setDark(resolveDark(initial));
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			if (readStoredTheme() === "system") {
				applyTheme("system");
				setDark(resolveDark("system"));
			}
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	const setTheme = (m) => {
		setThemeState(m);
		applyTheme(m);
		setDark(resolveDark(m));
	};
	const value = (0, import_react.useMemo)(() => ({
		theme,
		setTheme,
		dark
	}), [theme, dark]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCtx.Provider, {
		value,
		children
	});
}
function useTheme() {
	return (0, import_react.useContext)(ThemeCtx);
}
var styles_default = "/assets/styles-MOwp6iD0.css";
var APP_NAME = "Lingrok";
var THEME_BOOT = `(function(){try{var t=localStorage.getItem("optimo-theme")||"system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.add(d?"dark":"light");r.dataset.theme=t;r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#f3f1eb"
			},
			{
				name: "description",
				content: "Solver de programación lineal para Investigación Operativa. Editor tipo LINGO, simplex, gráfico y sensibilidad."
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: Root
});
function Root() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$3 = () => import("./routes-bFws69I2.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./editor--GP--PWS.mjs");
var Route$2 = createFileRoute("/editor")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./grafico-ttXUM0xm.mjs");
var Route$1 = createFileRoute("/grafico")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./informe-GBLNOMut.mjs");
var Route = createFileRoute("/informe")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	EditorRoute: Route$2.update({
		id: "/editor",
		path: "/editor",
		getParentRoute: () => Route$4
	}),
	GraficoRoute: Route$1.update({
		id: "/grafico",
		path: "/grafico",
		getParentRoute: () => Route$4
	}),
	InformeRoute: Route.update({
		id: "/informe",
		path: "/informe",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { parseLingo as a, defaultConstraint as c, EXAMPLES as i, defaultVariable as l, useTheme as n, toLingo as o, useApp as r, Q as s, router_exports as t, isBlankModel as u };
