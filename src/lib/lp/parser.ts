import { Q } from "./fraction";
import { uid } from "./ids";
import type { Constraint, LpModel, Relation, Sense, Variable, VarType } from "./types";

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  model: LpModel | null;
  errors: ParseError[];
}

const RESERVED = new Set([
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
  "S.T.",
]);

function isNameStart(c: string) {
  return /[A-Za-z_]/.test(c);
}
function isNameChar(c: string) {
  return /[A-Za-z0-9_]/.test(c);
}

interface Tok {
  kind: "num" | "name" | "op" | "dir" | "eol" | "eof";
  v: string;
  line: number;
}

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  for (let li = 0; li < lines.length; li++) {
    let s = lines[li];
    const bang = s.indexOf("!");
    if (bang >= 0) s = s.slice(0, bang);
    s = s.trim();
    if (!s) continue;
    let i = 0;
    const line = li + 1;
    const push = (kind: Tok["kind"], v: string) => out.push({ kind, v, line });
    while (i < s.length) {
      const c = s[i];
      if (c === " " || c === "\t") {
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
      if (c === "+" || c === "-" || c === "*" || c === "/" || c === "(" || c === ")" || c === ";" || c === ":" || c === "[" || c === "]" || c === "," || c === "|" ) {
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
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
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
      throw { line, message: `Carácter no válido: "${c}"` };
    }
    push("eol", "");
  }
  out.push({ kind: "eof", v: "", line: lines.length });
  return out;
}

interface Linear {
  terms: Map<string, Q>;
  k: Q;
}

function emptyLinear(): Linear {
  return { terms: new Map(), k: Q.ZERO };
}

function addLinear(a: Linear, b: Linear): Linear {
  const terms = new Map(a.terms);
  b.terms.forEach((q, n) => terms.set(n, (terms.get(n) ?? Q.ZERO).add(q)));
  return { terms, k: a.k.add(b.k) };
}

function scaleLinear(a: Linear, s: Q): Linear {
  if (s.isZero()) return emptyLinear();
  const terms = new Map<string, Q>();
  a.terms.forEach((q, n) => {
    const p = q.mul(s);
    if (!p.isZero()) terms.set(n, p);
  });
  return { terms, k: a.k.mul(s) };
}

function mulLinear(a: Linear, b: Linear, line: number): Linear {
  if (a.terms.size > 0 && b.terms.size > 0) {
    throw { line, message: "Término no lineal (producto de variables). Solo se admite PL." };
  }
  if (b.terms.size > 0) return scaleLinear(b, a.k);
  return scaleLinear(a, b.k);
}

interface LingoSet {
  name: string;
  /** Tuples of members. Primitive: [["P1"],["P2"]]; derived: [["O1","D1"], ...] */
  members: string[][];
  parents: string[];
  attributes: string[];
}

interface AttrInfo {
  setName: string;
  /** memberKey "P1" or "O1,D1" → value if data */
  data: Map<string, Q>;
  isData: boolean;
}

interface SetsEnv {
  sets: Map<string, LingoSet>;
  attrs: Map<string, AttrInfo>;
}

function keyOf(members: string[]): string {
  return members.join(",");
}

function flattenName(attr: string, members: string[]): string {
  return [attr, ...members].join("_");
}

function expandRange(from: string, to: string, line: number): string[] {
  const m1 = from.match(/^(.*?)(\d+)$/);
  const m2 = to.match(/^(.*?)(\d+)$/);
  if (m1 && m2 && m1[1] === m2[1]) {
    const prefix = m1[1];
    const a = Number(m1[2]);
    const b = Number(m2[2]);
    const width = m1[2].length === m2[2].length && m1[2].startsWith("0") ? m1[2].length : 0;
    const out: string[] = [];
    const step = a <= b ? 1 : -1;
    for (let n = a; step > 0 ? n <= b : n >= b; n += step) {
      out.push(prefix + (width ? String(n).padStart(width, "0") : String(n)));
    }
    return out;
  }
  if (from.length === 1 && to.length === 1) {
    const a = from.charCodeAt(0);
    const b = to.charCodeAt(0);
    const out: string[] = [];
    const step = a <= b ? 1 : -1;
    for (let c = a; step > 0 ? c <= b : c >= b; c += step) out.push(String.fromCharCode(c));
    return out;
  }
  throw { line, message: `Rango no válido: ${from}..${to}` };
}

function tokText(t: Tok): string {
  return t.v;
}

function skipWs(toks: Tok[], i: { n: number }) {
  while (toks[i.n]?.kind === "eol") i.n++;
}

function cartesian(parents: string[][]): string[][] {
  return parents.reduce<string[][]>((acc, dim) => {
    if (!acc.length) return dim.map((m) => [m]);
    const out: string[][] = [];
    for (const prev of acc) for (const m of dim) out.push([...prev, m]);
    return out;
  }, []);
}

function setByName(env: SetsEnv, name: string): LingoSet | undefined {
  const up = name.toUpperCase();
  for (const s of env.sets.values()) if (s.name.toUpperCase() === up) return s;
  return undefined;
}

function attrByName(env: SetsEnv, name: string): AttrInfo | undefined {
  const up = name.toUpperCase();
  for (const [k, a] of env.attrs) if (k.toUpperCase() === up) return a;
  return undefined;
}

function attrKey(env: SetsEnv, name: string): string | undefined {
  const up = name.toUpperCase();
  for (const k of env.attrs.keys()) if (k.toUpperCase() === up) return k;
  return undefined;
}

function parseMemberList(toks: Tok[], i: { n: number }, arity: number): string[][] {
  skipWs(toks, i);
  if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "/")) return [];
  const line = toks[i.n].line;
  i.n++;
  const raw: string[] = [];
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
      if (!b || (b.kind !== "name" && b.kind !== "num")) throw { line, message: "Rango .. incompleto" };
      const from = raw.pop();
      if (!from) throw { line, message: "Rango .. sin origen" };
      raw.push(...expandRange(from, b.v, line));
      i.n++;
      continue;
    }
    if (t.kind === "name" || t.kind === "num") {
      raw.push(t.v);
      i.n++;
      continue;
    }
    throw { line: t.line, message: `Miembro de conjunto no válido: ${t.v}` };
  }
  if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "/")) throw { line, message: "Falta / de cierre en la lista de miembros" };
  i.n++;
  if (arity <= 1) return raw.map((m) => [m]);
  if (raw.length % arity !== 0) throw { line, message: `Se esperaban tuplas de ${arity} miembros` };
  const out: string[][] = [];
  for (let k = 0; k < raw.length; k += arity) out.push(raw.slice(k, k + arity));
  return out;
}

function parseNameList(toks: Tok[], i: { n: number }): string[] {
  const names: string[] = [];
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

function parseSetsSection(toks: Tok[], i: { n: number }, env: SetsEnv) {
  // SETS already consumed, optional :
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
    if (t.kind !== "name") throw { line: t.line, message: "Se esperaba un nombre de conjunto" };
    const setName = t.v;
    i.n++;
    skipWs(toks, i);
    const parents: string[] = [];
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
    const arity = parents.length || 1;
    const listed = parseMemberList(toks, i, arity);
    skipWs(toks, i);
    const attributes: string[] = [];
    if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") {
      i.n++;
      attributes.push(...parseNameList(toks, i));
    }
    eatSemi(toks, i);

    let members = listed;
    if (!members.length && parents.length) {
      const dims: string[][] = parents.map((p) => {
        const ps = setByName(env, p);
        if (!ps) throw { line: t.line, message: `Conjunto padre "${p}" no definido` };
        return ps.members.map((m) => (m.length === 1 ? m[0] : keyOf(m)));
      });
      members = cartesian(dims);
    }
    const set: LingoSet = { name: setName, members, parents, attributes };
    env.sets.set(setName.toUpperCase(), set);
    for (const a of attributes) {
      env.attrs.set(a, { setName, data: new Map(), isData: false });
    }
  }
  throw { line: toks[i.n]?.line ?? 0, message: "Falta ENDSETS" };
}

function parseDataSection(toks: Tok[], i: { n: number }, env: SetsEnv) {
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
    if (t.kind !== "name") throw { line: t.line, message: "Se esperaba un atributo o conjunto en DATA" };
    const names = parseNameList(toks, i);
    skipWs(toks, i);
    if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "=")) {
      throw { line: t.line, message: `Se esperaba = después de ${names.join(", ")}` };
    }
    i.n++;
    const values: string[] = [];
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
        if (!from || !b || (b.kind !== "name" && b.kind !== "num")) {
          throw { line: v.line, message: "Rango .. incompleto en DATA" };
        }
        values.push(...expandRange(from, b.v, v.line));
        i.n++;
        continue;
      }
      if (v.kind === "num" || v.kind === "name") {
        values.push(v.v);
        i.n++;
        continue;
      }
      throw { line: v.line, message: `Valor DATA no válido: ${v.v}` };
    }
    eatSemi(toks, i);

    for (const nm of names) {
      const set = setByName(env, nm);
      if (set && !attrByName(env, nm)) {
        if (!set.members.length) set.members = values.map((m) => [m]);
        continue;
      }
      const attrName = attrKey(env, nm);
      if (!attrName) throw { line: t.line, message: `"${nm}" no es un atributo ni un conjunto declarado en SETS` };
      const info = env.attrs.get(attrName)!;
      const setRef = setByName(env, info.setName);
      if (!setRef) throw { line: t.line, message: `Conjunto de ${nm} no encontrado` };
      if (values.length !== setRef.members.length) {
        throw {
          line: t.line,
          message: `${nm} tiene ${values.length} valores y el conjunto ${setRef.name} tiene ${setRef.members.length} miembros`,
        };
      }
      info.isData = true;
      info.data.clear();
      setRef.members.forEach((m, idx) => {
        info.data.set(keyOf(m), Q.parse(values[idx]));
      });
    }
  }
  throw { line: toks[i.n]?.line ?? 0, message: "Falta ENDDATA" };
}

type Bindings = Map<string, string>;

function memberTuple(set: LingoSet, key: string): string[] {
  const found = set.members.find((m) => keyOf(m) === key);
  return found ?? key.split(",");
}

function resolveIndex(toks: Tok[], i: { n: number }, bind: Bindings): string {
  skipWs(toks, i);
  const t = toks[i.n];
  if (!t || (t.kind !== "name" && t.kind !== "num")) throw { line: t?.line ?? 0, message: "Se esperaba un índice" };
  i.n++;
  if (t.kind === "name" && bind.has(t.v)) return bind.get(t.v)!;
  const up = t.v.toUpperCase();
  for (const [k, v] of bind) if (k.toUpperCase() === up) return v;
  return t.v;
}

function parseIndexList(toks: Tok[], i: { n: number }, bind: Bindings): string[] {
  skipWs(toks, i);
  if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) return [];
  i.n++;
  const idx: string[] = [];
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

function lookupIndexed(env: SetsEnv, attr: string, members: string[], line: number): Linear {
  const info = attrByName(env, attr);
  if (!info) {
    if (members.length) throw { line, message: `"${attr}" no es un atributo de ningún conjunto` };
    const lin = emptyLinear();
    lin.terms.set(attr, Q.ONE);
    return lin;
  }
  const set = setByName(env, info.setName);
  if (!set) throw { line, message: `Conjunto de ${attr} no encontrado` };
  const mem = members.length ? members : [];
  if (mem.length !== (set.parents.length || 1) && mem.length !== set.members[0]?.length) {
    if (mem.length === 0) {
      throw { line, message: `${attr} requiere índices (p.ej. ${attr}(i))` };
    }
  }
  const k = keyOf(mem);
  if (info.isData) {
    const q = info.data.get(k);
    if (!q) throw { line, message: `No hay dato de ${attr}(${mem.join(",")})` };
    return { terms: new Map(), k: q };
  }
  const lin = emptyLinear();
  lin.terms.set(flattenName(attrKey(env, attr) ?? attr, mem), Q.ONE);
  return lin;
}

interface ExprCtx {
  env: SetsEnv;
  bind: Bindings;
}

function parseExpr(toks: Tok[], i: { n: number }, ctx?: ExprCtx): Linear {
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

function parseTerm(toks: Tok[], i: { n: number }, ctx?: ExprCtx): Linear {
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
      if (den.terms.size > 0) throw { line: t.line, message: "No se puede dividir por una variable" };
      if (den.k.isZero()) throw { line: t.line, message: "División por cero" };
      acc = scaleLinear(acc, Q.ONE.div(den.k));
      continue;
    }
    break;
  }
  return acc;
}

function implicitMembers(ctx: ExprCtx, attr: string, line: number): string[] {
  const info = attrByName(ctx.env, attr);
  if (!info) return [];
  const set = setByName(ctx.env, info.setName);
  if (!set) return [];
  const arity = set.members[0]?.length ?? 1;
  if (arity === 1) {
    for (const v of ctx.bind.values()) {
      if (set.members.some((m) => keyOf(m) === v || m[0] === v)) {
        const tup = set.members.find((m) => keyOf(m) === v || m[0] === v);
        if (tup) return tup;
      }
    }
  } else {
    const parents = set.parents.map((p) => setByName(ctx.env, p));
    const tuple: string[] = [];
    for (let d = 0; d < arity; d++) {
      const parent = parents[d];
      let found: string | undefined;
      for (const v of ctx.bind.values()) {
        if (!parent || parent.members.some((m) => keyOf(m) === v || m[0] === v)) {
          found = v;
          break;
        }
      }
      if (!found) break;
      tuple.push(found);
    }
    if (tuple.length === arity) return tuple;
  }
  throw { line, message: `${attr} necesita índices explícitos` };
}

function parseFactor(toks: Tok[], i: { n: number }, ctx?: ExprCtx): Linear {
  skipWs(toks, i);
  const t = toks[i.n];
  if (!t || t.kind === "eof") throw { line: t?.line ?? 0, message: "Expresión incompleta" };
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
    else throw { line: t.line, message: "Falta ) en la expresión" };
    return inner;
  }
  if (t.kind === "dir" && t.v === "@SUM") return parseSum(toks, i, ctx);
  if (t.kind === "dir" && t.v === "@SIZE") {
    i.n++;
    skipWs(toks, i);
    if (toks[i.n]?.kind === "op" && toks[i.n].v === "(") i.n++;
    skipWs(toks, i);
    const nm = toks[i.n];
    if (nm?.kind !== "name") throw { line: t.line, message: "@SIZE espera un conjunto" };
    i.n++;
    skipWs(toks, i);
    if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
    const set = ctx ? setByName(ctx.env, nm.v) : undefined;
    if (!set) throw { line: t.line, message: `Conjunto "${nm.v}" no definido` };
    return { terms: new Map(), k: new Q(set.members.length, 1n) };
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
    return { terms: new Map(), k: coef };
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
  throw { line: t.line, message: `Expresión no válida cerca de "${t.v}"` };
}

interface SetHead {
  set: LingoSet;
  indices: string[];
  cond: ((bind: Bindings) => boolean) | null;
}

function parseSetHead(toks: Tok[], i: { n: number }, env: SetsEnv, line: number): SetHead {
  skipWs(toks, i);
  const nm = toks[i.n];
  if (nm?.kind !== "name") throw { line, message: "Se esperaba un conjunto" };
  const set = setByName(env, nm.v);
  if (!set) throw { line: nm.line, message: `Conjunto "${nm.v}" no definido` };
  i.n++;
  skipWs(toks, i);
  const indices: string[] = [];
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
      throw { line: toks[i.n].line, message: "Índice no válido" };
    }
    if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
  } else {
    const arity = set.members[0]?.length ?? 1;
    for (let k = 0; k < arity; k++) indices.push(`_${k + 1}`);
  }
  skipWs(toks, i);
  let cond: ((bind: Bindings) => boolean) | null = null;
  if (toks[i.n]?.kind === "op" && toks[i.n].v === "|") {
    i.n++;
    cond = parseCondition(toks, i, env);
  }
  skipWs(toks, i);
  if (toks[i.n]?.kind === "op" && toks[i.n].v === ":") i.n++;
  else throw { line, message: "Falta : en @SUM/@FOR" };
  return { set, indices, cond };
}

function bindMember(indices: string[], mem: string[]): Bindings {
  const bind = new Map<string, string>();
  indices.forEach((idx, k) => bind.set(idx, mem[k] ?? keyOf(mem)));
  return bind;
}

function mergeBind(outer: Bindings, inner: Bindings): Bindings {
  const m = new Map(outer);
  inner.forEach((v, k) => m.set(k, v));
  return m;
}

function parseSum(toks: Tok[], i: { n: number }, ctx?: ExprCtx): Linear {
  const t = toks[i.n];
  if (!ctx) throw { line: t.line, message: "@SUM requiere una sección SETS" };
  i.n++;
  skipWs(toks, i);
  if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) throw { line: t.line, message: "@SUM espera (" };
  i.n++;
  const head = parseSetHead(toks, i, ctx.env, t.line);
  const start = i.n;
  let acc = emptyLinear();
  let end = start;
  for (const mem of head.set.members) {
    const bind = mergeBind(ctx.bind, bindMember(head.indices, mem));
    if (head.cond && !head.cond(bind)) continue;
    i.n = start;
    acc = addLinear(acc, parseExpr(toks, i, { env: ctx.env, bind }));
    end = i.n;
  }
  if (!head.set.members.length) {
    parseExpr(toks, i, ctx);
    end = i.n;
  }
  i.n = end;
  skipWs(toks, i);
  if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
  else throw { line: t.line, message: "Falta ) de cierre en @SUM" };
  return acc;
}

function condValue(toks: Tok[], i: { n: number }, env: SetsEnv, bind: Bindings): { q: Q | null; s: string } {
  skipWs(toks, i);
  const t = toks[i.n];
  if (t?.kind === "num") {
    i.n++;
    return { q: Q.parse(t.v), s: t.v };
  }
  if (t?.kind === "name") {
    i.n++;
    const idx = toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, bind) : [];
    if (bind.has(t.v) && !idx.length) {
      const s = bind.get(t.v)!;
      const m = s.match(/-?\d+/);
      return { q: m ? Q.fromDecimal(Number(m[0])) : null, s };
    }
    const info = attrByName(env, t.v);
    if (info) {
      const mem = idx.length ? idx : implicitMembers({ env, bind }, t.v, t.line);
      const q = info.data.get(keyOf(mem));
      return { q: q ?? null, s: keyOf(mem) };
    }
    const s = t.v;
    const n = Number(s);
    return { q: Number.isFinite(n) ? Q.fromDecimal(n) : null, s };
  }
  throw { line: t?.line ?? 0, message: "Valor de condición no válido" };
}

function cmpQ(op: string, a: { q: Q | null; s: string }, b: { q: Q | null; s: string }): boolean {
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

function parseCondition(toks: Tok[], i: { n: number }, env: SetsEnv): (bind: Bindings) => boolean {
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
  const end = i.n;
  return (bind: Bindings) => {
    const j = { n: start };
    skipWs(toks, j);
    const left = condValue(toks, j, env, bind);
    skipWs(toks, j);
    const op = toks[j.n];
    if (!op || op.kind !== "op") return true;
    j.n++;
    const right = condValue(toks, j, env, bind);
    void end;
    return cmpQ(op.v.toUpperCase(), left, right);
  };
}

function parseRefName(toks: Tok[], i: { n: number }, ctx: ExprCtx): string[] {
  skipWs(toks, i);
  const t = toks[i.n];
  if (t?.kind !== "name") throw { line: t?.line ?? 0, message: "Se esperaba un nombre" };
  i.n++;
  const idx = toks[i.n]?.kind === "op" && toks[i.n].v === "(" ? parseIndexList(toks, i, ctx.bind) : [];
  const info = attrByName(ctx.env, t.v);
  if (info) {
    const set = setByName(ctx.env, info.setName)!;
    if (idx.length) return [flattenName(attrKey(ctx.env, t.v) ?? t.v, idx)];
    if (ctx.bind.size) {
      const mem = implicitMembers(ctx, t.v, t.line);
      return [flattenName(attrKey(ctx.env, t.v) ?? t.v, mem)];
    }
    return set.members.map((m) => flattenName(attrKey(ctx.env, t.v) ?? t.v, m));
  }
  return [t.v];
}

function splitConstraint(lhs: Linear, rhs: Linear, rel: Relation): { terms: Map<string, Q>; rhs: Q; relation: Relation } {
  const terms = new Map<string, Q>(lhs.terms);
  rhs.terms.forEach((q, n) => terms.set(n, (terms.get(n) ?? Q.ZERO).sub(q)));
  return { terms, rhs: rhs.k.sub(lhs.k), relation: rel };
}

function parseFor(
  toks: Tok[],
  i: { n: number },
  ctx: ExprCtx,
  conList: { name: string; terms: Map<string, Q>; relation: Relation; rhs: Q }[],
  types: Map<string, VarType>,
  free: Set<string>,
  bounds: Map<string, { lo: number | null; hi: number | null }>,
) {
  const t = toks[i.n];
  i.n++;
  skipWs(toks, i);
  if (!(toks[i.n]?.kind === "op" && toks[i.n].v === "(")) throw { line: t.line, message: "@FOR espera (" };
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
  if (depth !== 0) throw { line: t.line, message: "Falta ) de cierre en @FOR" };
  const bodyEnd = k;

  const parseBody = (bind: Bindings) => {
    const j = { n: bodyStart };
    const inner: ExprCtx = { env: ctx.env, bind };
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
          for (const n of names) {
            if (dir === "@BIN") types.set(n, "binary");
            else if (dir === "@FREE") free.add(n);
            else types.set(n, "integer");
          }
        } else if (dir === "@BND") {
          const loE = parseExpr(toks, j, inner);
          skipWs(toks, j);
          if (toks[j.n]?.kind === "op" && toks[j.n].v === ",") j.n++;
          const names = parseRefName(toks, j, inner);
          skipWs(toks, j);
          if (toks[j.n]?.kind === "op" && toks[j.n].v === ",") j.n++;
          const hiE = parseExpr(toks, j, inner);
          for (const n of names) bounds.set(n, { lo: loE.k.toNumber(), hi: hiE.k.toNumber() });
        } else {
          throw { line: dline, message: `Directiva ${dir} no soportada en @FOR` };
        }
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
      if (!relT || relT.kind !== "op" || (relT.v !== "<=" && relT.v !== ">=" && relT.v !== "=")) {
        throw { line: toks[bodyStart]?.line ?? t.line, message: "Se esperaba una restricción con <=, >= o = dentro de @FOR" };
      }
      j.n++;
      const rhs = parseExpr(toks, j, inner);
      const split = splitConstraint(lhs, rhs, relT.v as Relation);
      if (conList.some((c) => c.name === cname)) cname = `${cname}_${conList.length + 1}`;
      conList.push({ name: cname, terms: split.terms, relation: split.relation, rhs: split.rhs });
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

function skipEols(toks: Tok[], i: { n: number }) {
  while (toks[i.n]?.kind === "eol") i.n++;
}

function eatSemi(toks: Tok[], i: { n: number }) {
  if (toks[i.n]?.kind === "op" && toks[i.n].v === ";") i.n++;
  skipEols(toks, i);
}

export function parseLingo(src: string, existing?: Partial<LpModel>): ParseResult {
  const errors: ParseError[] = [];
  let toks: Tok[];
  try {
    toks = tokenize(src);
  } catch (e) {
    const err = e as ParseError;
    return { model: null, errors: [err] };
  }

  let sense: Sense = "max";
  let title = existing?.name ?? "Modelo LINGO";
  const objTerms = new Map<string, Q>();
  const conList: { name: string; terms: Map<string, Q>; relation: Relation; rhs: Q }[] = [];
  const types = new Map<string, VarType>();
  const free = new Set<string>();
  const bounds = new Map<string, { lo: number | null; hi: number | null }>();
  let sawObj = false;
  const env: SetsEnv = { sets: new Map(), attrs: new Map() };
  const ctx: ExprCtx = { env, bind: new Map() };

  const i = { n: 0 };

  const ensureVar = (name: string) => {
    if (RESERVED.has(name.toUpperCase())) {
      throw { line: toks[i.n]?.line ?? 0, message: `"${name}" es una palabra reservada` };
    }
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
      if (t.kind === "name" && t.v.toUpperCase() === "END") {
        break;
      }
      if (t.kind === "name" && t.v.toUpperCase() === "TITLE") {
        i.n++;
        const rest: string[] = [];
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
          for (const n of names) {
            if (dir === "@BIN") types.set(n, "binary");
            else if (dir === "@FREE") free.add(n);
            else types.set(n, "integer");
          }
        } else if (dir === "@BND") {
          const loT = toks[i.n];
          const loE = parseExpr(toks, i, ctx);
          if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") i.n++;
          const names = parseRefName(toks, i, ctx);
          if (toks[i.n]?.kind === "op" && toks[i.n].v === ",") i.n++;
          const hiE = parseExpr(toks, i, ctx);
          for (const n of names) bounds.set(n, { lo: loE.k.toNumber(), hi: hiE.k.toNumber() });
          void loT;
        } else {
          throw { line: t.line, message: `Directiva ${dir} no soportada` };
        }
        if (toks[i.n]?.kind === "op" && toks[i.n].v === ")") i.n++;
        eatSemi(toks, i);
        continue;
      }

      // Named objective: PROFIT) MAX = …   or  [PROFIT] MAX = …
      if (t.kind === "op" && t.v === "[") {
        const nm = toks[i.n + 1];
        const close = toks[i.n + 2];
        const kw = toks[i.n + 3];
        if (nm?.kind === "name" && close?.kind === "op" && close.v === "]" && kw?.kind === "name") {
          const k = kw.v.toUpperCase();
          if (k === "MAX" || k === "MIN" || k === "MAXIMIZE" || k === "MINIMIZE") {
            i.n += 3;
          }
        }
      } else if (t.kind === "name" && toks[i.n + 1]?.kind === "op" && toks[i.n + 1].v === ")") {
        const kw = toks[i.n + 2];
        if (kw?.kind === "name") {
          const k = kw.v.toUpperCase();
          if (k === "MAX" || k === "MIN" || k === "MAXIMIZE" || k === "MINIMIZE") {
            i.n += 2;
          }
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
        if (!expr.k.isZero()) {
          errors.push({ line: t2.line, message: "La función objetivo no puede tener un término constante (se ignora)." });
        }
        objTerms.clear();
        expr.terms.forEach((q, n) => {
          ensureVar(n);
          objTerms.set(n, q);
        });
        sawObj = true;
        eatSemi(toks, i);
        continue;
      }

      // Named constraint: NAME)  or  [NAME]
      let cname = `R${conList.length + 1}`;
      const tCon = toks[i.n];
      if (tCon.kind === "op" && tCon.v === "[") {
        i.n++;
        const nm = toks[i.n++];
        cname = nm.v;
        if (toks[i.n]?.kind === "op" && toks[i.n].v === "]") i.n++;
      } else if (tCon.kind === "name" && toks[i.n + 1]?.kind === "op" && toks[i.n + 1].v === ")") {
        cname = tCon.v;
        i.n += 2;
      }

      const lhs = parseExpr(toks, i, ctx);
      const relT = toks[i.n];
      if (!relT || relT.kind !== "op" || (relT.v !== "<=" && relT.v !== ">=" && relT.v !== "=")) {
        throw { line: tCon.line, message: "Se esperaba una restricción con <=, >= o =" };
      }
      i.n++;
      const rhs = parseExpr(toks, i, ctx);
      // Move all variables to LHS, constants to RHS: lhs - rhs_vars = rhs_k - lhs_k
      const terms = new Map<string, Q>(lhs.terms);
      rhs.terms.forEach((q, n) => {
        terms.set(n, (terms.get(n) ?? Q.ZERO).sub(q));
      });
      const rhsVal = rhs.k.sub(lhs.k);
      terms.forEach((_, n) => ensureVar(n));
      conList.push({ name: cname, terms, relation: relT.v as Relation, rhs: rhsVal });
      eatSemi(toks, i);
    }
  } catch (e) {
    const err = e as ParseError;
    errors.push({ line: err.line ?? 0, message: err.message ?? "Error de sintaxis" });
    return { model: null, errors };
  }

  if (!sawObj) {
    errors.push({ line: 1, message: "Falta la función objetivo (MAX = … o MIN = …)." });
    return { model: null, errors };
  }

  const names = new Set<string>();
  objTerms.forEach((_, n) => names.add(n));
  conList.forEach((c) => c.terms.forEach((_, n) => names.add(n)));
  types.forEach((_, n) => names.add(n));
  free.forEach((n) => names.add(n));
  bounds.forEach((_, n) => names.add(n));

  const variables: Variable[] = [...names].map((name) => {
    const b = bounds.get(name);
    const isFree = free.has(name);
    const type = types.get(name) ?? "continuous";
    return {
      id: uid("v"),
      name,
      type,
      lower: isFree ? null : (b?.lo ?? 0),
      upper: type === "binary" ? 1 : (b?.hi ?? null),
      free: isFree,
    };
  });

  const byName = new Map(variables.map((v) => [v.name, v]));
  const objective: Record<string, number> = {};
  objTerms.forEach((q, n) => {
    const v = byName.get(n);
    if (v) objective[v.id] = q.toNumber();
  });

  const constraints: Constraint[] = conList
    .filter((c) => {
      // Drop trivial bound constraints x >= 0 that match defaults
      if (c.terms.size === 1) {
        const [n, q] = [...c.terms][0];
        const v = byName.get(n);
        if (v && q.eq(Q.ONE) && c.relation === ">=" && c.rhs.isZero() && (v.lower ?? 0) === 0) {
          return false;
        }
      }
      return true;
    })
    .map((c) => {
      const coeffs: Record<string, number> = {};
      c.terms.forEach((q, n) => {
        const v = byName.get(n);
        if (v && !q.isZero()) coeffs[v.id] = q.toNumber();
      });
      return {
        id: uid("c"),
        name: c.name,
        coeffs,
        relation: c.relation,
        rhs: c.rhs.toNumber(),
      };
    });

  const model: LpModel = {
    id: existing?.id ?? uid("m"),
    name: title,
    description: existing?.description ?? "",
    sense,
    objective,
    variables,
    constraints,
    lingoSource: src,
    updatedAt: Date.now(),
    exampleId: existing?.exampleId,
  };
  return { model, errors };
}

export function toLingo(model: LpModel): string {
  const lines: string[] = [];
  lines.push("MODEL:");
  if (model.name) lines.push(`TITLE ${model.name};`);
  if (model.description) {
    for (const d of model.description.split("\n")) {
      const t = d.trim();
      if (t) lines.push(`! ${t}`);
    }
  }

  const term = (id: string, coef: number, first: boolean) => {
    const v = model.variables.find((x) => x.id === id);
    if (!v || coef === 0) return "";
    const abs = Q.fromDecimal(Math.abs(coef)).toDecimal(6);
    const glued = abs === "1" ? v.name : `${abs}${v.name}`;
    if (first) return coef < 0 ? `-${glued}` : glued;
    return coef < 0 ? ` - ${glued}` : ` + ${glued}`;
  };

  const sense = model.sense === "max" ? "MAX" : "MIN";
  const objParts: string[] = [];
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
    const parts: string[] = [];
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
  const dirs: string[] = [];
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
