/** Fractions: exact arithmetic for building problems, and pretty display like 7½ or ²⁰⁄₃. */
import { HELP, INK } from './Figure'
import type { FigLabel, FigPoly, FigSeg, FigureSpec } from './types'

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

export interface Frac { n: number; d: number }
export const F = (n: number, d = 1): Frac => {
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}
export const val = (f: Frac) => f.n / f.d
export const mul = (a: Frac, b: Frac) => F(a.n * b.n, a.d * b.d)
export const div = (a: Frac, b: Frac) => F(a.n * b.d, a.d * b.n)
export const add = (a: Frac, b: Frac) => F(a.n * b.d + b.n * a.d, a.d * b.d)

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB = '₀₁₂₃₄₅₆₇₈₉'
export const sup = (n: number) => String(n).split('').map((c) => SUP[+c]).join('')
const sub = (n: number) => String(n).split('').map((c) => SUB[+c]).join('')
const NICE: Record<string, string> = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞' }
const piece = (n: number, d: number) => NICE[`${n}/${d}`] ?? `${sup(n)}⁄${sub(d)}`

/** Pretty text: 3 → "3", 15/2 → "7½" (mixed) or "¹⁵⁄₂" (improper when `improper`). */
export function show(f: Frac, improper = false): string {
  const { n, d } = F(f.n, f.d)
  if (d === 1) return String(n)
  if (improper || n < d) return piece(n, d)
  return `${Math.floor(n / d)}${piece(n % d, d)}`
}
/** How the answer can be typed, spelled out for kids. */
export const plain = (f: Frac) => {
  const { n, d } = F(f.n, f.d)
  if (d === 1) return String(n)
  return n > d ? `${Math.floor(n / d)} ${n % d}/${d}` : `${n}/${d}`
}
export const FRACTION_HINT = 'Type fractions like 3/4 or 2 1/2.'

/**
 * Fraction bars for "how many groups of p/q are in n?": n whole bars cut into q parts,
 * colored in groups of p parts. `help` numbers the groups.
 */
export function groupBars(n: number, p: number, q: number, help: boolean, alt: string): FigureSpec {
  const parts = n * q
  const u = Math.min(1.2, 15 / parts)
  const h = 1.3
  const polys: FigPoly[] = []
  const labels: FigLabel[] = []
  const segs: FigSeg[] = []
  const full = Math.floor(parts / p)
  for (let k = 0; k < parts; k++) {
    const g = Math.floor(k / p)
    const partial = g >= full
    const fill = partial ? '#FFF1B8' : g % 2 ? '#7FD0FF' : '#FF8FC1'
    polys.push({ pts: [[k * u, 0], [(k + 1) * u, 0], [(k + 1) * u, h], [k * u, h]], fill, sw: 1.5 })
  }
  for (let w = 0; w <= n; w++) {
    segs.push({ a: [w * q * u, -0.15], b: [w * q * u, h + 0.15], color: INK, solid: true })
    labels.push({ x: w * q * u, y: -0.55, t: w, small: true })
  }
  if (help) {
    for (let g = 0; g < full; g++) labels.push({ x: (g * p + p / 2) * u, y: h + 0.5, t: g + 1, color: HELP, small: true })
    if (parts % p) labels.push({ x: (full * p + (parts % p) / 2) * u, y: h + 0.5, t: show(F(parts % p, p)), color: HELP, small: true })
  }
  return { x0: -0.6, x1: parts * u + 0.6, y0: -1.1, y1: h + 1.1, alt, polys, segs, labels }
}
