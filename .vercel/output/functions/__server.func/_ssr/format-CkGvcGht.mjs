//#region node_modules/.nitro/vite/services/ssr/assets/format-CkGvcGht.js
function formatQ(q, mode = "dec") {
	if (mode === "frac") return q.toFraction();
	const s = q.toDecimal(6);
	if (s === "-0") return "0";
	return s;
}
function formatNum(n, digits = 4) {
	if (!Number.isFinite(n)) return "—";
	const s = n.toFixed(digits).replace(/\.?0+$/, "");
	return s === "-0" ? "0" : s;
}
function formatRange(v, mode) {
	if (v === null || v === void 0) return "∞";
	return formatQ(v, mode);
}
function statusLabel(status) {
	switch (status) {
		case "optimal": return "Óptimo global";
		case "integer-optimal": return "Óptimo entero";
		case "infeasible": return "Infactible";
		case "unbounded": return "No acotado";
		default: return "Error";
	}
}
//#endregion
export { statusLabel as i, formatQ as n, formatRange as r, formatNum as t };
