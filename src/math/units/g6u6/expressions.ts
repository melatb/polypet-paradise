/**
 * Grade 6, Unit 6 (Expressions and Equations) — equivalent expressions and the distributive property.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { HELP } from '../../Figure'
import { COLORS } from '../../ratioDiagrams'
import type { FigureSpec, Question, QuestionType } from '../../types'

const VARS = ['x', 'y', 'n', 'a', 'm']

/** Area diagram for a(v + b): height a, widths v and b. */
export function distributeFigure(a: number | string, v: string, b: number, help: boolean): FigureSpec {
  const H = 2.4, W1 = 3.2, W2 = Math.min(3, 1 + b * 0.25)
  return {
    x0: -1.2, x1: W1 + W2 + 0.6, y0: -1, y1: H + 0.6, alt: `Rectangle ${a} tall, split into widths ${v} and ${b}`,
    polys: [{ pts: [[0, 0], [W1, 0], [W1, H], [0, H]], fill: COLORS.a }, { pts: [[W1, 0], [W1 + W2, 0], [W1 + W2, H], [W1, H]], fill: COLORS.b }],
    labels: [
      { x: -0.6, y: H / 2, t: a }, { x: W1 / 2, y: -0.5, t: v }, { x: W1 + W2 / 2, y: -0.5, t: b },
      ...(help ? [{ x: W1 / 2, y: H / 2, t: `${a}${v}`, color: HELP }, { x: W1 + W2 / 2, y: H / 2, t: typeof a === 'number' ? a * b : `${b}${a}`, color: HELP }] : []),
    ],
  }
}

function areaDiagram(): Question {
  const a = R(2, 9), b = R(1, 9), v = pick(VARS)
  return {
    name: 'Area diagram',
    prompt: `The rectangle is ${a} tall and ${v} + ${b} wide. Which expression is equivalent to ${a}(${v} + ${b})?`,
    figure: (help) => distributeFigure(a, v, b, help),
    choices: shuffle([
      { label: `${a}${v} + ${a * b}`, ok: true },
      { label: `${a}${v} + ${b}`, ok: false, why: `The ${a} multiplies BOTH parts: ${a} × ${v} and ${a} × ${b}.` },
      { label: `${a + b}${v}`, ok: false, why: `${v} and ${b} are different parts. Find the area of each piece.` },
      { label: `${a} + ${v} + ${b}`, ok: false, why: "Area comes from multiplying, not adding." },
    ]),
    hint: `Find the area of each small rectangle: ${a} × ${v} and ${a} × ${b}. Add them.`,
    solution: `${a}(${v} + ${b}) = ${a}${v} + ${a * b}`,
  }
}

function expand(): Question {
  const a = R(2, 9), b = R(1, 12), v = pick(VARS)
  return {
    name: 'Distribute',
    prompt: `${a}(${v} + ${b}) = ${a}${v} + ?`,
    answer: a * b,
    commonSlip: { value: b, message: `Don't forget to multiply the ${b} by ${a} too.` },
    hint: `Multiply ${a} by each part inside the parentheses.`,
    solution: `${a} × ${b} = ${a * b}`,
  }
}

function factor(): Question {
  const a = R(2, 9), b = R(1, 9), v = pick(VARS)
  return {
    name: 'Factor',
    prompt: `${a}${v} + ${a * b} = ${a}(${v} + ?)`,
    answer: b,
    commonSlip: { value: a * b, message: `The ${a} outside multiplies what's inside, so divide ${a * b} by ${a}.` },
    hint: `What times ${a} makes ${a * b}?`,
    solution: `${a * b} ÷ ${a} = ${b}, so ${a}${v} + ${a * b} = ${a}(${v} + ${b}).`,
  }
}

function combine(): Question {
  const a = R(2, 12), b = R(2, 12), v = pick(VARS)
  const sub = Math.random() < 0.4 && a > b
  return {
    name: 'Combine',
    prompt: `${a}${v} ${sub ? '−' : '+'} ${b}${v} = ?${v}. What number goes in front of ${v}?`,
    answer: sub ? a - b : a + b,
    hint: `${a} groups of ${v} ${sub ? 'take away' : 'and'} ${b} groups of ${v}.`,
    solution: `${a}${v} ${sub ? '−' : '+'} ${b}${v} = ${sub ? a - b : a + b}${v}`,
  }
}

function whichEquivalent(): Question {
  const a = R(2, 6), b = R(2, 6), c = R(1, 9), v = pick(VARS)
  const right = `${a * b}${v} + ${a * c}`
  const opts = [right, `${a * b}${v} + ${c}`, `${a + b}${v} + ${a + c}`, `${b}${v} + ${a * c}`]
  return {
    name: 'Which is equivalent?',
    prompt: `Which expression is equivalent to ${a}(${b}${v} + ${c})?`,
    choices: shuffle([...new Set(opts)].map((o) => ({ label: o, ok: o === right, why: `Multiply ${a} by each part: ${a} × ${b}${v} = ${a * b}${v} and ${a} × ${c} = ${a * c}.` }))),
    hint: `Distribute: multiply ${a} by ${b}${v} and by ${c}.`,
    solution: `${a}(${b}${v} + ${c}) = ${right}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['3(x + 2) is equivalent to 3x + 6.', true, 'The 3 multiplies both x and 2.'],
  ['3(x + 2) is equivalent to 3x + 2.', false, 'The 3 has to multiply the 2 as well: 3x + 6.'],
  ['Equivalent expressions are equal for every value of the variable.', true, "That's what equivalent means."],
  ['5x + 3x = 8x', true, '5 groups of x and 3 groups of x make 8 groups of x.'],
  ['x + x + x is equivalent to 3x.', true, 'Three groups of x.'],
  ['2x + 3 is equivalent to 5x.', false, "2x and 3 aren't like terms, so they can't be combined."],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try x = 1 or x = 2 on both sides.', solution: why }
}

export const expressionQuestionTypes: QuestionType[] = [
  { id: 'areaDist', name: 'Area diagrams', unlockLevel: 1, make: areaDiagram },
  { id: 'exprTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'expand', name: 'Distributing', unlockLevel: 2, make: expand },
  { id: 'combine', name: 'Combining like terms', unlockLevel: 2, make: combine },
  { id: 'factor', name: 'Factoring', unlockLevel: 3, make: factor },
  { id: 'whichEq', name: 'Which is equivalent?', unlockLevel: 4, make: whichEquivalent },
]
