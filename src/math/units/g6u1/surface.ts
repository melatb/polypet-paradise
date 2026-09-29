/**
 * Grade 6, Unit 1 — section "Surface Area".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { HELP } from '../../Figure'
import { box, boxNet, NET_FILLS, rectPts, solidFigure, squarePyramid, triPrism, triPyramid, type Solid } from '../../shapes'
import type { Question, QuestionType } from '../../types'

const bare = (s: Solid): Solid => ({ ...s, labels: [], segs: s.segs.filter((g) => g.color) })

const SOLIDS = [
  { name: 'rectangular prism', faces: 6, tri: 0, make: () => box(4, 2, 3, null, 0.9), shapes: '6 rectangles' },
  { name: 'cube', faces: 6, tri: 0, make: () => box(3, 3, 3, null, 0.9), shapes: '6 squares' },
  { name: 'triangular prism', faces: 5, tri: 2, make: () => bare(triPrism(3, 4, 5, 5, 0.8)), shapes: '2 triangles and 3 rectangles' },
  { name: 'square pyramid', faces: 5, tri: 4, make: () => bare(squarePyramid(4, 4, 0.9)), shapes: '1 square and 4 triangles' },
  { name: 'triangular pyramid', faces: 4, tri: 4, make: () => triPyramid(), shapes: '4 triangles' },
]

function countFaces(): Question {
  const s = pick(SOLIDS)
  const askTri = s.tri > 0 && Math.random() < 0.4
  const answer = askTri ? s.tri : s.faces
  const opts = shuffle([...new Set([answer, ...shuffle([2, 3, 4, 5, 6, 8].filter((n) => n !== answer)).slice(0, 3)])])
  return {
    name: 'Count the faces',
    prompt: askTri ? `How many triangular faces does this ${s.name} have?` : `How many faces does this ${s.name} have?`,
    figure: () => solidFigure(s.make(), s.name),
    choices: opts.map((n) => ({ label: String(n), ok: n === answer, why: 'Remember the faces you can’t see: the back, the bottom and the hidden sides (dashed lines).' })),
    hint: 'A face is a flat surface. Dashed lines show edges hidden at the back.',
    solution: `A ${s.name} has ${s.faces} faces: ${s.shapes}.`,
  }
}

function cubeSA(): Question {
  // Skip 6: a 6-unit cube's surface area and volume are both 216, which would reward the volume mistake.
  const s = pick([2, 3, 4, 5, 7, 8, 9]), unit = pick(['cm', 'in', 'ft', 'm'])
  const k = Math.min(1, 4.5 / s)
  return {
    name: 'Cube',
    prompt: `Every edge of this cube is ${s} ${unit} long. What is its surface area?`,
    unit: `square ${unit}`, answer: 6 * s * s,
    commonSlip: { value: s * s * s, message: "That's how much fits inside (volume). Surface area covers the outside." },
    figure: () => solidFigure(box(s, s, s, { l: `${s}`, w: '', h: '' }, k), `Cube with edge ${s}`),
    hint: `A cube has 6 faces, and every face is a ${s} by ${s} square.`,
    solution: `6 × ${s} × ${s} = 6 × ${s * s} = ${6 * s * s} square ${unit}`,
  }
}

function boxSA(): Question {
  const l = R(2, 8), w = R(1, 5), h = R(1, 6), unit = pick(['cm', 'in', 'ft', 'm'])
  const SA = 2 * (l * w + l * h + w * h)
  const k = Math.min(1, 7 / (l + w * 0.6), 5 / (h + w * 0.42))
  return {
    name: 'Box',
    prompt: 'What is the surface area of this box (rectangular prism)?',
    unit: `square ${unit}`, answer: SA,
    commonSlip: { value: SA / 2, message: 'Every face has a matching face on the opposite side. Count each pair twice.' },
    figure: () => solidFigure(box(l, w, h, { l: `${l}`, w: `${w}`, h: `${h}` }, k), `Box ${l} by ${w} by ${h}`),
    hint: `A box has 3 pairs of matching faces: front and back (${l} × ${h}), top and bottom (${l} × ${w}), and the two sides (${w} × ${h}).`,
    solution: `2 × ${l * h} + 2 × ${l * w} + 2 × ${w * h} = ${SA} square ${unit}`,
  }
}

function netSA(): Question {
  const l = R(2, 4), w = R(1, 3), h = R(1, 3)
  const faces = boxNet(l, w, h)
  const SA = faces.reduce((a, f) => a + f.area, 0)
  return {
    name: 'Net',
    prompt: 'This net folds into a box. Each grid square is 1 square unit. What is the surface area of the box?',
    unit: 'square units', answer: SA,
    figure: (help) => ({
      x0: -0.6, x1: 2 * w + 2 * l + 0.6, y0: -0.6, y1: 2 * w + h + 0.6, grid: true, alt: 'Net of a rectangular prism',
      polys: faces.map((f, i) => ({ pts: rectPts(f.rect), fill: NET_FILLS[i], sw: 2.5 })),
      labels: help ? faces.map((f) => ({ x: f.rect[0] + f.rect[2] / 2, y: f.rect[1] + f.rect[3] / 2, t: f.area, color: HELP })) : [],
    }),
    hint: 'Find the area of each of the 6 rectangles, then add them all up.',
    solution: `${faces.map((f) => f.area).join(' + ')} = ${SA} square units`,
  }
}

function triPrismSA(): Question {
  const m = pick([1, 2]), [a, b, c] = [3 * m, 4 * m, 5 * m], len = R(3, 8), unit = pick(['cm', 'in', 'ft'])
  const tri = (a * b) / 2, SA = 2 * tri + (a + b + c) * len
  const k = Math.min(0.8, 6 / (a + len * 0.6), 4.5 / (b + len * 0.42))
  return {
    name: 'Triangular prism',
    prompt: `The ends of this prism are right triangles. What is the prism's surface area?`,
    unit: `square ${unit}`, answer: SA,
    commonSlip: { value: 2 * a * b + (a + b + c) * len, message: 'Each triangle is only ½ × base × height.' },
    figure: () => solidFigure(triPrism(a, b, c, len, k), `Triangular prism, triangle sides ${a}, ${b}, ${c}, length ${len}`),
    hint: `It has 2 triangles (½ × ${a} × ${b} each) and 3 rectangles: ${a} × ${len}, ${b} × ${len} and ${c} × ${len}.`,
    solution: `2 × ${fmt(tri)} + ${a * len} + ${b * len} + ${c * len} = ${SA} square ${unit}`,
  }
}

function pyramidSA(): Question {
  const s = R(2, 8), t = R(Math.ceil(s / 2) + 2, 10), unit = pick(['cm', 'in', 'ft'])
  const SA = s * s + 2 * s * t
  const k = Math.min(0.9, 5 / (s * 1.55))
  return {
    name: 'Square pyramid',
    prompt: `This pyramid has a square base with sides of ${s} ${unit}. Each triangle has a height of ${t} ${unit}. What is its surface area?`,
    unit: `square ${unit}`, answer: SA,
    commonSlip: { value: s * s + 4 * s * t, message: 'Each triangle is only ½ × base × height.' },
    figure: () => solidFigure(squarePyramid(s, t, k), `Square pyramid, base ${s}, triangle height ${t}`),
    hint: `Add the square base (${s} × ${s}) and 4 triangles (½ × ${s} × ${t} each).`,
    solution: `${s * s} + 4 × ${fmt((s * t) / 2)} = ${SA} square ${unit}`,
  }
}

function spotMistake(): Question {
  let l = 0, w = 0, h = 0, SA = 0
  const mistakes = [
    { id: 'once', text: 'He counted each pair of faces only once', f: () => l * w + l * h + w * h },
    { id: 'volume', text: 'He multiplied the three edges together', f: () => l * w * h },
    { id: 'four', text: 'He left out the top and bottom', f: () => 2 * (l * h + w * h) },
  ]
  let m = pick(mistakes), claim = 0
  do {
    l = R(2, 7); w = R(2, 5); h = R(2, 6)
    SA = 2 * (l * w + l * h + w * h)
    m = pick(mistakes); claim = m.f()
  } while (mistakes.some((x) => x !== m && x.f() === claim) || claim === SA)
  const k = Math.min(1, 7 / (l + w * 0.6), 5 / (h + w * 0.42))
  return {
    name: 'Spot the mistake',
    prompt: `Andre says the surface area of this box is ${claim} square units. What mistake did he make?`,
    figure: () => solidFigure(box(l, w, h, { l: `${l}`, w: `${w}`, h: `${h}` }, k), `Box ${l} by ${w} by ${h}`),
    choices: shuffle([
      ...mistakes.map((x) => ({ label: x.text, ok: x === m, why: `Try it: that would give ${x.f()}, not ${claim}.` })),
      { label: "Nothing, he's right", ok: false, why: `The real surface area is ${SA}.` },
    ]),
    hint: `Work out what each mistake would give, and find the one that makes ${claim}.`,
    solution: `The correct surface area is 2 × (${l * w} + ${l * h} + ${w * h}) = ${SA}.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['Surface area is the total area of all the faces of a solid.', true, "It's the amount of paint you'd need to cover the outside."],
  ['A net can be cut out and folded to make the solid.', true, 'A net shows every face flat.'],
  ['A cube has 6 faces that are all the same size.', true, '6 matching squares.'],
  ['A triangular prism has 3 triangular faces.', false, 'It has 2 triangles (the ends) and 3 rectangles.'],
  ['A square pyramid has 4 triangular faces and 1 square face.', true, 'The square is the base.'],
  ['Surface area and volume are the same thing.', false, 'Surface area covers the outside. Volume fills the inside.'],
  ['The two triangles in a triangular prism are identical.', true, 'Both ends of a prism match exactly.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return {
    name: 'True or false', prompt: statement,
    choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }],
    hint: 'Picture the solid and its faces.', solution: why,
  }
}

export const surfaceQuestionTypes: QuestionType[] = [
  { id: 'faces', name: 'Counting faces', unlockLevel: 1, make: countFaces },
  { id: 'cube', name: 'Cubes', unlockLevel: 1, make: cubeSA },
  { id: 'saTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'box', name: 'Boxes', unlockLevel: 2, make: boxSA },
  { id: 'net', name: 'Nets', unlockLevel: 2, make: netSA },
  { id: 'triPrism', name: 'Triangular prisms', unlockLevel: 3, make: triPrismSA },
  { id: 'pyramid', name: 'Square pyramids', unlockLevel: 3, make: pyramidSA },
  { id: 'mistake', name: 'Spot the mistake', unlockLevel: 4, make: spotMistake },
]
