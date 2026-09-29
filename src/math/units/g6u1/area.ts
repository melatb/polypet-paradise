/**
 * Grade 6, Unit 1 — section "Reasoning to Find Area".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { HELP, INK } from '../../Figure'
import { cellPoly, halfCell, neighbours, polyomino, type Cell } from '../../shapes'
import type { FigPoly, Pt, Question, QuestionType } from '../../types'

function bounds(cells: Cell[]) {
  const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1])
  return { x0: Math.min(...xs) - 0.6, x1: Math.max(...xs) + 1.6, y0: Math.min(...ys) - 0.6, y1: Math.max(...ys) + 1.6 }
}

function countSquares({ level }: { level: number }): Question {
  const n = level >= 3 ? R(10, 16) : R(5, 11)
  const cells = polyomino(n, level >= 3 ? 7 : 6, 5)
  return {
    name: 'Count the squares',
    prompt: 'Each square is 1 square unit. What is the area of this shape?',
    unit: 'square units', answer: cells.length,
    figure: () => ({ ...bounds(cells), grid: true, alt: 'Shape made of unit squares', polys: cells.map((c) => cellPoly(c)) }),
    hint: 'Area is how many unit squares cover the shape with no gaps or overlaps. Count them one row at a time.',
    solution: `There are ${cells.length} unit squares, so the area is ${cells.length} square units.`,
  }
}

function compareAreas(): Question {
  const nA = R(6, 11)
  const same = Math.random() < 0.4
  const nB = same ? nA : Math.max(4, nA + pick([-2, -1, 1, 2]))
  const A = polyomino(nA, 5, 5)
  const B = polyomino(nB, 5, 5).map(([x, y]) => [x + 6, y] as Cell)
  const answer = same ? 'same' : nA > nB ? 'A' : 'B'
  return {
    name: 'Compare areas',
    prompt: 'Which shape has the greater area?',
    figure: () => ({
      x0: -0.6, x1: 11.6, y0: -0.6, y1: 6.2, grid: true, alt: 'Two shapes made of unit squares, A and B',
      polys: [...A.map((c) => cellPoly(c)), ...B.map((c) => cellPoly(c, '#CDEBFF'))],
      labels: [{ x: 2.5, y: 5.6, t: 'A' }, { x: 8.5, y: 5.6, t: 'B' }],
    }),
    choices: [
      { label: 'Shape A', ok: answer === 'A', why: `Count again: A has ${nA} squares and B has ${nB}.` },
      { label: 'Shape B', ok: answer === 'B', why: `Count again: A has ${nA} squares and B has ${nB}.` },
      { label: 'Same area', ok: answer === 'same', why: `They look different, but count: A has ${nA} and B has ${nB}.` },
    ],
    hint: 'Shapes can look different and still cover the same number of squares. Count each one.',
    solution: `A covers ${nA} squares and B covers ${nB}.`,
  }
}

/** Pick the triangle half that shares a whole edge with the shape, so it attaches cleanly. */
function attachCorner([x, y]: Cell, cells: Cell[]): 0 | 1 | 2 | 3 {
  const has = (a: number, b: number) => cells.some((c) => c[0] === a && c[1] === b)
  const options: (0 | 1 | 2 | 3)[] = has(x - 1, y) ? [0, 3] : has(x + 1, y) ? [1, 2] : has(x, y - 1) ? [0, 1] : [2, 3]
  return pick(options)
}

function halfSquares({ level }: { level: number }): Question {
  const cells = polyomino(level >= 3 ? R(5, 9) : R(3, 6), 6, 5)
  const halves = shuffle(neighbours(cells, 6, 5)).slice(0, R(2, level >= 3 ? 5 : 3))
  const polys: FigPoly[] = [...cells.map((c) => cellPoly(c)), ...halves.map((c) => halfCell(c, attachCorner(c, cells)))]
  const n = cells.length, k = halves.length, A = n + k / 2
  return {
    name: 'Half squares',
    prompt: 'Each square is 1 square unit. Some pieces are half squares. What is the area of the whole shape?',
    unit: 'square units', answer: A,
    commonSlip: { value: n + k, message: 'Each triangle is only half of a square.' },
    figure: () => ({ ...bounds([...cells, ...halves]), grid: true, alt: 'Shape made of whole and half unit squares', polys }),
    hint: 'Two triangles that are each half a square make one whole square. Count the whole squares, then add ½ for each triangle.',
    solution: `${n} whole squares + ${k} halves = ${n} + ${fmt(k / 2)} = ${fmt(A)} square units`,
  }
}

function lShape(): Question {
  const W = R(5, 9), H = R(4, 7), a = R(2, W - 2), b = R(1, H - 2), unit = pick(['cm', 'm', 'ft', 'in'])
  const flip = Math.random() < 0.5
  const f = (p: Pt): Pt => (flip ? [W - p[0], p[1]] : p)
  const pts: Pt[] = ([[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]] as Pt[]).map(f)
  const A = W * H - a * b
  const lx = (x: number) => (flip ? W - x : x)
  return {
    name: 'Break it into rectangles',
    prompt: `Find the area of this shape. All the corners are right angles.`,
    unit: `square ${unit}`, answer: A,
    figure: (help) => ({
      x0: -1.8, x1: W + 1.8, y0: -1.2, y1: H + 1, alt: 'L-shaped polygon with side lengths',
      polys: [{ pts }],
      segs: help ? [{ a: [lx(W - a), 0], b: [lx(W - a), H - b] }] : [],
      labels: [
        { x: W / 2, y: -0.55, t: `${W}` }, { x: flip ? W + 0.7 : -0.7, y: H / 2, t: `${H}` },
        { x: lx((W - a) / 2), y: H + 0.5, t: `${W - a}` }, { x: flip ? -0.7 : W + 0.7, y: (H - b) / 2, t: `${H - b}` },
        ...(help ? [
          { x: lx((W - a) / 2), y: H / 2, t: `${W - a} × ${H}`, color: HELP },
          { x: lx(W - a / 2), y: (H - b) / 2, t: `${a} × ${H - b}`, color: HELP },
        ] : []),
      ],
    }),
    hint: `Cut the shape into two rectangles (dashed line). Find each rectangle's area and add them.`,
    solution: `${W - a} × ${H} + ${a} × ${H - b} = ${(W - a) * H} + ${a * (H - b)} = ${A} square ${unit}`,
  }
}

function rearrange(): Question {
  const w = R(3, 7), h = 2 * R(1, 3), t = R(1, 2)
  const pts: Pt[] = [[0, 0], [w, 0], [w + t, h / 2], [w, h], [0, h], [t, h / 2]]
  return {
    name: 'Move a piece',
    prompt: 'Each grid square is 1 square unit. Find the area of this shape. Tip: can one piece move to make a rectangle?',
    unit: 'square units', answer: w * h,
    figure: (help) => ({
      x0: -0.8, x1: w + t + 0.8, y0: -0.8, y1: h + 0.8, grid: true, alt: 'Shape with a triangle notch on one side and a matching bump on the other',
      polys: [{ pts }, ...(help ? [{ pts: [[0, 0], [t, h / 2], [0, h]] as Pt[], fill: 'rgba(224,40,125,.15)', stroke: HELP, dash: true }] : [])],
      segs: help ? [{ a: [w, 0], b: [w, h], color: INK }] : [],
    }),
    hint: `The triangle sticking out on the right fits exactly into the notch on the left. Move it over and you get a ${w} by ${h} rectangle.`,
    solution: `After moving the triangle, it's a ${w} × ${h} rectangle: ${w * h} square units.`,
  }
}

function missingSide(): Question {
  const a = R(3, 12), b = R(3, 12), A = a * b
  return {
    name: 'Missing side',
    prompt: `A rectangle has an area of ${A} square units. One side is ${a} units long. How long is the other side?`,
    unit: 'units', answer: b,
    figure: () => ({
      x0: -1.5, x1: Math.min(a, 10) + 1.5, y0: -1.2, y1: Math.min(b, 8) + 0.6, alt: 'Rectangle with one side unknown',
      polys: [{ pts: [[0, 0], [Math.min(a, 10), 0], [Math.min(a, 10), Math.min(b, 8)], [0, Math.min(b, 8)]] }],
      labels: [{ x: Math.min(a, 10) / 2, y: -0.55, t: a }, { x: -0.8, y: Math.min(b, 8) / 2, t: '?', color: HELP }],
    }),
    hint: `Area of a rectangle = side × side. What number times ${a} makes ${A}?`,
    solution: `${A} ÷ ${a} = ${b} units`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['Area is the number of unit squares that cover a shape without gaps or overlaps.', true, "That's exactly what area measures."],
  ['Two shapes that look different can have the same area.', true, 'Count the squares: different shapes can cover the same amount.'],
  ['If you cut a shape into pieces and move them around, the area changes.', false, 'Moving pieces without overlapping or leaving gaps keeps the area the same.'],
  ['Two shapes that match up exactly have the same area.', true, 'If one fits perfectly on top of the other, they cover the same space.'],
  ['Two triangles that are each half of a unit square make 1 square unit together.', true, '½ + ½ = 1.'],
  ["You can find a shape's area by breaking it into rectangles and adding their areas.", true, 'That strategy is called decomposing.'],
  ['A longer shape always has a bigger area.', false, 'A long, thin shape can cover fewer squares than a short, wide one.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return {
    name: 'True or false', prompt: statement,
    choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }],
    hint: 'Think about what area measures.', solution: why,
  }
}

export const areaQuestionTypes: QuestionType[] = [
  { id: 'count', name: 'Counting squares', unlockLevel: 1, make: countSquares },
  { id: 'compare', name: 'Comparing areas', unlockLevel: 1, make: compareAreas },
  { id: 'areaTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'halves', name: 'Half squares', unlockLevel: 2, make: halfSquares },
  { id: 'lshape', name: 'Breaking into rectangles', unlockLevel: 2, make: lShape },
  { id: 'rearrange', name: 'Moving pieces', unlockLevel: 3, make: rearrange },
  { id: 'missingSide', name: 'Missing sides', unlockLevel: 4, make: missingSide },
]
