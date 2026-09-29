/**
 * Grade 6, Unit 1 (Area and Surface Area) — section "Triangles and Other Polygons".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { HELP, INK, SHAPE2 } from '../../Figure'
import type { FigSeg, MiniShape, Pt, Question, QuestionContext, QuestionType } from '../../types'

function rightTriangle(): Question {
  const b = R(2, 8), h = R(2, 7), unit = pick(['cm', 'in', 'ft', 'm'])
  const right = Math.random() < 0.5
  const pts: Pt[] = right ? [[0, 0], [b, 0], [b, h]] : [[0, 0], [b, 0], [0, h]]
  const vx = right ? b : 0
  return {
    name: 'Right triangle',
    prompt: 'Find the area of this right triangle.',
    unit: `square ${unit}`,
    answer: (b * h) / 2,
    commonSlip: { value: b * h, message: 'That is the whole rectangle. Did you forget the ½?' },
    figure: (help) => ({
      x0: -2.2, x1: b + 2.2, y0: -1.2, y1: h + 0.6,
      alt: `Right triangle, base ${b} ${unit}, height ${h} ${unit}`,
      polys: [...(help ? [{ pts: [[0, 0], [b, 0], [b, h], [0, h]] as Pt[], fill: 'none', stroke: HELP, dash: true }] : []), { pts }],
      marks: [{ p: [vx, 0], dx: [right ? -1 : 1, 0], dy: [0, 1] }],
      labels: [{ x: b / 2, y: -0.65, t: `${b} ${unit}` }, { x: right ? b + 1.1 : -1.1, y: h / 2, t: `${h} ${unit}` }],
    }),
    hint: `A right triangle is exactly half of a ${b} by ${h} rectangle (dashed). Find the rectangle's area, then take half.`,
    solution: `½ × ${b} × ${h} = ${fmt((b * h) / 2)} square ${unit}`,
  }
}

function gridTriangle({ level }: QuestionContext): Question {
  const b = R(3, 8), h = R(2, 6)
  const outside = level >= 4 && Math.random() < 0.55
  const ax = outside ? (Math.random() < 0.5 ? -R(1, 3) : b + R(1, 3)) : R(0, b)
  const help: FigSeg[] = [{ a: [ax, h], b: [ax, 0] }]
  if (ax < 0) help.push({ a: [ax, 0], b: [0, 0] })
  if (ax > b) help.push({ a: [b, 0], b: [ax, 0] })
  return {
    name: outside ? 'Tricky height' : 'Triangle on a grid',
    prompt: 'Each grid square is 1 square unit. What is the area of the triangle?',
    unit: 'square units',
    answer: (b * h) / 2,
    commonSlip: { value: b * h, message: 'Close! Did you forget the ½?' },
    figure: (hp) => ({
      x0: Math.min(0, ax) - 1, x1: Math.max(b, ax) + 1, y0: -1, y1: h + 1, grid: true,
      alt: 'Triangle on a grid',
      polys: [{ pts: [[0, 0], [b, 0], [ax, h]] }],
      segs: hp ? help : [],
      marks: hp ? [{ p: [ax, 0], dx: [ax > b / 2 ? -1 : 1, 0], dy: [0, 1], color: HELP }] : [],
      labels: hp ? [{ x: b / 2, y: -0.5, t: `base ${b}` }, { x: ax + (ax > b / 2 ? 0.7 : -0.7), y: h / 2, t: h, color: HELP }] : [],
    }),
    hint: outside
      ? `The height doesn't have to be inside the triangle. Extend the base line (dashed) and count straight down from the top corner. Base = ${b}.`
      : 'Base = the bottom side, count the squares. Height = count straight down from the top corner to the base, at a right angle.',
    solution: `base ${b}, height ${h}: ½ × ${b} × ${h} = ${fmt((b * h) / 2)} square units`,
  }
}

function parallelogram(): Question {
  const [o, h, s] = pick([[3, 4, 5], [4, 3, 5]] as const)
  const b = pick([6, 7, 8]) // never equal to the height or the slanted side, so answer choices stay distinct
  const fig = () => ({
    x0: -2, x1: b + o + 1, y0: -1.2, y1: h + 0.7,
    alt: `Parallelogram, base ${b}, slanted side ${s}, height ${h}`,
    polys: [{ pts: [[0, 0], [b, 0], [b + o, h], [o, h]] as Pt[], fill: SHAPE2 }],
    segs: [{ a: [o, h] as Pt, b: [o, 0] as Pt, color: INK }],
    marks: [{ p: [o, 0] as Pt, dx: [1, 0] as Pt, dy: [0, 1] as Pt }],
    labels: [{ x: b / 2, y: -0.6, t: b }, { x: o + 0.55, y: h / 2, t: h }, { x: o / 2 - 0.75, y: h / 2 + 0.2, t: s }],
  })
  if (Math.random() < 0.35) {
    return {
      name: 'Which height?',
      prompt: `The side that is ${b} units long is the base. Which length is its matching height?`,
      figure: fig,
      choices: shuffle([
        { label: `${h} units`, ok: true },
        { label: `${s} units`, ok: false, why: `The ${s} side is slanted. A height has to meet the base at a right angle.` },
        { label: `${b} units`, ok: false, why: "That's the base itself." },
      ]),
      hint: 'Look for the dashed segment with the little square. It meets the base at a right angle.',
      solution: `The height is ${h}: it's perpendicular to the base of ${b}.`,
    }
  }
  const values = [...new Set([b * h, b * s, (b * h) / 2, 2 * (b + s)])]
  return {
    name: 'Parallelogram',
    prompt: 'What is the area of this parallelogram?',
    figure: fig,
    choices: shuffle(values.map((v) => ({
      label: `${fmt(v)} sq units`,
      ok: v === b * h,
      why: v === b * s ? 'That used the slanted side. Use the height that meets the base at a right angle.'
        : v === (b * h) / 2 ? 'Halving is for triangles. A parallelogram is base × height.'
        : 'That adds up the sides (perimeter), not the area.',
    }))),
    hint: 'Area of a parallelogram = base × height. The height is the dashed line at a right angle, not the slanted side.',
    solution: `${b} × ${h} = ${b * h} square units`,
  }
}

function trianglePairs(): Question {
  const b = R(3, 7), h = R(2, 5), o = R(1, 3), P = b * h
  const figure = () => ({
    x0: -0.8, x1: b + o + 0.8, y0: -0.8, y1: h + 0.8, grid: true,
    alt: 'Parallelogram cut into two triangles',
    polys: [{ pts: [[b, 0], [b + o, h], [o, h]] as Pt[], fill: '#fff' }, { pts: [[0, 0], [b, 0], [o, h]] as Pt[] }],
    segs: [{ a: [b, 0] as Pt, b: [o, h] as Pt, color: INK }],
  })
  if (Math.random() < 0.6) {
    return {
      name: 'Triangle pairs',
      prompt: `This parallelogram has an area of ${P} square units. The line cuts it into two matching triangles. What is the area of the pink triangle?`,
      unit: 'square units', answer: P / 2, figure,
      hint: 'Two copies of the same triangle make the whole parallelogram, so one triangle is half of it.',
      solution: `${P} ÷ 2 = ${fmt(P / 2)} square units`,
    }
  }
  return {
    name: 'Triangle pairs',
    prompt: `The pink triangle has an area of ${fmt(P / 2)} square units. Two copies of it make this parallelogram. What is the parallelogram's area?`,
    unit: 'square units', answer: P, figure,
    hint: 'The parallelogram is made of two copies of the triangle.',
    solution: `2 × ${fmt(P / 2)} = ${P} square units`,
  }
}

function polygonPuzzle(): Question {
  const base = {
    name: 'Polygon puzzle',
    prompt: 'Each grid square is 1 square unit. Find the area of this polygon. Tip: cut it into triangles and rectangles.',
    unit: 'square units',
  }
  const sub = pick(['kite', 'house', 'trap'] as const)
  if (sub === 'kite') {
    const d = R(4, 8), h1 = R(1, 4), h2 = R(1, 4), p = R(1, d - 1), q = R(1, d - 1)
    const A = (d * h1) / 2 + (d * h2) / 2
    return {
      ...base, answer: A,
      figure: (hp) => ({
        x0: -1, x1: d + 1, y0: -h2 - 1, y1: h1 + 1, grid: true, alt: 'Four-sided polygon',
        polys: [{ pts: [[0, 0], [p, h1], [d, 0], [q, -h2]] }],
        segs: hp ? [{ a: [0, 0], b: [d, 0], color: INK }, { a: [p, h1], b: [p, 0] }, { a: [q, -h2], b: [q, 0] }] : [],
        labels: hp ? [{ x: p + 0.55, y: h1 / 2, t: h1, color: HELP }, { x: q + 0.55, y: -h2 / 2, t: h2, color: HELP }] : [],
      }),
      hint: `Cut along the dashed line into two triangles that share a base of ${d}. Find each triangle's area and add them.`,
      solution: `½ × ${d} × ${h1} + ½ × ${d} × ${h2} = ${fmt((d * h1) / 2)} + ${fmt((d * h2) / 2)} = ${fmt(A)} square units`,
    }
  }
  if (sub === 'house') {
    const w = R(3, 7), r = R(2, 4), t = R(1, 3), px = R(1, w - 1), A = w * r + (w * t) / 2
    return {
      ...base, answer: A,
      figure: (hp) => ({
        x0: -1, x1: w + 1, y0: -1, y1: r + t + 1, grid: true, alt: 'House-shaped pentagon',
        polys: [{ pts: [[0, 0], [w, 0], [w, r], [px, r + t], [0, r]] }],
        segs: hp ? [{ a: [0, r], b: [w, r], color: INK }, { a: [px, r + t], b: [px, r] }] : [],
      }),
      hint: `Cut it into a ${w} by ${r} rectangle on the bottom and a triangle on top with base ${w}.`,
      solution: `${w} × ${r} + ½ × ${w} × ${t} = ${w * r} + ${fmt((w * t) / 2)} = ${fmt(A)} square units`,
    }
  }
  const b = R(5, 9), h = R(2, 4), L = R(1, 2), Rr = R(1, 2), a = b - L - Rr
  const A = a * h + (L * h) / 2 + (Rr * h) / 2
  return {
    ...base, answer: A,
    figure: (hp) => ({
      x0: -1, x1: b + 1, y0: -1, y1: h + 1, grid: true, alt: 'Trapezoid',
      polys: [{ pts: [[0, 0], [b, 0], [L + a, h], [L, h]] }],
      segs: hp ? [{ a: [L, h], b: [L, 0] }, { a: [L + a, h], b: [L + a, 0] }] : [],
    }),
    hint: 'Cut it into a rectangle in the middle and a triangle on each side.',
    solution: `½ × ${L} × ${h} + ${a} × ${h} + ½ × ${Rr} × ${h} = ${fmt((L * h) / 2)} + ${a * h} + ${fmt((Rr * h) / 2)} = ${fmt(A)} square units`,
  }
}

function missingMeasure(): Question {
  const b = R(3, 10), h = R(2, 9), A = (b * h) / 2, askH = Math.random() < 0.6, c = R(1, b - 1)
  return {
    name: 'Missing measurement',
    prompt: askH
      ? `This triangle has an area of ${fmt(A)} square units and a base of ${b} units. What is its height?`
      : `This triangle has an area of ${fmt(A)} square units and a height of ${h} units. How long is its base?`,
    unit: 'units',
    answer: askH ? h : b,
    figure: () => ({
      x0: -1, x1: b + 1, y0: -1.2, y1: h + 0.6, alt: 'Triangle with one measurement missing',
      polys: [{ pts: [[0, 0], [b, 0], [c, h]] }],
      segs: [{ a: [c, h], b: [c, 0] }],
      marks: [{ p: [c, 0], dx: [1, 0], dy: [0, 1], color: HELP }],
      labels: [{ x: b / 2, y: -0.6, t: askH ? b : '?' }, { x: c + 0.6, y: h / 2, t: askH ? '?' : h, color: HELP }],
    }),
    hint: `Area = ½ × base × height, so base × height = 2 × ${fmt(A)} = ${2 * A}.`,
    solution: askH ? `${2 * A} ÷ ${b} = ${h} units` : `${2 * A} ÷ ${h} = ${b} units`,
  }
}

/* ---------- polygon spotting ---------- */
function randomPolygon(star = false): MiniShape {
  const pts: Pt[] = []
  if (star) {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 13 : 32
      pts.push([+(45 + r * Math.cos(a)).toFixed(1), +(48 + r * Math.sin(a)).toFixed(1)])
    }
  } else {
    const n = R(3, 7)
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n + (Math.random() - 0.5) * 0.35, r = 26 + R(-4, 6)
      pts.push([+(45 + r * Math.cos(a)).toFixed(1), +(47 + r * Math.sin(a)).toFixed(1)])
    }
  }
  return { kind: 'polygon', pts }
}
const NOT_POLYGON = {
  curve: 'It has a curved side. Polygons only use straight segments.',
  open: "It doesn't close up.",
  bowtie: 'Its sides cross in the middle. Sides may only meet at their endpoints.',
  circle: 'A circle has no straight sides at all.',
} as const
type NotPoly = keyof typeof NOT_POLYGON

function polygonSpotting(): Question {
  const kinds = Object.keys(NOT_POLYGON) as NotPoly[]
  if (Math.random() < 0.6) {
    const star = Math.random() < 0.33
    return {
      name: 'Polygon spotting',
      prompt: 'Which one is a polygon?',
      choices: shuffle([
        { shape: randomPolygon(star), ok: true },
        ...shuffle(kinds).slice(0, 3).map((k) => ({ shape: { kind: k } as MiniShape, ok: false, why: NOT_POLYGON[k] })),
      ]),
      hint: 'A polygon is made of straight line segments that close up and meet only at their endpoints.',
      solution: star ? 'The star counts! Its 10 straight sides close up and only meet at corners.'
        : 'It has straight sides that close up and meet only at their endpoints.',
    }
  }
  const bad = pick(kinds)
  return {
    name: 'Polygon spotting',
    prompt: 'Which one is NOT a polygon?',
    choices: shuffle([
      { shape: { kind: bad } as MiniShape, ok: true },
      { shape: randomPolygon(), ok: false, why: 'That one is a polygon: straight sides, closed up.' },
      { shape: randomPolygon(), ok: false, why: 'That one is a polygon: straight sides, closed up.' },
      { shape: randomPolygon(Math.random() < 0.5), ok: false, why: 'That one is a polygon, even if it looks spiky.' },
    ]),
    hint: 'Look for a curve, a gap, or sides that cross.',
    solution: NOT_POLYGON[bad],
  }
}

const FACTS: [string, boolean, string][] = [
  ['Any side of a triangle can be used as its base.', true, 'Pick any side. The height is then measured at a right angle to that side.'],
  ['The height of a triangle always has to be inside the triangle.', false, 'In a very slanted triangle the height lands outside. You extend the base line to meet it.'],
  ['A height always meets its base at a right angle.', true, 'That little square symbol means a right angle.'],
  ['The area of a triangle is base × height.', false, 'That is the parallelogram rule. A triangle is half: ½ × base × height.'],
  ['Two copies of any triangle can be put together to make a parallelogram.', true, 'Rotate a copy and snap it on. That is why a triangle is half a parallelogram.'],
  ['You can use a slanted side as the height of a parallelogram.', false, 'The height has to be perpendicular (at a right angle) to the base.'],
  ['Triangles, quadrilaterals, pentagons and hexagons are all polygons.', true, 'They are all made of straight segments that close up.'],
  ["You can find a polygon's area by cutting it into triangles and rectangles and adding the pieces.", true, 'Decomposing is a great strategy!'],
  ['Two shapes that match up exactly have the same area.', true, 'If one fits perfectly on top of the other, they cover the same amount of space.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return {
    name: 'True or false',
    prompt: statement,
    choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }],
    hint: 'Think about what base and height mean.',
    solution: why,
  }
}

export const polygonQuestionTypes: QuestionType[] = [
  { id: 'rightTri', name: 'Right triangles', unlockLevel: 1, make: rightTriangle },
  { id: 'polySpot', name: 'Polygon spotting', unlockLevel: 1, make: polygonSpotting },
  { id: 'trueFalse', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'gridTri', name: 'Triangles on a grid', unlockLevel: 2, make: gridTriangle },
  { id: 'para', name: 'Parallelograms', unlockLevel: 2, make: parallelogram },
  { id: 'pairs', name: 'Triangle pairs', unlockLevel: 2, make: trianglePairs },
  { id: 'polyPuzzle', name: 'Polygon puzzles', unlockLevel: 3, make: polygonPuzzle },
  { id: 'missing', name: 'Missing base or height', unlockLevel: 4, make: missingMeasure },
  { id: 'trickyHeight', name: 'Heights outside the triangle', unlockLevel: 4, make: gridTriangle },
]
