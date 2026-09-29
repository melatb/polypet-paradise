/** Diagram builders for ratio, rate and percent problems (math coords, y up). */
import { HELP, INK } from './Figure'
import type { FigLabel, FigPoly, FigSeg, FigureSpec } from './types'

export const COLORS = { a: '#FF8FC1', b: '#7FD0FF', c: '#FFD23F', empty: '#FFFFFF' }

/* ---------- Groups of squares, one row per quantity ---------- */
export interface Group { n: number; name: string; color: string }
export function discrete(groups: Group[], alt: string, perRow = 10): FigureSpec {
  const polys: FigPoly[] = []
  const labels: FigLabel[] = []
  let y = 0
  const s = 0.8
  for (const g of [...groups].reverse()) {
    const rows = Math.max(1, Math.ceil(g.n / perRow))
    for (let i = 0; i < g.n; i++) {
      const r = Math.floor(i / perRow), c = i % perRow
      const yy = y + (rows - 1 - r)
      polys.push({ pts: [[c, yy], [c + s, yy], [c + s, yy + s], [c, yy + s]], fill: g.color, sw: 2 })
    }
    y += rows
    labels.push({ x: 0, y: y + 0.25, t: g.name, anchor: 'start', small: true })
    y += 0.8
  }
  const width = Math.min(perRow, Math.max(...groups.map((g) => g.n)))
  return { x0: -0.5, x1: Math.max(width, 7) + 0.3, y0: -0.5, y1: y + 0.2, alt, polys, labels }
}

/* ---------- Double number line ---------- */
export interface Line { name: string; vals: (number | string)[] }
/** `ask` = [row, index] of the value to hide as "?". `mark` highlights one tick pair. */
export function doubleNumberLine(top: Line, bottom: Line, alt: string, opts: { ask?: ['top' | 'bottom', number]; mark?: number; step?: number } = {}): FigureSpec {
  const n = top.vals.length
  const step = opts.step ?? (n > 6 ? 1.6 : 2)
  const end = (n - 1) * step
  const yt = 1.9, yb = 0
  const segs: FigSeg[] = [
    { a: [-0.3, yt], b: [end + 0.7, yt], color: INK, solid: true },
    { a: [-0.3, yb], b: [end + 0.7, yb], color: INK, solid: true },
  ]
  const labels: FigLabel[] = [
    { x: -0.7, y: yt, t: top.name, anchor: 'end', small: true },
    { x: -0.7, y: yb, t: bottom.name, anchor: 'end', small: true },
  ]
  for (let i = 0; i < n; i++) {
    const x = i * step
    const hot = opts.mark === i
    segs.push({ a: [x, yt - 0.28], b: [x, yt + 0.28], color: hot ? HELP : INK, solid: true })
    segs.push({ a: [x, yb - 0.28], b: [x, yb + 0.28], color: hot ? HELP : INK, solid: true })
    if (hot) segs.push({ a: [x, yb + 0.3], b: [x, yt - 0.3], color: HELP })
    const askTop = opts.ask?.[0] === 'top' && opts.ask[1] === i
    const askBot = opts.ask?.[0] === 'bottom' && opts.ask[1] === i
    labels.push({ x, y: yt + 0.7, t: askTop ? '?' : top.vals[i], color: askTop || hot ? HELP : INK })
    labels.push({ x, y: yb - 0.7, t: askBot ? '?' : bottom.vals[i], color: askBot || hot ? HELP : INK })
  }
  const nameW = Math.max(top.name.length, bottom.name.length) * 0.27 + 1
  return { x0: -nameW, x1: end + 1.2, y0: -1.3, y1: yt + 1.3, alt, segs, labels }
}

/* ---------- Tape diagram: one row of equal boxes per part ---------- */
export interface TapePart { boxes: number; name: string; color: string }
export function tape(parts: TapePart[], alt: string, opts: { each?: string; total?: string } = {}): FigureSpec {
  const w = 1.1, h = 0.9
  const polys: FigPoly[] = []
  const labels: FigLabel[] = []
  parts.forEach((p, r) => {
    const y = (parts.length - 1 - r) * 1.4
    for (let i = 0; i < p.boxes; i++) {
      polys.push({ pts: [[i * w, y], [(i + 1) * w, y], [(i + 1) * w, y + h], [i * w, y + h]], fill: p.color, sw: 2.5 })
      if (opts.each) labels.push({ x: i * w + w / 2, y: y + h / 2, t: opts.each, color: HELP, small: true })
    }
    labels.push({ x: -0.4, y: y + h / 2, t: p.name, anchor: 'end', small: true })
  })
  const maxBoxes = Math.max(...parts.map((p) => p.boxes))
  if (opts.total) labels.push({ x: maxBoxes * w + 0.4, y: ((parts.length - 1) * 1.4 + h) / 2, t: opts.total, anchor: 'start' })
  const nameW = Math.max(...parts.map((p) => p.name.length)) * 0.27 + 0.8
  return { x0: -nameW, x1: maxBoxes * w + (opts.total ? 3.2 : 0.6), y0: -0.4, y1: (parts.length - 1) * 1.4 + h + 0.4, alt, polys, labels }
}

/* ---------- 10 × 10 grid for percents ---------- */
export function hundredGrid(shaded: number, alt: string): FigureSpec {
  const polys: FigPoly[] = []
  const s = 0.5
  for (let i = 0; i < 100; i++) {
    const c = i % 10, r = Math.floor(i / 10)
    polys.push({ pts: [[c * s, r * s], [(c + 1) * s, r * s], [(c + 1) * s, (r + 1) * s], [c * s, (r + 1) * s]], fill: i < shaded ? COLORS.a : '#fff', sw: 1 })
  }
  return { x0: -0.3, x1: 5.3, y0: -0.3, y1: 5.3, alt, polys }
}
