/**
 * Grade 6, Unit 3 (Unit Rates and Percentages) — section "Percentages".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R } from '../../../game/random'
import { doubleNumberLine, hundredGrid } from '../../ratioDiagrams'
import type { FigureSpec, Question, QuestionType } from '../../types'
import { money } from '../g6u2/numberLines'

/** Double number line from 0% to 100% in steps of `step` percent. */
function percentLine(whole: number, step: number, ask: number | null, name: string, showAll = false): FigureSpec {
  const n = 100 / step + 1
  const askAt = ask === null ? -1 : ask / step
  // With many ticks, only label the ends and the tick that matters, so labels don't collide.
  const keep = (i: number) => n <= 6 || i === 0 || i === n - 1 || i === askAt || i === (n - 1) / 2
  return doubleNumberLine(
    { name, vals: Array.from({ length: n }, (_, i) => (i === n - 1 || i === 0 || (showAll && keep(i)) ? fmt((whole * i * step) / 100) : '')) },
    { name: 'percent', vals: Array.from({ length: n }, (_, i) => (keep(i) ? `${i * step}%` : '')) },
    `Percent number line, 100% is ${whole}`, { ask: askAt < 0 ? undefined : ['top', askAt], mark: askAt < 0 ? undefined : askAt, step: n > 6 ? 1.3 : 2 },
  )
}

function percentOf(): Question {
  const p = pick([10, 20, 25, 50, 75])
  const whole = 20 * R(1, 10)
  const part = (whole * p) / 100
  const step = p === 10 ? 10 : p === 20 ? 20 : 25
  const ctx = pick([
    { t: `What is ${p}% of ${whole}?`, name: 'amount', u: '' },
    { t: `A bottle holds ${whole} ounces. You drink ${p}% of it. How many ounces is that?`, name: 'ounces', u: 'ounces' },
    { t: `A class raised $${whole}. ${p}% of it goes to the animal shelter. How much is that?`, name: 'dollars', u: 'dollars' },
  ])
  return {
    name: 'Percent of',
    prompt: ctx.t,
    unit: ctx.u || undefined, answer: part,
    figure: (help) => percentLine(whole, step, p, ctx.name, help),
    hint: `100% is ${whole}. ${step === 10 ? `10% is ${whole} ÷ 10.` : step === 20 ? `20% is ${whole} ÷ 5.` : `25% is ${whole} ÷ 4.`}${p === 50 ? ' 50% is half.' : ''}`,
    solution: `${p}% of ${whole} = ${fmt(part)}`,
  }
}

function shadedGrid(): Question {
  const s = R(5, 95)
  return {
    name: 'Per 100',
    prompt: 'The big square is 100 small squares. What percent is shaded?',
    unit: '%', answer: s,
    figure: () => hundredGrid(s, `${s} of 100 squares shaded`),
    hint: 'Percent means "per 100". Count the shaded squares: full rows of 10 first.',
    solution: `${s} out of 100 = ${s}%`,
  }
}

function findWhole(): Question {
  const p = pick([10, 20, 25, 50, 75])
  const whole = 4 * R(2, 10) * (p === 10 ? 5 : p === 20 ? 5 : 1)
  const part = (whole * p) / 100
  const ctx = pick([
    { t: `Noah got ${fmt(part)} questions right on a quiz. That's ${p}% of the questions. How many questions were on the quiz?`, u: 'questions' },
    { t: `${fmt(part)} is ${p}% of what number?`, u: '' },
    { t: `A pet shelter has adopted out ${fmt(part)} pets, which is ${p}% of its goal. What is the goal?`, u: 'pets' },
  ])
  return {
    name: 'Find the whole',
    prompt: ctx.t,
    unit: ctx.u || undefined, answer: whole,
    hint: p === 75 ? `75% is 3 quarters. So 1 quarter (25%) is ${fmt(part)} ÷ 3. Then 100% is 4 quarters.` : `${p}% goes into 100% ${100 / p} times. Multiply ${fmt(part)} by ${100 / p}.`,
    solution: p === 75 ? `25% is ${fmt(part / 3)}, so 100% is ${fmt(part / 3)} × 4 = ${whole}.` : `${fmt(part)} × ${100 / p} = ${whole}`,
  }
}

function whatPercent(): Question {
  const options: [number, number][] = []
  for (const W of [4, 5, 8, 10, 20, 25, 40, 50]) for (const p of [20, 25, 40, 50, 60, 75, 80, 120, 125, 150, 200]) if ((W * p) % 100 === 0) options.push([W, p])
  const [W, p] = pick(options)
  const part = (W * p) / 100
  const ctx = pick([
    { t: `Elena planned to walk ${W} miles. She walked ${part} miles. What percent of her plan did she walk?` },
    { t: `${part} is what percent of ${W}?` },
    { t: `A recipe needs ${W} cups of flour. Lin has ${part} cups. What percent of the flour she needs does she have?` },
  ])
  return {
    name: 'What percent?',
    prompt: ctx.t,
    unit: '%', answer: p,
    hint: `${W} is 100%. How many times ${W} is ${part}? Or find 1 first: 1 is ${fmt(100 / W)}%.`,
    solution: `${part} ÷ ${W} = ${fmt(part / W)}, and ${fmt(part / W)} × 100 = ${p}%.${p > 100 ? ' More than the whole means more than 100%.' : ''}`,
  }
}

function sale(): Question {
  const price = 20 * R(1, 6)
  // No 50%: the savings and the sale price would be the same number.
  const p = pick([10, 20, 25, 40])
  const off = (price * p) / 100
  return {
    name: 'On sale',
    prompt: `A $${price} jacket is ${p}% off. What is the sale price?`,
    unit: 'dollars', answer: price - off,
    commonSlip: { value: off, message: "That's how much you save. The sale price is what's left to pay." },
    hint: `First find ${p}% of $${price}. Then subtract it from the price.`,
    solution: `${p}% of $${price} is ${money(off)}. $${price} − ${money(off)} = ${money(price - off)}.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['Percent means “per 100.”', true, '25% means 25 per 100.'],
  ['50% of a number is half of it.', true, '50 per 100 is one half.'],
  ['A percent can never be more than 100%.', false, 'Walking 12 miles when you planned 8 is 150% of the plan.'],
  ['25% of 16 ounces is 4 ounces.', true, '16 ÷ 4 = 4.'],
  ['10% of 80 is 10.', false, '10% is one tenth: 80 ÷ 10 = 8.'],
  ['100% of something is the whole thing.', true, '100 per 100.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think "out of 100".', solution: why }
}

export const percentQuestionTypes: QuestionType[] = [
  { id: 'grid100', name: 'Per 100', unlockLevel: 1, make: shadedGrid },
  { id: 'pctOf', name: 'Percent of a number', unlockLevel: 1, make: percentOf },
  { id: 'pctTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'whole', name: 'Finding the whole', unlockLevel: 2, make: findWhole },
  { id: 'whatPct', name: 'What percent?', unlockLevel: 3, make: whatPercent },
  { id: 'sale', name: 'Sales and discounts', unlockLevel: 4, make: sale },
]
