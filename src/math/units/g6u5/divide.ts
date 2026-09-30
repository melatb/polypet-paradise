/**
 * Grade 6, Unit 5 (Arithmetic in Base Ten) — dividing whole numbers and decimals.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'
import { dec } from './addsub'

function wholeDivision(): Question {
  const d = R(3, 9), q = R(12, 199)
  return {
    name: 'Divide',
    prompt: `${d * q} ÷ ${d} = ?`,
    answer: q,
    hint: `Take away big groups first: how many groups of ${d} × 100? Then ${d} × 10, then single ${d}s. Add up the groups.`,
    solution: `${d * q} ÷ ${d} = ${q}. Check: ${d} × ${q} = ${d * q}.`,
  }
}

function partialQuotients(): Question {
  const d = R(3, 9)
  const h = R(1, 3), t = R(1, 9), o = R(1, 9)
  const q = h * 100 + t * 10 + o, n = d * q
  const ask = pick(['h', 't', 'o'] as const)
  const shown = { h: `${d} groups of ${h * 100} (that's ${d * h * 100})`, t: `${d} groups of ${t * 10} (that's ${d * t * 10})`, o: `${d} groups of ${o} (that's ${d * o})` }
  const steps = (['h', 't', 'o'] as const).map((k) => (k === ask ? `${d} groups of ?` : shown[k]))
  const ans = ask === 'h' ? h * 100 : ask === 't' ? t * 10 : o
  return {
    name: 'Partial quotients',
    prompt: `Lin divides ${n} by ${d} in steps. She takes away ${steps.join(', then ')}. What is the missing number?`,
    answer: ans,
    hint: `All the groups together must add up to ${n}. What's left after the other two steps? Divide that by ${d}.`,
    solution: `The missing step is ${d} × ${ans} = ${d * ans}. Altogether ${n} ÷ ${d} = ${h * 100} + ${t * 10} + ${o} = ${q}.`,
  }
}

function decimalQuotient(): Question {
  const d = pick([2, 4, 5, 8, 20, 25])
  let n = 0
  do { n = R(11, 250) } while (n % d === 0)
  const q = n / d
  return {
    name: 'Decimal answers',
    prompt: `${n} grams of trail mix are shared equally by ${d} people. How many grams does each person get?`,
    unit: 'grams', answer: q,
    hint: `Share out whole grams first, then keep going with the leftover by splitting it into tenths and hundredths.`,
    solution: `${n} ÷ ${d} = ${q}`,
  }
}

function decimalDivisor(): Question {
  const b = R(2, 12), q = R(2, 15)
  const pb = pick([1, 2])
  const a = b * q
  const bStr = dec(b, pb), aStr = dec(a, pb)
  return {
    name: 'Dividing by a decimal',
    prompt: `${aStr} ÷ ${bStr} = ?`,
    answer: q,
    hint: `Multiply both numbers by ${10 ** pb} so the divisor is a whole number: ${a} ÷ ${b}. The answer doesn't change.`,
    solution: `${aStr} ÷ ${bStr} = ${a} ÷ ${b} = ${q}`,
  }
}

function ropeStory(): Question {
  const piece = pick([25, 50, 75, 125, 150]) // hundredths of a meter
  const count = R(3, 16)
  const total = piece * count
  return {
    name: 'How many pieces?',
    prompt: `A rope is ${dec(total, 2)} meters long. It is cut into pieces that are each ${dec(piece, 2)} meters. How many pieces are there?`,
    unit: 'pieces', answer: count,
    hint: `Divide ${dec(total, 2)} by ${dec(piece, 2)}. Multiply both by 100 first to get whole numbers.`,
    solution: `${dec(total, 2)} ÷ ${dec(piece, 2)} = ${total} ÷ ${piece} = ${count}`,
  }
}

function checkIt(): Question {
  const d = R(3, 9), q = R(21, 199)
  const wrong = shuffle([q + 10, q - 10, q + 1, q * 10]).slice(0, 2)
  return {
    name: 'Check the answer',
    prompt: `Which is the correct answer to ${d * q} ÷ ${d}? Use multiplication to check.`,
    choices: shuffle([q, ...wrong].map((v) => ({ label: String(v), ok: v === q, why: `Check: ${d} × ${v} = ${d * v}, not ${d * q}.` }))),
    hint: `Multiply each choice by ${d}. The right one gives ${d * q}.`,
    solution: `${d} × ${q} = ${d * q}, so ${q} is right.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['65 ÷ 4 = 16.25', true, '10 + 6 + 0.2 + 0.05 = 16.25 grams each.'],
  ['You can check a division answer by multiplying.', true, '7 × 112 = 784, so 784 ÷ 7 = 112.'],
  ['1.2 ÷ 0.4 is the same as 12 ÷ 4.', true, 'Multiplying both numbers by 10 keeps the quotient the same.'],
  ['Dividing by 0.5 gives a smaller answer than you started with.', false, 'Dividing by 0.5 doubles it: 6 ÷ 0.5 = 12.'],
  ['In 784 ÷ 7, subtracting 700 means taking away 7 groups of 100.', true, 'That is a partial quotient of 100.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try checking with multiplication.', solution: why }
}

export const divideQuestionTypes: QuestionType[] = [
  { id: 'wholeDiv', name: 'Dividing whole numbers', unlockLevel: 1, make: wholeDivision },
  { id: 'check', name: 'Checking answers', unlockLevel: 1, make: checkIt },
  { id: 'divDecTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'partial', name: 'Partial quotients', unlockLevel: 2, make: partialQuotients },
  { id: 'decQuot', name: 'Decimal answers', unlockLevel: 2, make: decimalQuotient },
  { id: 'decDivisor', name: 'Dividing by decimals', unlockLevel: 3, make: decimalDivisor },
  { id: 'rope', name: 'Word problems', unlockLevel: 4, make: ropeStory },
]
