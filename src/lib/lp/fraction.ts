/** Exact rational arithmetic for simplex tableaus and reports. */

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a === 0n ? 1n : a;
}

export class Q {
  readonly n: bigint;
  readonly d: bigint;

  constructor(n: bigint | number, d: bigint | number = 1n) {
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

  static readonly ZERO = new Q(0n, 1n);
  static readonly ONE = new Q(1n, 1n);
  static readonly NEG_ONE = new Q(-1n, 1n);

  static from(n: bigint | number | Q): Q {
    if (n instanceof Q) return n;
    return new Q(n, 1n);
  }

  static fromDecimal(value: number): Q {
    if (!Number.isFinite(value)) return Q.ZERO;
    if (Number.isInteger(value)) return new Q(value, 1n);
    return Q.parse(String(value));
  }

  /** Parse "3", "-2.5", "3,14", "1/2", " - 4 / 3 ". Empty → 0. */
  static parse(raw: string): Q {
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

  private static parseUnsignedDecimal(body: string): Q {
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

  add(o: Q): Q {
    return new Q(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o: Q): Q {
    return new Q(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  mul(o: Q): Q {
    return new Q(this.n * o.n, this.d * o.d);
  }
  div(o: Q): Q {
    if (o.n === 0n) throw new Error("División por cero");
    return new Q(this.n * o.d, this.d * o.n);
  }
  neg(): Q {
    return new Q(-this.n, this.d);
  }
  abs(): Q {
    return this.n < 0n ? this.neg() : this;
  }
  cmp(o: Q): number {
    const d = this.n * o.d - o.n * this.d;
    return d < 0n ? -1 : d > 0n ? 1 : 0;
  }
  eq(o: Q): boolean {
    return this.n === o.n && this.d === o.d;
  }
  isZero(): boolean {
    return this.n === 0n;
  }
  isPositive(): boolean {
    return this.n > 0n;
  }
  isNegative(): boolean {
    return this.n < 0n;
  }
  isInteger(): boolean {
    return this.d === 1n;
  }
  /** Near-integer for MIP (already exact; used when mixing floats). */
  floor(): Q {
    const q = this.n / this.d;
    const r = this.n % this.d;
    if (r === 0n) return new Q(q, 1n);
    if (this.n < 0n) return new Q(q - 1n, 1n);
    return new Q(q, 1n);
  }
  ceil(): Q {
    const q = this.n / this.d;
    const r = this.n % this.d;
    if (r === 0n) return new Q(q, 1n);
    if (this.n < 0n) return new Q(q, 1n);
    return new Q(q + 1n, 1n);
  }
  toNumber(): number {
    return Number(this.n) / Number(this.d);
  }
  /** Pretty fraction, mixed if |n|>d, else improper. */
  toFraction(): string {
    if (this.d === 1n) return this.n.toString();
    const sign = this.n < 0n ? "-" : "";
    const n = this.n < 0n ? -this.n : this.n;
    return `${sign}${n.toString()}/${this.d.toString()}`;
  }
  toDecimal(places = 6): string {
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
  toString(): string {
    return this.toFraction();
  }
}

export function q(n: number | string | Q): Q {
  if (n instanceof Q) return n;
  if (typeof n === "string") return Q.parse(n);
  return Q.fromDecimal(n);
}
