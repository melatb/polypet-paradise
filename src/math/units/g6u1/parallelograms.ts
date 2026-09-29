/**
 * Grade 6, Unit 1 — section "Parallelograms".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { HELP, INK, SHAPE2 } from '../../Figure'
import type { FigureSpec, MiniShape, Pt, Question, QuestionType } from '../../types'

/* ---------- shapes for "which is a parallelogram?" ---------- */
const PARAS: { pts: Pt[]; name: string }[] = [
  { pts: [[14, 66], [56, 66], [76, 26], [34, 26]], name: 'parallelogram' },
  { pts: [[34, 66], [76, 66], [56, 26], [14, 26]], name: 'parallelogram' },
  { pts: [[16, 28], [74, 28], [74, 64], [16, 64]], name: 'rectangle' },
  { pts: [[45, 14], [74, 46], [45, 78], [16, 46]], name: 'rhombus' },
  { pts: [[22, 22], [68, 22], [68, 68], [22, 68]], name: 'square' },
]
const NOT_PARAS: { pts: Pt[]; why: string }[] = [
  { pts: [[12, 68], [78, 68], [60, 26], [30, 26]], why: 'Only one pair of its sides is parallel. That makes it a trapezoid.' },
  { pts: [[45, 12], [66, 34], [45, 80], [24, 34]], why: "Its opposite sides aren't parallel. It's a kite." },
  { pts: [[14, 70], [72, 62], [62, 24], [28, 34]], why: 'None of its sides are parallel.' },
  { pts: [[45, 16], [78, 72], [12, 72]], why: 'It only has 3 sides.' },
]
const mini = (pts: Pt[]): MiniShape => ({ kind: 'polygon', pts })

function spotParallelogram(): Question {
  if (Math.random() < 0.6) {
    const good = pick(PARAS)
    const special = good.name !== 'parallelogram'
    return {
      name: 'Spot the parallelogram', prompt: 'Which one is a parallelogram?',
      choices: shuffle([{ shape: mini(good.pts), ok: true }, ...shuffle(NOT_PARAS).slice(0, 3).map((n) => ({ shape: mini(n.pts), ok: false, why: n.why }))]),
      hint: 'A parallelogram has 4 sides, and both pairs of opposite sides are parallel.',
      solution: special ? `A ${good.name} counts! Both pairs of opposite sides are parallel.` : 'Both pairs of its opposite sides are parallel.',
    }
  }
  const bad = pick(NOT_PARAS)
  return {
    name: 'Spot the parallelogram', prompt: 'Which one is NOT a parallelogram?',
    choices: shuffle([
      { shape: mini(bad.pts), ok: true },
      ...shuffle(PARAS).slice(0, 3).map((p) => ({ shape: mini(p.pts), ok: false, why: `That one is a ${p.name}, and ${p.name === 'parallelogram' ? 'it' : 'every ' + p.name} has two pairs of parallel sides.` })),
    ]),
    hint: 'Check each shape: are BOTH pairs of opposite sides parallel?',
    solution: bad.why,
  }
}

function gridParallelogram(): Question {
  const b = R(3, 7), h = R(2, 5)
  let o = R(-2, 3)
  if (o === 0) o = 2
  const hx = o >= 0 ? o : b + o
  return {
    name: 'Parallelogram on a grid',
    prompt: 'Each grid square is 1 square unit. What is the area of the parallelogram?',
    unit: 'square units', answer: b * h,
    commonSlip: { value: (b * h) / 2, message: "Halving is for triangles. A parallelogram's area is base × height." },
    figure: (help) => ({
      x0: Math.min(0, o) - 1, x1: Math.max(b, b + o) + 1, y0: -1, y1: h + 1, grid: true, alt: 'Parallelogram on a grid',
      polys: [{ pts: [[0, 0], [b, 0], [b + o, h], [o, h]] }],
      segs: help ? [{ a: [hx, h], b: [hx, 0] }] : [],
      marks: help ? [{ p: [hx, 0], dx: [1, 0], dy: [0, 1], color: HELP }] : [],
      labels: help ? [{ x: b / 2, y: -0.5, t: `base ${b}` }, { x: hx + 0.6, y: h / 2, t: h, color: HELP }] : [],
    }),
    hint: 'Base = the bottom side (count the squares). Height = straight up from the base to the top side, at a right angle.',
    solution: `base ${b} × height ${h} = ${b * h} square units`,
  }
}

function labeledParallelogram(): Question {
  const [o, h, s] = pick([[3, 4, 5], [4, 3, 5]] as const)
  const b = R(4, 9), unit = pick(['cm', 'in', 'ft', 'm'])
  return {
    name: 'Base times height',
    prompt: 'What is the area of this parallelogram?',
    unit: `square ${unit}`, answer: b * h,
    commonSlip: { value: b * s, message: 'That used the slanted side. Use the height that meets the base at a right angle.' },
    figure: () => ({
      x0: -2, x1: b + o + 1, y0: -1.2, y1: h + 0.7, alt: `Parallelogram, base ${b}, slanted side ${s}, height ${h}`,
      polys: [{ pts: [[0, 0], [b, 0], [b + o, h], [o, h]], fill: SHAPE2 }],
      segs: [{ a: [o, h], b: [o, 0], color: INK }],
      marks: [{ p: [o, 0], dx: [1, 0], dy: [0, 1] }],
      labels: [{ x: b / 2, y: -0.6, t: `${b} ${unit}` }, { x: o + 0.8, y: h / 2, t: `${h}` }, { x: o / 2 - 0.9, y: h / 2 + 0.2, t: `${s}` }],
    }),
    hint: 'Area of a parallelogram = base × height. The height is the dashed segment at a right angle, not the slanted side.',
    solution: `${b} × ${h} = ${b * h} square ${unit}`,
  }
}

/* ---------- Two bases, two heights (like Elena and Noah's problem) ---------- */
export interface HeightPair { b1: number; h1: number; b2: number; h2: number; o: number; k: number }
export const HEIGHT_PAIRS: HeightPair[] = [
  { b1: 9, h1: 6, b2: 7.5, h2: 7.2, o: 4.5, k: 0.67 },
  { b1: 8, h1: 6, b2: 10, h2: 4.8, o: 8, k: 0.56 },
  { b1: 15, h1: 8, b2: 10, h2: 12, o: 6, k: 0.43 },
]
const BLUE = '#3B8BFF'
/** `show`: which base/height pair to highlight (1 = bottom side, 2 = slanted side), or both. */
export function heightPairFigure(p: HeightPair, show: 0 | 1 | 2 = 0): FigureSpec {
  const { b1, h1, b2, o, k } = p
  const A: Pt = [0, 0], B: Pt = [b1 * k, 0], C: Pt = [(b1 + o) * k, h1 * k], D: Pt = [o * k, h1 * k]
  const u: Pt = [o / b2, h1 / b2]
  const along = (b1 * o) / b2
  const F: Pt = [u[0] * along * k, u[1] * along * k]
  const perp: Pt = [(B[0] - F[0]) / Math.hypot(B[0] - F[0], B[1] - F[1]), (B[1] - F[1]) / Math.hypot(B[0] - F[0], B[1] - F[1])]
  const dim1 = show === 2 ? '#C9D3E3' : HELP, dim2 = show === 1 ? '#C9D3E3' : BLUE
  const extend = along > b2 ? [{ a: D, b: F, color: '#9AA6BD' }] : []
  return {
    x0: -1.8, x1: C[0] + 1, y0: -1.2, y1: C[1] + 0.8, alt: 'Parallelogram with two sides and two dashed heights labeled',
    polys: [{ pts: [A, B, C, D], fill: SHAPE2 }],
    segs: [{ a: D, b: [D[0], 0], color: dim1 }, { a: B, b: F, color: dim2 }, ...extend],
    marks: [{ p: [D[0], 0], dx: [1, 0], dy: [0, 1], color: dim1 }, { p: F, dx: u, dy: perp, color: dim2 }],
    labels: [
      { x: B[0] * 0.66, y: -0.55, t: p.b1, color: show === 1 ? HELP : INK },
      { x: D[0] / 2 - 0.7, y: D[1] / 2 + 0.3, t: p.b2, color: show === 2 ? BLUE : INK },
      { x: D[0] + 0.55, y: D[1] / 3, t: p.h1, color: dim1 },
      // Nudge the slanted height's label along the side it's parallel to, so it sits beside its dashed line.
      { x: (B[0] + F[0]) / 2 + u[0] * 0.6, y: (B[1] + F[1]) / 2 + u[1] * 0.6, t: p.h2, color: dim2 },
    ],
  }
}

function matchingHeight(): Question {
  const p = pick(HEIGHT_PAIRS)
  if (Math.random() < 0.5) {
    const useSlanted = Math.random() < 0.5
    const base = useSlanted ? p.b2 : p.b1, right = useSlanted ? p.h2 : p.h1, wrong = useSlanted ? p.h1 : p.h2
    return {
      name: 'Matching height',
      prompt: `If the side that is ${fmt(base)} units long is the base, which length is its matching height?`,
      figure: () => heightPairFigure(p),
      choices: shuffle([
        { label: `${fmt(right)} units`, ok: true },
        { label: `${fmt(wrong)} units`, ok: false, why: `That height meets the ${fmt(useSlanted ? p.b1 : p.b2)} side at a right angle, not this one.` },
        { label: `${fmt(useSlanted ? p.b1 : p.b2)} units`, ok: false, why: "That's the other side, not a height." },
      ]),
      hint: 'A matching height must meet the base at a right angle. Look for the little square where each dashed line lands.',
      solution: `The ${fmt(right)} height is perpendicular to the ${fmt(base)} side.`,
    }
  }
  const area = p.b1 * p.h1
  const vals = [...new Set([area, p.b1 * p.h2, p.b2 * p.h1, p.b1 * p.b2])]
  return {
    name: 'Matching height',
    prompt: 'What is the area of this parallelogram?',
    figure: () => heightPairFigure(p),
    choices: shuffle(vals.map((v) => ({
      label: `${fmt(v)} sq units`, ok: v === area,
      why: v === p.b1 * p.b2 ? "That multiplies two sides. You need a base and its matching height." : "That mixed a base with the other side's height.",
    }))),
    hint: 'Pick one base and use the height that meets it at a right angle. Either pair gives the same answer!',
    solution: `${fmt(p.b1)} × ${fmt(p.h1)} = ${fmt(area)}, and ${fmt(p.b2)} × ${fmt(p.h2)} = ${fmt(area)} too.`,
  }
}

function missingHeight(): Question {
  const b = R(3, 12), h = R(2, 10), A = b * h, askH = Math.random() < 0.6
  const o = R(1, 3)
  const k = Math.min(1, 8 / (b + o))
  return {
    name: 'Missing measurement',
    prompt: askH ? `A parallelogram has an area of ${A} square units and a base of ${b} units. What is its height?`
      : `A parallelogram has an area of ${A} square units and a height of ${h} units. How long is its base?`,
    unit: 'units', answer: askH ? h : b,
    figure: () => ({
      x0: -1, x1: (b + o) * k + 1, y0: -1.2, y1: Math.min(h, 6) + 0.6, alt: 'Parallelogram with one measurement missing',
      polys: [{ pts: [[0, 0], [b * k, 0], [(b + o) * k, Math.min(h, 6)], [o * k, Math.min(h, 6)]] }],
      segs: [{ a: [o * k, Math.min(h, 6)], b: [o * k, 0] }],
      labels: [{ x: (b * k) / 2, y: -0.6, t: askH ? b : '?' }, { x: o * k + 0.6, y: Math.min(h, 6) / 2, t: askH ? '?' : h, color: HELP }],
    }),
    hint: `Area = base × height. What times ${askH ? b : h} makes ${A}?`,
    solution: askH ? `${A} ÷ ${b} = ${h} units` : `${A} ÷ ${h} = ${b} units`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['A parallelogram has two pairs of parallel sides.', true, "That's what makes it a parallelogram."],
  ['A rectangle is a parallelogram.', true, 'Its opposite sides are parallel, so it counts.'],
  ['Any side of a parallelogram can be used as the base.', true, 'Pick any side, then use the height that meets it at a right angle.'],
  ["The height of a parallelogram is the length of its slanted side.", false, 'The height must be perpendicular (at a right angle) to the base.'],
  ["You can cut a parallelogram and rearrange the pieces into a rectangle with the same area.", true, 'Slide the triangle from one end to the other.'],
  ['The area of a parallelogram is ½ × base × height.', false, 'The ½ is for triangles. A parallelogram is base × height.'],
  ['A trapezoid is a parallelogram.', false, 'A trapezoid has only one pair of parallel sides.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return {
    name: 'True or false', prompt: statement,
    choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }],
    hint: 'Think about parallel sides and heights.', solution: why,
  }
}

export const parallelogramQuestionTypes: QuestionType[] = [
  { id: 'spotPara', name: 'Spotting parallelograms', unlockLevel: 1, make: spotParallelogram },
  { id: 'gridPara', name: 'Parallelograms on a grid', unlockLevel: 1, make: gridParallelogram },
  { id: 'paraTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'labeledPara', name: 'Base times height', unlockLevel: 2, make: labeledParallelogram },
  { id: 'matchHeight', name: 'Matching heights', unlockLevel: 3, make: matchingHeight },
  { id: 'missingPara', name: 'Missing base or height', unlockLevel: 4, make: missingHeight },
]
