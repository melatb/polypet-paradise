/** Builders for common diagrams, returned as FigureSpec pieces (math coords, y up). */
import { randInt as R, pick } from '../game/random'
import { HELP, INK, SHAPE } from './Figure'
import type { FigLabel, FigPoly, FigSeg, FigureSpec, Pt } from './types'

const FACE_TOP = '#FFE8F2'
const FACE_SIDE = '#F4B3D1'
const HIDDEN = '#8C9AB5'

/* ---------- Unit squares ---------- */
export type Cell = [number, number]
const key = ([x, y]: Cell) => `${x},${y}`

/** A random connected shape of `n` unit squares inside a w×h box. */
export function polyomino(n: number, w = 6, h = 5): Cell[] {
  const cells: Cell[] = [[R(1, w - 2), R(1, h - 2)]]
  const have = new Set(cells.map(key))
  let guard = 0
  while (cells.length < n && guard++ < 500) {
    const [x, y] = pick(cells)
    const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]] as Cell[])
    const c: Cell = [x + dx, y + dy]
    if (c[0] < 0 || c[1] < 0 || c[0] >= w || c[1] >= h || have.has(key(c))) continue
    cells.push(c)
    have.add(key(c))
  }
  return cells
}

export const cellPoly = ([x, y]: Cell, fill = SHAPE): FigPoly => ({ pts: [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]], fill, sw: 2 })

/** Empty neighbours of a shape (for half-square add-ons). */
export function neighbours(cells: Cell[], w: number, h: number): Cell[] {
  const have = new Set(cells.map(key))
  const out = new Map<string, Cell>()
  for (const [x, y] of cells) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c: Cell = [x + dx, y + dy]
      if (c[0] >= 0 && c[1] >= 0 && c[0] < w && c[1] < h && !have.has(key(c))) out.set(key(c), c)
    }
  }
  return [...out.values()]
}

/** Half of a unit square, cut on a diagonal; `corner` picks which half. */
export function halfCell([x, y]: Cell, corner: 0 | 1 | 2 | 3): FigPoly {
  const c: Pt[] = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]
  const pts = [c[corner], c[(corner + 1) % 4], c[(corner + 3) % 4]]
  return { pts, fill: SHAPE, sw: 2 }
}

/* ---------- Solids, drawn with a simple slanted-depth view ---------- */
export interface Solid { polys: FigPoly[]; segs: FigSeg[]; labels: FigLabel[]; x1: number; y1: number }

/** Rectangular prism: length l (across), height h (up), width w (going back). */
export function box(l: number, w: number, h: number, lab: { l: string; w: string; h: string } | null, k = 1): Solid {
  const L = l * k, W = w * k, H = h * k, dx = W * 0.6, dy = W * 0.42
  return {
    polys: [
      { pts: [[0, 0], [L, 0], [L, H], [0, H]], fill: SHAPE },
      { pts: [[0, H], [L, H], [L + dx, H + dy], [dx, H + dy]], fill: FACE_TOP },
      { pts: [[L, 0], [L + dx, dy], [L + dx, H + dy], [L, H]], fill: FACE_SIDE },
    ],
    segs: [{ a: [0, 0], b: [dx, dy], color: HIDDEN }, { a: [dx, dy], b: [L + dx, dy], color: HIDDEN }, { a: [dx, dy], b: [dx, H + dy], color: HIDDEN }],
    labels: lab ? [{ x: L / 2, y: -0.55, t: lab.l }, { x: -0.8, y: H / 2, t: lab.h }, { x: L + dx / 2 + 0.75, y: dy / 2 - 0.15, t: lab.w }] : [],
    x1: L + dx, y1: H + dy,
  }
}

/** Triangular prism whose ends are right triangles (legs a across, b up; hypotenuse c), length len going back. */
export function triPrism(a: number, b: number, c: number, len: number, k: number): Solid {
  const A = a * k, B = b * k, dx = len * k * 0.6, dy = len * k * 0.42
  return {
    polys: [
      { pts: [[A, 0], [A + dx, dy], [dx, B + dy], [0, B]], fill: FACE_SIDE },
      { pts: [[0, 0], [A, 0], [0, B]], fill: SHAPE },
    ],
    segs: [{ a: [0, 0], b: [dx, dy], color: HIDDEN }, { a: [dx, dy], b: [A + dx, dy], color: HIDDEN }, { a: [dx, dy], b: [dx, B + dy], color: HIDDEN }],
    labels: [
      { x: A / 2, y: -0.55, t: a }, { x: -0.6, y: B / 2, t: b }, { x: A / 2 - 0.2, y: B / 2 + 0.35, t: c },
      { x: A + dx / 2 + 0.6, y: dy / 2 - 0.2, t: len },
    ],
    x1: A + dx, y1: B + dy,
  }
}

/** Square pyramid with base side s and triangle height t (slant height). */
export function squarePyramid(s: number, t: number, k: number): Solid {
  const S = s * k, dx = S * 0.55, dy = S * 0.38
  const apex: Pt = [S / 2 + dx / 2, S * 1.15 + dy / 2]
  return {
    polys: [
      { pts: [[0, 0], [S, 0], apex], fill: SHAPE },
      { pts: [[S, 0], [S + dx, dy], apex], fill: FACE_SIDE },
    ],
    segs: [
      { a: [0, 0], b: [dx, dy], color: HIDDEN }, { a: [dx, dy], b: [S + dx, dy], color: HIDDEN }, { a: [dx, dy], b: apex, color: HIDDEN },
      { a: apex, b: [S / 2, 0] },
    ],
    labels: [{ x: S / 2 - 0.9, y: -0.55, t: s }, { x: S / 2 + 0.45, y: apex[1] * 0.4, t, color: HELP }],
    x1: S + dx, y1: apex[1],
  }
}

export function triPyramid(): Solid {
  const apex: Pt = [2.1, 3.6]
  return {
    polys: [{ pts: [[0, 0], [4, 0], apex], fill: SHAPE }, { pts: [[4, 0], [2.7, 1.4], apex], fill: FACE_SIDE }],
    segs: [{ a: [0, 0], b: [2.7, 1.4], color: HIDDEN }],
    labels: [], x1: 4, y1: 3.6,
  }
}

export function solidFigure(sol: Solid, alt: string, extra: Partial<FigureSpec> = {}): FigureSpec {
  return { x0: -1.6, x1: sol.x1 + 1.6, y0: -1.2, y1: sol.y1 + 0.7, alt, polys: sol.polys, segs: sol.segs, labels: sol.labels, ...extra }
}

/* ---------- Net of a rectangular prism (cross layout) ---------- */
export interface NetFace { rect: [number, number, number, number]; area: number }
export function boxNet(l: number, w: number, h: number): NetFace[] {
  // Middle row: side (w×h), front (l×h), side (w×h), back (l×h); top and bottom (l×w) above and below the front.
  const row = w
  return [
    { rect: [0, row, w, h], area: w * h },
    { rect: [w, row, l, h], area: l * h },
    { rect: [w + l, row, w, h], area: w * h },
    { rect: [2 * w + l, row, l, h], area: l * h },
    { rect: [w, row + h, l, w], area: l * w },
    { rect: [w, 0, l, w], area: l * w },
  ]
}
export const rectPts = ([x, y, w, h]: [number, number, number, number]): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
export const NET_FILLS = ['#FFD1E6', '#CDEBFF', '#FFD1E6', '#CDEBFF', '#FFF1B8', '#FFF1B8']
export { INK }
