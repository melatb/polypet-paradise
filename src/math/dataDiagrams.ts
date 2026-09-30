/** Diagrams for signed numbers, the coordinate plane and data displays (math coords, y up). */
import { HELP, INK } from './Figure'
import type { FigLabel, FigPoly, FigSeg, FigureSpec } from './types'

/** Prints negatives with a real minus sign: -3 → "−3". */
export const sn = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n))

/** Horizontal number line from lo to hi, one unit per tick, with optional labeled points. */
export function numberLine(lo: number, hi: number, points: { v: number; t: string; color?: string }[], alt: string, every = 1): FigureSpec {
  const n = hi - lo
  const u = Math.min(1.2, 16 / n)
  const X = (v: number) => (v - lo) * u
  const segs: FigSeg[] = [{ a: [-0.4, 0], b: [X(hi) + 0.4, 0], color: INK, solid: true }]
  const labels: FigLabel[] = []
  for (let v = lo; v <= hi; v++) {
    const big = v % every === 0
    segs.push({ a: [X(v), -0.2], b: [X(v), big ? 0.25 : 0.12], color: v === 0 ? INK : '#8C9AB5', solid: true })
    if (big) labels.push({ x: X(v), y: -0.6, t: sn(v), small: true })
  }
  const dots = points.map((p) => ({ x: X(p.v), y: 0, color: p.color }))
  for (const p of points) labels.push({ x: X(p.v), y: 0.75, t: p.t, color: p.color === '#FFD23F' ? INK : HELP })
  return { x0: -0.9, x1: X(hi) + 0.9, y0: -1.1, y1: 1.3, alt, segs, labels, dots }
}

/** Graph of x > k, x ≥ k, x < k or x ≤ k: a circle at k (filled if included) and a thick ray. */
export function inequalityLine(k: number, dir: '<' | '>', closed: boolean, alt: string): FigureSpec {
  const lo = k - 6, hi = k + 6
  const base = numberLine(lo, hi, [], alt, 2)
  const u = Math.min(1.2, 16 / 12)
  const X = (v: number) => (v - lo) * u
  const end = dir === '>' ? X(hi) + 0.35 : -0.35
  base.segs!.push({ a: [X(k), 0.02], b: [end, 0.02], color: '#E0287D', solid: true }, { a: [X(k), 0.1], b: [end, 0.1], color: '#E0287D', solid: true })
  base.polys = [{ pts: dir === '>' ? [[end + 0.2, 0.06], [end - 0.15, 0.3], [end - 0.15, -0.18]] : [[end - 0.2, 0.06], [end + 0.15, 0.3], [end + 0.15, -0.18]], fill: '#E0287D', sw: 1 }]
  base.dots = [{ x: X(k), y: 0.06, color: closed ? '#E0287D' : '#FFFFFF' }]
  return base
}

/** Four-quadrant grid from −m to m with optional points. */
export function coordPlane(m: number, points: { x: number; y: number; t?: string; color?: string }[], alt: string, extraSegs: FigSeg[] = []): FigureSpec {
  const segs: FigSeg[] = []
  const labels: FigLabel[] = []
  for (let i = -m; i <= m; i++) {
    segs.push({ a: [i, -m], b: [i, m], color: i === 0 ? INK : '#D9E6F2', solid: true })
    segs.push({ a: [-m, i], b: [m, i], color: i === 0 ? INK : '#D9E6F2', solid: true })
    if (i !== 0 && i % 2 === 0) { labels.push({ x: i, y: -0.45, t: sn(i), small: true }); labels.push({ x: -0.35, y: i, t: sn(i), small: true, anchor: 'end' }) }
  }
  labels.push({ x: m + 0.4, y: 0.35, t: 'x', small: true }, { x: 0.4, y: m + 0.4, t: 'y', small: true })
  for (const p of points) if (p.t) labels.push({ x: p.x + 0.5, y: p.y + 0.5, t: p.t, color: HELP })
  return { x0: -m - 0.8, x1: m + 0.9, y0: -m - 0.8, y1: m + 0.9, alt, segs: [...segs, ...extraSegs], labels, dots: points.map((p) => ({ x: p.x, y: p.y, color: p.color })) }
}

/** Dot plot: a stack of dots above each value. */
export function dotPlot(values: number[], lo: number, hi: number, title: string, alt: string): FigureSpec {
  const n = hi - lo
  const u = Math.min(1.1, 14 / n)
  const X = (v: number) => (v - lo) * u
  const segs: FigSeg[] = [{ a: [-0.3, 0], b: [X(hi) + 0.3, 0], color: INK, solid: true }]
  const labels: FigLabel[] = []
  for (let v = lo; v <= hi; v++) { segs.push({ a: [X(v), -0.15], b: [X(v), 0.15], color: INK, solid: true }); labels.push({ x: X(v), y: -0.55, t: v, small: true }) }
  const counts = new Map<number, number>()
  const dots: { x: number; y: number; color?: string }[] = []
  for (const v of values) { const c = (counts.get(v) ?? 0) + 1; counts.set(v, c); dots.push({ x: X(v), y: c * 0.5 }) }
  const top = Math.max(...counts.values()) * 0.5
  labels.push({ x: X(hi) / 2, y: -1.15, t: title, small: true })
  return { x0: -0.8, x1: X(hi) + 0.8, y0: -1.5, y1: top + 0.6, alt, segs, labels, dots }
}

/** Histogram with equal-width bins; `counts[i]` is the height of the bin starting at lo + i·w. */
export function histogram(counts: number[], lo: number, w: number, title: string, alt: string): FigureSpec {
  const bw = Math.min(1.6, 12 / counts.length)
  const max = Math.max(...counts)
  const sy = 5 / Math.max(max, 1)
  const polys: FigPoly[] = counts.map((c, i) => ({ pts: [[i * bw, 0], [(i + 1) * bw, 0], [(i + 1) * bw, c * sy], [i * bw, c * sy]], fill: '#7FD0FF', sw: 2 }))
  const labels: FigLabel[] = []
  const segs: FigSeg[] = [{ a: [0, 0], b: [counts.length * bw + 0.3, 0], color: INK, solid: true }, { a: [0, 0], b: [0, max * sy + 0.3], color: INK, solid: true }]
  for (let i = 0; i <= counts.length; i++) labels.push({ x: i * bw, y: -0.5, t: lo + i * w, small: true })
  for (let c = 1; c <= max; c++) if (max <= 8 || c % 2 === 0) { labels.push({ x: -0.35, y: c * sy, t: c, small: true, anchor: 'end' }); segs.push({ a: [0, c * sy], b: [counts.length * bw, c * sy], color: '#D9E6F2', solid: true }) }
  labels.push({ x: (counts.length * bw) / 2, y: -1.1, t: title, small: true })
  return { x0: -1.4, x1: counts.length * bw + 0.8, y0: -1.5, y1: max * sy + 0.7, alt, polys, segs, labels }
}

/** Box plot for a five-number summary over a number line. */
export function boxPlot(s: [number, number, number, number, number], lo: number, hi: number, step: number, title: string, alt: string, showNumbers = false): FigureSpec {
  const u = 14 / (hi - lo)
  const X = (v: number) => (v - lo) * u
  const [mn, q1, med, q3, mx] = s
  const y0 = 1, y1 = 2.4, ym = 1.7
  const segs: FigSeg[] = [{ a: [-0.3, 0], b: [X(hi) + 0.3, 0], color: INK, solid: true }]
  const labels: FigLabel[] = []
  for (let v = lo; v <= hi; v += step) { segs.push({ a: [X(v), -0.15], b: [X(v), 0.15], color: INK, solid: true }); labels.push({ x: X(v), y: -0.55, t: v, small: true }) }
  segs.push(
    { a: [X(mn), ym], b: [X(q1), ym], color: INK, solid: true }, { a: [X(q3), ym], b: [X(mx), ym], color: INK, solid: true },
    { a: [X(mn), y0 + 0.3], b: [X(mn), y1 - 0.3], color: INK, solid: true }, { a: [X(mx), y0 + 0.3], b: [X(mx), y1 - 0.3], color: INK, solid: true },
    { a: [X(med), y0], b: [X(med), y1], color: HELP, solid: true },
  )
  if (showNumbers) [mn, q1, med, q3, mx].forEach((v) => labels.push({ x: X(v), y: y1 + 0.45, t: v, small: true, color: HELP }))
  labels.push({ x: X(hi) / 2, y: -1.15, t: title, small: true })
  return { x0: -0.8, x1: X(hi) + 0.8, y0: -1.5, y1: y1 + (showNumbers ? 0.9 : 0.4), alt, polys: [{ pts: [[X(q1), y0], [X(q3), y0], [X(q3), y1], [X(q1), y1]], fill: '#FFD1E6', sw: 3 }], segs, labels }
}
