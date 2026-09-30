/**
 * Grade 6, Unit 4 (Dividing Fractions) — fractions in lengths, areas and volumes.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R } from '../../../game/random'
import { HELP } from '../../Figure'
import { div, F, FRACTION_HINT, mul, plain, show, val, type Frac } from '../../fractions'
import { box, solidFigure } from '../../shapes'
import type { FigureSpec, Question, QuestionType } from '../../types'

/** Friendly side lengths: halves, thirds and quarters between ½ and 6. */
const side = (): Frac => { const d = pick([2, 3, 4]); return F(R(d + 1, 6 * d), d) }

function rectFigure(w: Frac, h: Frac, lw: string, lh: string, alt: string): FigureSpec {
  const k = Math.min(8 / val(w), 4.5 / val(h), 1.6)
  const W = val(w) * k, H = val(h) * k
  return {
    x0: -1.8, x1: W + 0.8, y0: -1.2, y1: H + 0.6, alt,
    polys: [{ pts: [[0, 0], [W, 0], [W, H], [0, H]] }],
    labels: [{ x: W / 2, y: -0.6, t: lw }, { x: -0.9, y: H / 2, t: lh, color: lh === '?' ? HELP : undefined }],
  }
}

function rectArea(): Question {
  const w = side(), h = side(), A = mul(w, h), unit = pick(['feet', 'meters', 'inches'])
  return {
    name: 'Area with fractions',
    prompt: `A rectangle is ${show(w)} ${unit} long and ${show(h)} ${unit} wide. What is its area?`,
    unit: `square ${unit}`, answer: val(A), inputHint: FRACTION_HINT,
    figure: () => rectFigure(w, h, show(w), show(h), 'Rectangle with fractional sides'),
    hint: `Area = length × width. Write mixed numbers as fractions first: ${show(w, true)} × ${show(h, true)}.`,
    solution: `${show(w, true)} × ${show(h, true)} = ${show(A)} (type ${plain(A)})`,
  }
}

function missingSide(): Question {
  const w = side(), h = side(), A = mul(w, h), unit = pick(['feet', 'meters'])
  return {
    name: 'Missing side',
    prompt: `A rectangle has an area of ${show(A, true)} square ${unit}. Its length is ${show(w)} ${unit}. How wide is it?`,
    unit, answer: val(h), inputHint: FRACTION_HINT,
    figure: () => rectFigure(w, h, show(w), '?', 'Rectangle with one side unknown'),
    hint: `Width = area ÷ length. Divide ${show(A, true)} by ${show(w, true)}.`,
    solution: `${show(A, true)} ÷ ${show(w, true)} = ${show(h)} ${unit}`,
  }
}

function howManyTimes(): Question {
  let x = side(), y = side()
  while (val(x) === val(y)) y = side()
  const ans = div(x, y)
  const [a, b] = pick([['the blue ribbon', 'the red ribbon'], ['the big dog', 'the puppy'], ["Lin's plant", "Noah's plant"]])
  const what = a.includes('ribbon') ? 'long' : a.includes('dog') ? 'heavy' : 'tall'
  const unit = what === 'long' ? 'feet' : what === 'heavy' ? 'pounds' : 'inches'
  return {
    name: 'How many times as...?',
    prompt: `${a[0].toUpperCase() + a.slice(1)} is ${show(x)} ${unit} ${what}. ${b[0].toUpperCase() + b.slice(1)} is ${show(y)} ${unit} ${what}. How many times as ${what} as ${b} is ${a}?`,
    answer: val(ans), inputHint: FRACTION_HINT,
    hint: `"How many times as ${what}" means: how many ${show(y)}s fit in ${show(x)}? Divide.`,
    solution: `${show(x, true)} ÷ ${show(y, true)} = ${show(ans)} (type ${plain(ans)})`,
  }
}

function boxVolume(): Question {
  const l = side(), w = F(pick([1, 3, 5]), 2), h = side()
  const V = mul(mul(l, w), h)
  const k = Math.min(1, 6 / (val(l) + val(w) * 0.6), 4.5 / (val(h) + val(w) * 0.42))
  return {
    name: 'Volume with fractions',
    prompt: 'What is the volume of this box? All lengths are in inches.',
    unit: 'cubic inches', answer: val(V), inputHint: FRACTION_HINT,
    figure: () => solidFigure(box(val(l), val(w), val(h), { l: show(l), w: show(w), h: show(h) }, k), 'Box with fractional edges'),
    hint: 'Volume = length × width × height. Multiply all three fractions.',
    solution: `${show(l, true)} × ${show(w, true)} × ${show(h, true)} = ${show(V)} (type ${plain(V)})`,
  }
}

function halfCubes(): Question {
  const a = R(1, 4), b = R(1, 4), c = R(1, 3)
  const cubes = a * 2 * b * 2 * c * 2
  return {
    name: 'Tiny cubes',
    prompt: `A box is ${a} by ${b} by ${c} inches. How many cubes with ½-inch edges fit inside it?`,
    unit: 'cubes', answer: cubes,
    commonSlip: { value: a * b * c * 2, message: 'Each inch holds 2 half-inch cubes in EVERY direction: length, width and height.' },
    figure: () => solidFigure(box(a, b, c, { l: `${a}`, w: `${b}`, h: `${c}` }, Math.min(1.2, 5 / (a + b * 0.6))), 'Box'),
    hint: `Along each edge, 1 inch holds 2 half-inch cubes. So it's ${a * 2} by ${b * 2} by ${c * 2} cubes.`,
    solution: `${a * 2} × ${b * 2} × ${c * 2} = ${cubes} cubes`,
  }
}

function missingHeight(): Question {
  const l = side(), w = F(pick([1, 3, 5]), 2), h = side()
  const base = mul(l, w), V = mul(base, h)
  return {
    name: 'Missing height',
    prompt: `A box has a volume of ${show(V, true)} cubic feet. Its base is ${show(l)} feet by ${show(w)} feet. How tall is it?`,
    unit: 'feet', answer: val(h), inputHint: FRACTION_HINT,
    hint: `First find the area of the base: ${show(l, true)} × ${show(w, true)}. Then divide the volume by it.`,
    solution: `Base = ${show(base, true)}. ${show(V, true)} ÷ ${show(base, true)} = ${show(h)} feet`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['If a rectangle has area 11¼ square meters and width 2½ meters, its length is 4½ meters.', true, '11¼ ÷ 2½ = 4½.'],
  ['To find a missing side of a rectangle, divide the area by the side you know.', true, 'Because area = length × width.'],
  ['A 1-inch cube holds exactly 2 cubes with ½-inch edges.', false, 'It holds 2 × 2 × 2 = 8 of them.'],
  ['Volume of a box = length × width × height, even when the lengths are fractions.', true, 'The formula works for any lengths.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Picture the shape.', solution: why }
}

export const fractionGeometryQuestionTypes: QuestionType[] = [
  { id: 'fracArea', name: 'Areas with fractions', unlockLevel: 1, make: rectArea },
  { id: 'geoTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'fracSide', name: 'Missing sides', unlockLevel: 2, make: missingSide },
  { id: 'timesAs', name: 'How many times as...?', unlockLevel: 2, make: howManyTimes },
  { id: 'fracVolume', name: 'Volume with fractions', unlockLevel: 3, make: boxVolume },
  { id: 'halfCubes', name: 'Tiny cubes', unlockLevel: 3, make: halfCubes },
  { id: 'fracHeight', name: 'Missing heights', unlockLevel: 4, make: missingHeight },
]
