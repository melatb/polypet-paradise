/**
 * Grade 6, Unit 2 (Introducing Ratios) — double number lines, unit price and same rate.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { doubleNumberLine } from '../../ratioDiagrams'
import type { Question, QuestionType } from '../../types'

/** 7.5 → "7.50" (whole numbers stay as they are). */
const cents = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2))
export const money = (v: number) => (Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`)

interface Ctx { top: string; bottom: string; topUnit: string; bottomUnit: string; base: [number, number][]; moneyTop?: boolean }
const CTXS: Ctx[] = [
  { top: 'price ($)', bottom: 'tickets', topUnit: 'dollars', bottomUnit: 'tickets', base: [[6, 5], [4, 3], [10, 4], [3, 2]], moneyTop: true },
  { top: 'miles', bottom: 'hours', topUnit: 'miles', bottomUnit: 'hours', base: [[12, 1], [25, 2], [9, 1], [30, 2]] },
  { top: 'cups of water', bottom: 'cups of rice', topUnit: 'cups of water', bottomUnit: 'cups of rice', base: [[3, 2], [2, 1], [5, 2]] },
  { top: 'cost ($)', bottom: 'pounds of apples', topUnit: 'dollars', bottomUnit: 'pounds', base: [[3, 2], [5, 4], [2, 1]], moneyTop: true },
]

function readLine(): Question {
  const c = pick(CTXS)
  const [a, b] = pick(c.base)
  const n = 5
  const i = R(2, n - 1)
  const askTop = Math.random() < 0.5
  return {
    name: 'Double number line',
    prompt: 'What number goes where the question mark is?',
    unit: askTop ? c.topUnit : c.bottomUnit, answer: askTop ? a * i : b * i,
    figure: (help) => doubleNumberLine(
      { name: c.top, vals: Array.from({ length: n }, (_, k) => a * k) },
      { name: c.bottom, vals: Array.from({ length: n }, (_, k) => b * k) },
      `Double number line: ${a} ${c.topUnit} for ${b} ${c.bottomUnit}`, { ask: [askTop ? 'top' : 'bottom', i], mark: help ? i : undefined }),
    hint: `Each tick adds another ${a} on the top line and another ${b} on the bottom line.`,
    solution: `Each tick adds ${askTop ? a : b}, so ${i} ticks from 0 is ${i} × ${askTop ? a : b} = ${askTop ? a * i : b * i}.`,
  }
}

function extend(): Question {
  const c = pick(CTXS)
  const [a, b] = pick(c.base)
  const k = R(6, 15)
  const askTop = Math.random() < 0.5
  const given = askTop ? `${fmt(b * k)} ${c.bottomUnit}` : c.moneyTop ? money(a * k) : `${a * k} ${c.topUnit}`
  return {
    name: 'Go further',
    prompt: askTop ? `The number line shows the rate. What goes with ${given}?` : `The number line shows the rate. How many ${c.bottomUnit} go with ${given}?`,
    unit: askTop ? c.topUnit : c.bottomUnit, answer: askTop ? a * k : b * k,
    figure: () => doubleNumberLine(
      { name: c.top, vals: [0, a, 2 * a, 3 * a] }, { name: c.bottom, vals: [0, b, 2 * b, 3 * b] }, `Double number line: ${a} ${c.topUnit} for ${b} ${c.bottomUnit}`),
    hint: askTop ? `How many times ${b} is ${b * k}? Multiply ${a} by the same number.` : `How many times ${a} is ${a * k}? Multiply ${b} by the same number.`,
    solution: `${askTop ? b * k : a * k} is ${k} times ${askTop ? b : a}, so ${k} × ${askTop ? a : b} = ${askTop ? a * k : b * k}.`,
  }
}

const UNIT_PRICES = [0.5, 0.75, 1.2, 1.25, 1.5, 2, 2.5, 3, 4]
const ITEMS = ['tickets', 'notebooks', 'apples', 'stickers', 'pencils', 'bagels']
function unitPrice(): Question {
  const u = pick(UNIT_PRICES), n = R(2, 6), item = pick(ITEMS)
  const total = +(u * n).toFixed(2)
  return {
    name: 'Price of one',
    prompt: `${n} ${item} cost ${money(total)}. How much does 1 cost?`,
    unit: 'dollars', answer: u,
    figure: (help) => doubleNumberLine(
      { name: 'price ($)', vals: Array.from({ length: n + 1 }, (_, k) => (k === n ? cents(total) : help && k === 1 ? cents(u) : k === 0 ? 0 : '')) },
      { name: item, vals: Array.from({ length: n + 1 }, (_, k) => k) }, `${n} ${item} for ${money(total)}`, { ask: help ? undefined : ['top', 1], step: n > 5 ? 1.6 : 2 }),
    hint: `Split the price into ${n} equal parts: divide ${money(total)} by ${n}.`,
    solution: `${money(total)} ÷ ${n} = ${money(u)} each`,
  }
}

const NAMES = ['Andre', 'Lin', 'Noah', 'Elena', 'Diego', 'Jada', 'Priya', 'Han']
function sameRate(): Question {
  const [p1, p2] = shuffle([...NAMES]).slice(0, 2)
  const rates = [6, 8, 10, 12, 12.5, 15]
  const r1 = pick(rates)
  const outcome = pick(['faster', 'slower', 'same'] as const)
  const r2 = outcome === 'same' ? r1 : pick(rates.filter((r) => (outcome === 'faster' ? r < r1 : r > r1)).concat(outcome === 'faster' ? [r1 - 2] : [r1 + 2]))
  const t1 = pick([2, 3, 4]), t2 = pick([2, 3, 4, 5].filter((t) => t !== t1))
  const d1 = r1 * t1, d2 = r2 * t2
  const answer = outcome === 'same' ? 'same' : outcome === 'faster' ? p1 : p2
  return {
    name: 'Who is faster?',
    prompt: `${p1} rides a bike ${fmt(d1)} miles in ${t1} hours. ${p2} rides ${fmt(d2)} miles in ${t2} hours. Both go at a steady speed. Who is faster?`,
    choices: [
      { label: p1, ok: answer === p1, why: `Find miles per hour: ${p1} goes ${fmt(r1)} and ${p2} goes ${fmt(r2)}.` },
      { label: p2, ok: answer === p2, why: `Find miles per hour: ${p1} goes ${fmt(r1)} and ${p2} goes ${fmt(r2)}.` },
      { label: 'Same speed', ok: answer === 'same', why: `Find miles per hour: ${p1} goes ${fmt(r1)} and ${p2} goes ${fmt(r2)}.` },
    ],
    hint: 'Figure out how far each person goes in 1 hour, then compare.',
    solution: `${p1}: ${fmt(d1)} ÷ ${t1} = ${fmt(r1)} miles per hour. ${p2}: ${fmt(d2)} ÷ ${t2} = ${fmt(r2)} miles per hour.`,
  }
}

function isSameRate(): Question {
  const [a, b] = pick([[6, 5], [4, 3], [3, 2], [10, 4]] as [number, number][])
  const k = R(2, 6)
  const same = Math.random() < 0.5
  const [x, y] = same ? [a * k, b * k] : pick([[a * k + 1, b * k], [a + k, b + k], [a * k, b * k + 2]] as [number, number][])
  return {
    name: 'Same rate?',
    prompt: `Raffle tickets cost ${money(a)} for ${b} tickets. Is ${money(x)} for ${y} tickets the same rate?`,
    choices: [
      { label: 'Yes, same rate', ok: same, why: `Check: is there one number that multiplies ${a} into ${x} AND ${b} into ${y}?` },
      { label: 'No, different rate', ok: !same, why: `Both were multiplied by ${k}: ${a} × ${k} = ${x} and ${b} × ${k} = ${y}.` },
    ],
    hint: `A same rate means both numbers get multiplied by the same number. Try ${x} ÷ ${a} and ${y} ÷ ${b}.`,
    solution: same ? `Yes: both are multiplied by ${k}.` : `No: ${fmt(x / a)} and ${fmt(y / b)} aren't the same multiplier.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['On a double number line, the tick marks are evenly spaced.', true, 'Each tick adds the same amount.'],
  ['On a double number line, numbers that line up make equivalent ratios.', true, 'That’s what the diagram shows.'],
  ['If 5 tickets cost $6, then 1 ticket costs $1.20.', true, '$6 ÷ 5 = $1.20.'],
  ['If 5 tickets cost $6, then 10 tickets cost $11.', false, 'Double both: 10 tickets cost $12.'],
  ['Two people going at the same speed travel the same distance in the same time.', true, 'Same rate means equivalent ratios.'],
  ['Both lines of a double number line start at 0.', true, 'Zero of one thing goes with zero of the other.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Picture a double number line.', solution: why }
}

export const numberLineQuestionTypes: QuestionType[] = [
  { id: 'readDNL', name: 'Reading double number lines', unlockLevel: 1, make: readLine },
  { id: 'dnlTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'extendDNL', name: 'Going further', unlockLevel: 2, make: extend },
  { id: 'unitPrice', name: 'Price of one', unlockLevel: 2, make: unitPrice },
  { id: 'faster', name: 'Who is faster?', unlockLevel: 3, make: sameRate },
  { id: 'sameRate', name: 'Same rate?', unlockLevel: 4, make: isSameRate },
]
