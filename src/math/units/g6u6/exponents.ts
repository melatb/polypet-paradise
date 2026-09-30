/**
 * Grade 6, Unit 6 (Expressions and Equations) — expressions with exponents.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { F, FRACTION_HINT, show, sup, val } from '../../fractions'
import type { Question, QuestionType } from '../../types'

const pow = (b: string | number, e: number) => `${b}${sup(e)}`

function evaluate({ level }: { level: number }): Question {
  const kind = level >= 3 ? pick(['whole', 'frac', 'dec'] as const) : 'whole'
  if (kind === 'frac') {
    const d = R(2, 5), e = R(2, 3)
    const ans = F(1, d ** e)
    return {
      name: 'Powers', prompt: `(${show(F(1, d))})${sup(e)} = ?`, answer: val(ans), inputHint: FRACTION_HINT,
      hint: `Multiply ${show(F(1, d))} by itself ${e} times.`, solution: `${Array(e).fill(show(F(1, d))).join(' × ')} = ${show(ans)} (type 1/${d ** e})`,
    }
  }
  if (kind === 'dec') {
    const b = pick([0.1, 0.2, 0.3, 0.5]), e = 2
    return {
      name: 'Powers', prompt: `${pow(b, e)} = ?`, answer: +(b * b).toFixed(4),
      hint: `${b} × ${b}. How many decimal places will the answer have?`, solution: `${b} × ${b} = ${+(b * b).toFixed(4)}`,
    }
  }
  const [b, e] = pick([[2, R(2, 6)], [3, R(2, 4)], [4, R(2, 3)], [5, R(2, 3)], [10, R(2, 5)], [R(6, 12), 2]] as [number, number][])
  return {
    name: 'Powers', prompt: `${pow(b, e)} = ?`, answer: b ** e,
    // 2² = 2 × 2 by coincidence, so only warn about "base × exponent" when it gives a different number.
    commonSlip: b * e === b ** e ? undefined : { value: b * e, message: `${pow(b, e)} isn't ${b} × ${e}. It's ${e} factors of ${b} multiplied together.` },
    hint: `Multiply ${e} factors of ${b}: ${Array(e).fill(b).join(' × ')}.`,
    solution: `${Array(e).fill(b).join(' × ')} = ${b ** e}`,
  }
}

function notation(): Question {
  const b = R(2, 9), e = R(3, 6)
  const opts = [...new Set([pow(b, e), pow(e, b), `${b} × ${e}`, `${b * e}`])]
  return {
    name: 'Exponent notation',
    prompt: `${Array(e).fill(b).join(' · ')} is the same as:`,
    choices: shuffle(opts.map((o) => ({ label: o, ok: o === pow(b, e), why: `The base is the number being multiplied (${b}). The exponent counts how many times (${e}).` }))),
    hint: 'The base is the repeated factor. The exponent says how many factors there are.',
    solution: `${e} factors of ${b} = ${pow(b, e)}`,
  }
}

function orderOfOps(): Question {
  const t = pick([
    () => { const a = R(1, 9), b = R(2, 4), c = R(2, 5); return { e: `${a} + ${pow(b, 2)} × ${c}`, v: a + b * b * c, s: `${pow(b, 2)} = ${b * b}, then × ${c} = ${b * b * c}, then + ${a}` } },
    () => { const a = R(2, 5), b = R(1, 5); return { e: `(${a} + ${b})${sup(2)}`, v: (a + b) ** 2, s: `Parentheses first: ${a + b}, then ${pow(a + b, 2)}` } },
    () => { const a = R(2, 4), b = R(2, Math.min(9, a ** 3 - 1)); return { e: `${pow(a, 3)} − ${b}`, v: a ** 3 - b, s: `${pow(a, 3)} = ${a ** 3}, then − ${b}` } },
    () => { const a = R(2, 6), b = R(2, 3); return { e: `2 × ${pow(a, b)}`, v: 2 * a ** b, s: `${pow(a, b)} = ${a ** b} first, then × 2` } },
  ])()
  return {
    name: 'Order of operations',
    prompt: `${t.e} = ?`,
    answer: t.v,
    hint: 'Parentheses first, then exponents, then multiply and divide, then add and subtract.',
    solution: `${t.s} = ${t.v}`,
  }
}

function withVariable(): Question {
  const c = R(2, 6), x = R(2, 6), v = pick(['x', 'n', 'y'])
  return {
    name: 'Put in the value',
    prompt: `What is ${c}${v}${sup(2)} when ${v} = ${x}?`,
    answer: c * x * x,
    commonSlip: { value: (c * x) ** 2, message: `The exponent only belongs to ${v}. Square ${v} first, then multiply by ${c}.` },
    hint: `${c}${v}${sup(2)} means ${c} × ${v} × ${v}.`,
    solution: `${c} × ${x} × ${x} = ${c * x * x}`,
  }
}

function compare(): Question {
  const pairs: [number, number, number, number][] = [[2, 5, 5, 2], [3, 4, 4, 3], [2, 4, 4, 2], [2, 6, 6, 2], [3, 2, 2, 3], [10, 2, 2, 10], [5, 3, 3, 5]]
  const [a, b, c, d] = pick(pairs)
  const x = a ** b, y = c ** d
  const ans = x === y ? 'same' : x > y ? 'x' : 'y'
  const why = `${pow(a, b)} = ${x} and ${pow(c, d)} = ${y}.`
  return {
    name: 'Which is greater?',
    prompt: 'Which is greater?',
    choices: [{ label: pow(a, b), ok: ans === 'x', why }, { label: pow(c, d), ok: ans === 'y', why }, { label: 'They are equal', ok: ans === 'same', why }],
    hint: 'Work each one out.',
    solution: why,
  }
}

const FACTS: [string, boolean, string][] = [
  ['7⁴ means 7 · 7 · 7 · 7.', true, 'Four factors of 7.'],
  ['5³ = 15', false, '5³ = 5 × 5 × 5 = 125.'],
  ['2⁵ is greater than 5².', true, '32 is greater than 25.'],
  ['(½)² = ¼', true, '½ × ½ = ¼.'],
  ['In 3x², only x is squared.', true, 'It means 3 × x × x.'],
  ['10³ = 1,000', true, '10 × 10 × 10.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Write out the factors.', solution: why }
}

export const exponentQuestionTypes: QuestionType[] = [
  { id: 'evalPow', name: 'Powers', unlockLevel: 1, make: evaluate },
  { id: 'notation', name: 'Exponent notation', unlockLevel: 1, make: notation },
  { id: 'expTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'order', name: 'Order of operations', unlockLevel: 2, make: orderOfOps },
  { id: 'withVar', name: 'Putting in a value', unlockLevel: 3, make: withVariable },
  { id: 'comparePow', name: 'Comparing powers', unlockLevel: 4, make: compare },
]
