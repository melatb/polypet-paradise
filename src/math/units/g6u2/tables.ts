/**
 * Grade 6, Unit 2 (Introducing Ratios) — tables of equivalent ratios and part-part-whole (tape diagrams).
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { COLORS, tape } from '../../ratioDiagrams'
import type { Question, QuestionType } from '../../types'

const TABLES: { cols: [string, string]; base: [number, number][] }[] = [
  { cols: ['tickets', 'price ($)'], base: [[5, 6], [3, 4], [4, 10]] },
  { cols: ['cups of flour', 'eggs'], base: [[3, 2], [2, 1], [5, 2]] },
  { cols: ['minutes', 'miles'], base: [[60, 45], [10, 8], [20, 15]] },
  { cols: ['red paint (cups)', 'white paint (cups)'], base: [[2, 5], [3, 4], [1, 3]] },
]

function fillTable(): Question {
  const t = pick(TABLES)
  const [a, b] = pick(t.base)
  const ks = shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 2).sort((x, y) => x - y)
  const rows: (number | string)[][] = [[a, b], [a * ks[0], b * ks[0]], [a * ks[1], b * ks[1]]]
  const r = R(1, 2), c = R(0, 1)
  const answer = rows[r][c] as number
  rows[r][c] = '?'
  const k = ks[r - 1]
  return {
    name: 'Ratio table',
    prompt: 'The rows of this table are equivalent ratios. What is the missing number?',
    table: { cols: t.cols, rows, highlight: r },
    answer,
    hint: `Compare with the first row. What was the other number in that row multiplied by?`,
    solution: `That row is the first row times ${k}: ${c === 0 ? a : b} × ${k} = ${answer}`,
  }
}

const RATE_CTX: { cols: [string, string]; rates: number[] }[] = [
  { cols: ['minutes', 'miles'], rates: [0.25, 0.5, 0.75] },
  { cols: ['tickets', 'price ($)'], rates: [1.2, 1.5, 2.5, 3] },
  { cols: ['pounds', 'cost ($)'], rates: [0.75, 1.5, 2.5, 3] },
]
function throughOne(): Question {
  const c = pick(RATE_CTX)
  const r = pick(c.rates)
  const t0 = pick([4, 5, 8, 10, 20, 60])
  const d0 = +(r * t0).toFixed(2)
  let t1 = R(2, 30)
  if (t1 === t0) t1++
  const ans = +(r * t1).toFixed(2)
  return {
    name: 'Find 1 first',
    prompt: `At the same rate, what goes with ${t1} ${c.cols[0]}?`,
    table: { cols: c.cols, rows: [[t0, d0], [1, '?'], [t1, '?']], highlight: 2 },
    answer: ans,
    hint: `First find the row for 1: divide ${fmt(d0)} by ${t0}. Then multiply by ${t1}.`,
    solution: `${fmt(d0)} ÷ ${t0} = ${fmt(r)} for each 1, and ${fmt(r)} × ${t1} = ${fmt(ans)}.`,
  }
}

function scaleUp(): Question {
  const [a, b] = pick([[5, 6], [4, 3], [2, 5], [3, 8]] as [number, number][])
  const k = pick([10, 20, 25, 30, 40, 50, 60, 100])
  return {
    name: 'Big numbers',
    prompt: `${a} raffle tickets cost $${b}. How much do ${a * k} tickets cost?`,
    table: { cols: ['tickets', 'price ($)'], rows: [[a, b], [a * k, '?']], highlight: 1 },
    unit: 'dollars', answer: b * k,
    hint: `How many times ${a} is ${a * k}? Multiply the price by the same number.`,
    solution: `${a * k} ÷ ${a} = ${k}, so ${b} × ${k} = $${b * k}.`,
  }
}

const PARTS: [string, string][] = [['red beads', 'blue beads'], ['cups of juice', 'cups of soda water'], ['dogs', 'cats'], ['blue paint (cups)', 'yellow paint (cups)']]
function partPartWhole(): Question {
  const [A, B] = pick(PARTS)
  let p = 0, q = 0
  do { p = R(1, 5); q = R(1, 5) } while (p === q)
  const each = R(2, 9), total = (p + q) * each
  const ask = pick(['A', 'B', 'total'] as const)
  const answer = ask === 'A' ? p * each : ask === 'B' ? q * each : total
  const prompt = ask === 'total'
    ? `The ratio of ${A} to ${B} is ${p} : ${q}. There are ${p * each} ${A}. How many are there altogether?`
    : `The ratio of ${A} to ${B} is ${p} : ${q}. There are ${total} altogether. How many ${ask === 'A' ? A : B} are there?`
  return {
    name: 'Tape diagram',
    prompt,
    answer,
    figure: (help) => tape([{ boxes: p, name: A, color: COLORS.a }, { boxes: q, name: B, color: COLORS.b }], `Tape diagram, ${p} parts to ${q} parts`,
      { each: help ? String(each) : undefined, total: ask === 'total' ? 'total ?' : `total ${total}` }),
    hint: ask === 'total' ? `The ${p} ${A} boxes share ${p * each}, so each box is ${each}. Now count all the boxes.` : `There are ${p + q} equal boxes in all. Divide ${total} by ${p + q} to find one box.`,
    solution: ask === 'total' ? `Each box is ${each}, and there are ${p + q} boxes: ${total}.` : `Each box is ${total} ÷ ${p + q} = ${each}, so ${ask === 'A' ? p : q} boxes make ${answer}.`,
  }
}

function oddRowOut(): Question {
  const [a, b] = pick([[2, 3], [3, 5], [4, 7], [5, 2], [3, 4]] as [number, number][])
  const ks = shuffle([2, 3, 4, 5, 6, 7]).slice(0, 3).sort((x, y) => x - y)
  const good: [number, number][] = [[a, b], ...ks.map((k) => [a * k, b * k] as [number, number])]
  const bad = good[R(1, 3)]
  const d = R(1, 3)
  const wrong: [number, number] = pick([[bad[0] + d, bad[1] + d], [bad[0], bad[1] + d]] as [number, number][])
  const rows = good.map((g) => (g === bad ? wrong : g))
  return {
    name: 'Odd row out',
    prompt: 'One row of this table is NOT an equivalent ratio. Which one?',
    table: { cols: ['cups of blue', 'cups of yellow'], rows },
    choices: rows.map((r) => ({
      label: `${r[0]} and ${r[1]}`, ok: r === wrong,
      why: r === wrong ? undefined : `${r[0]} and ${r[1]} is ${a} and ${b} times ${fmt(r[0] / a)}. That one works.`,
    })),
    hint: `Every good row is the first row times some number. Check each row: is ${a} → first number the same multiplier as ${b} → second number?`,
    solution: `${wrong[0]} ÷ ${a} and ${wrong[1]} ÷ ${b} don't match, so that row doesn't belong.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['In a table of equivalent ratios, you can multiply both columns by the same number to make a new row.', true, 'That keeps the ratio the same.'],
  ['Finding the row for 1 can help you find any other row.', true, 'Divide to get 1, then multiply.'],
  ['If a table has 5 and 6 in one row, 10 and 11 could be another row.', false, 'Doubling 5 and 6 gives 10 and 12.'],
  ['In a tape diagram, every box is the same size.', true, 'Each box stands for the same amount.'],
  ['If the ratio of red to blue is 2 : 3, then 2 out of every 5 are red.', true, '2 + 3 = 5 parts in each group.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think about equivalent ratios.', solution: why }
}

export const tableQuestionTypes: QuestionType[] = [
  { id: 'fillTable', name: 'Ratio tables', unlockLevel: 1, make: fillTable },
  { id: 'tableTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'scaleUp', name: 'Big numbers', unlockLevel: 2, make: scaleUp },
  { id: 'throughOne', name: 'Find 1 first', unlockLevel: 2, make: throughOne },
  { id: 'tape', name: 'Tape diagrams', unlockLevel: 3, make: partPartWhole },
  { id: 'oddRow', name: 'Odd row out', unlockLevel: 4, make: oddRowOut },
]
