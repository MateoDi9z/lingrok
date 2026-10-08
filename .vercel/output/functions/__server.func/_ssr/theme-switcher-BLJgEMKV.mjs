import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Moon, l as Monitor, r as Sun } from "../_libs/lucide-react.mjs";
import { n as useTheme } from "./router-CmfGc1qH.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-switcher-BLJgEMKV.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...parts) {
	return twMerge(parts.filter(Boolean).join(" "));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			steel: "bg-steel text-bg hover:opacity-90",
			outline: "border border-border-strong bg-transparent text-fg hover:bg-elevated",
			ghost: "bg-transparent text-muted hover:bg-elevated hover:text-fg",
			danger: "bg-danger/15 text-danger hover:bg-danger/25",
			subtle: "bg-elevated text-fg hover:bg-elevated/80"
		},
		size: {
			sm: "h-9 rounded-sm px-3 text-sm",
			md: "h-11 rounded-md px-4 text-sm",
			lg: "h-12 rounded-lg px-5 text-base",
			icon: "size-11 rounded-md",
			pill: "h-8 rounded-full px-3 text-xs"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var OPTIONS = [
	{
		id: "system",
		label: "Sistema",
		icon: Monitor
	},
	{
		id: "light",
		label: "Claro",
		icon: Sun
	},
	{
		id: "dark",
		label: "Oscuro",
		icon: Moon
	}
];
function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex rounded-md border border-border bg-surface p-0.5",
		role: "group",
		"aria-label": "Tema",
		children: OPTIONS.map((o) => {
			const Icon = o.icon;
			const active = theme === o.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: o.label,
				"aria-label": o.label,
				"aria-pressed": active,
				onClick: () => setTheme(o.id),
				className: cn("flex size-7 items-center justify-center rounded-sm text-subtle transition-colors duration-150", active ? "bg-accent text-accent-fg" : "hover:text-fg"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					size: 15,
					strokeWidth: 1.8
				})
			}, o.id);
		})
	});
}
//#endregion
export { ThemeSwitcher as n, cn as r, Button as t };
