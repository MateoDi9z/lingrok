import { create } from "zustand";
import { EXAMPLES } from "./lp/examples";
import { blankModel, uid } from "./lp/ids";
import { toLingo } from "./lp/parser";
import { solveModel } from "./lp/solver";
import type { LpModel, SolveResult } from "./lp/types";

const MAX_SAVED = 24;
const LS_KEY = "optimo-lp";

interface AppState {
  model: LpModel;
  saved: LpModel[];
  result: SolveResult | null;
  frac: boolean;
  editorTab: "visual" | "lingo";
  parseError: string | null;
  hydrated: boolean;
  setModel: (m: LpModel) => void;
  patchModel: (p: Partial<LpModel>) => void;
  newModel: () => void;
  loadExample: (id: string) => void;
  loadSaved: (id: string) => void;
  saveCurrent: () => void;
  deleteSaved: (id: string) => void;
  solve: () => SolveResult;
  setFrac: (v: boolean) => void;
  setEditorTab: (t: "visual" | "lingo") => void;
  setParseError: (m: string | null) => void;
  hydrate: () => void;
}

function withLingo(m: LpModel): LpModel {
  return { ...m, lingoSource: toLingo(m), updatedAt: Date.now() };
}

function persistSlice(s: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ model: s.model, saved: s.saved, frac: s.frac }),
    );
  } catch {
    /* quota */
  }
}

export const useApp = create<AppState>()((set, get) => ({
  model: withLingo(blankModel()),
  saved: [],
  result: null,
  frac: false,
  editorTab: "visual",
  parseError: null,
  hydrated: false,
  setModel: (m) => {
    set({ model: { ...m, updatedAt: Date.now() }, result: null, parseError: null });
    persistSlice(get());
  },
  patchModel: (p) => {
    const next = withLingo({ ...get().model, ...p });
    set({ model: next, result: null });
    persistSlice(get());
  },
  newModel: () => {
    set({ model: withLingo(blankModel()), result: null, parseError: null, editorTab: "visual" });
    persistSlice(get());
  },
  loadExample: (id) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    set({ model: withLingo(ex.build()), result: null, parseError: null, editorTab: "visual" });
    persistSlice(get());
  },
  loadSaved: (id) => {
    const m = get().saved.find((s) => s.id === id);
    if (m) {
      set({ model: { ...m }, result: null, parseError: null });
      persistSlice(get());
    }
  },
  saveCurrent: () => {
    const cur = { ...get().model, id: get().model.id || uid("m"), updatedAt: Date.now() };
    const rest = get().saved.filter((s) => s.id !== cur.id);
    set({ model: cur, saved: [cur, ...rest].slice(0, MAX_SAVED) });
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
        const d = JSON.parse(raw) as { model?: LpModel; saved?: LpModel[]; frac?: boolean };
        set({
          model: d.model ?? get().model,
          saved: d.saved ?? [],
          frac: d.frac ?? false,
          hydrated: true,
        });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true });
  },
}));
