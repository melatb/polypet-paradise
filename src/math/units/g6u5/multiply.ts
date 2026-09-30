/**
 * Grade 6, Unit 5 (Arithmetic in Base Ten) — multiplying decimals.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { HELP } from '../../Figure'
import type { FigLabel, FigSeg, Question, QuestionType } from '../../types'
import { dec } from './addsub'

function powersOfTen(): Question {
  const u = R(101, 9999), p = R(1, 3)
  const m = pick([10, 100, 1000, 0.1, 0.01])
  const places = p + (m < 1 ? (m === 0.1 ? 1 : 2) : 0)
  const shift = m >= 1 ? Math.log10(m) : 0
  const resultUnits = u * (m >= 1 ? 10 ** shift : 1)
  return {
    name: 'Times 10, 100, 1000',
    prompt: `${dec(u, p)} × ${m} = ?`,
    answer: resultUnits / 10 ** places,
    hint: m >= 1 ? `Multiplying by ${m} moves every digit ${shift} place${shift > 1 ? 's' : ''} to the left (the number gets bigger).` : `Multiplying by ${m} is the same as dividing by ${Math.round(1 / m)}: every digit moves ${m === 0.1 ? 1 : 2} place${m === 0.1 ? '' : 's'} to the right.`,
    solution: `${dec(u, p)} × ${m} = ${dec(resultUnits, places)}`,
  }
}

function areaModel(): Question {
  // Tenths of at least 0.4 keep the thin strips of the diagram wide enough to read.
  const a1 = R(1, 3), a2 = R(4, 9), b1 = R(1, 2), b2 = R(4, 9)
  const A = a1 * 10 + a2, B = b1 * 10 + b2 // in tenths
  const prod = A * B // hundredths
  const k = Math.min(1.6, 7 / (A / 10), 4.5 / (B / 10))
  const W = (A / 10) * k, H = (B / 10) * k, X = a1 * k, Y = b1 * k
  const parts = [a1 * b1, (a1 * b2) / 10, (a2 * b1) / 10, (a2 * b2) / 100]
  return {
    name: 'Area model',
    prompt: `Use the area model to find ${dec(A, 1)} × ${dec(B, 1)}.`,
    answer: prod / 100,
    figure: (help) => {
      const segs: FigSeg[] = [{ a: [X, 0], b: [X, H], color: '#1E2A4A', solid: true }, { a: [0, Y], b: [W, Y], color: '#1E2A4A', solid: true }]
      const labels: FigLabel[] = [
        { x: X / 2, y: -0.5, t: a1 }, { x: X + (W - X) / 2, y: -0.5, t: dec(a2, 1) },
        { x: -0.6, y: Y / 2, t: b1 }, { x: -0.6, y: Y + (H - Y) / 2, t: dec(b2, 1) },
      ]
      if (help) {
        labels.push(
          { x: X / 2, y: Y / 2, t: parts[0], color: HELP, small: true }, { x: X + (W - X) / 2, y: Y / 2, t: String(+parts[2].toFixed(2)), color: HELP, small: true },
          { x: X / 2, y: Y + (H - Y) / 2, t: String(+parts[1].toFixed(2)), color: HELP, small: true }, { x: X + (W - X) / 2, y: Y + (H - Y) / 2, t: String(+parts[3].toFixed(2)), color: HELP, small: true },
        )
      }
      return { x0: -1.4, x1: W + 0.6, y0: -1.1, y1: H + 0.5, alt: `Area model for ${dec(A, 1)} times ${dec(B, 1)}`, polys: [{ pts: [[0, 0], [W, 0], [W, H], [0, H]] }], segs, labels }
    },
    hint: `Split ${dec(A, 1)} into ${a1} + ${dec(a2, 1)} and ${dec(B, 1)} into ${b1} + ${dec(b2, 1)}. Find the area of each of the 4 smaller rectangles and add them.`,
    solution: `${parts.map((x) => +x.toFixed(2)).join(' + ')} = ${dec(prod, 2)}`,
  }
}

function placeThePoint(): Question {
  const A = R(11, 99), B = R(11, 99)
  const pa = R(1, 2), pb = R(0, 1)
  const prod = A * B, places = pa + pb
  const right = dec(prod, places)
  const opts = [...new Set([places, places + 1, places + 2, places - 1].filter((x) => x >= 0).map((x) => dec(prod, x)))]
  return {
    name: 'Place the decimal point',
    prompt: `${A} × ${B} = ${prod}. What is ${dec(A, pa)} × ${dec(B, pb)}?`,
    choices: shuffle([...new Set(opts)].map((o) => ({ label: o, ok: o === right, why: `${dec(A, pa)} has ${pa} decimal place${pa > 1 ? 's' : ''} and ${dec(B, pb)} has ${pb}. So the answer has ${places}.` }))),
    hint: `Estimate! ${dec(A, pa)} is about ${Math.round(A / 10 ** pa)} and ${dec(B, pb)} is about ${Math.round(B / 10 ** pb)}. Which choice is close to their product?`,
    solution: `${dec(A, pa)} × ${dec(B, pb)} = ${right}`,
  }
}

function priceStory(): Question {
  const perLb = R(129, 899), lbs = R(11, 49) // cents per pound, tenths of pounds
  const cents = perLb * lbs // in cents × tenths
  const item = pick(['cheese', 'grapes', 'cherries', 'coffee beans', 'turkey'])
  const verb = ['grapes', 'cherries', 'coffee beans'].includes(item) ? 'cost' : 'costs'
  return {
    name: 'Price per pound',
    prompt: `${item[0].toUpperCase() + item.slice(1)} ${verb} $${(perLb / 100).toFixed(2)} per pound. How much do ${dec(lbs, 1)} pounds cost? Round to the nearest cent.`,
    unit: 'dollars', answer: Math.round(cents / 10) / 100,
    hint: `Multiply ${(perLb / 100).toFixed(2)} × ${dec(lbs, 1)}. Then round to 2 decimal places.`,
    solution: `$${(perLb / 100).toFixed(2)} × ${dec(lbs, 1)} = $${dec(cents, 3)} ≈ $${(Math.round(cents / 10) / 100).toFixed(2)}`,
  }
}

function estimate(): Question {
  const A = R(15, 95), B = R(15, 95) // tenths
  const exact = (A * B) / 100
  const guess = Math.round(A / 10) * Math.round(B / 10)
  const opts = [...new Set([guess, guess * 10, Math.max(1, Math.round(guess / 10)), guess * 100])]
  return {
    name: 'Estimate',
    prompt: `Which is the best estimate for ${dec(A, 1)} × ${dec(B, 1)}?`,
    choices: shuffle(opts.map((o) => ({ label: `about ${o}`, ok: o === guess, why: `Round each number: ${Math.round(A / 10)} × ${Math.round(B / 10)} = ${guess}.` }))),
    hint: 'Round each number to the nearest whole number first.',
    solution: `${Math.round(A / 10)} × ${Math.round(B / 10)} = ${guess}. The exact answer is ${+exact.toFixed(2)}.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['2.9 × 1.6 = 4.64', true, '2 + 0.9 + 1.2 + 0.54 = 4.64.'],
  ['Multiplying by 0.1 makes a number 10 times smaller.', true, 'Multiplying by 0.1 is the same as dividing by 10.'],
  ['Multiplying two decimals always gives a bigger number.', false, '0.5 × 0.5 = 0.25, which is smaller than both.'],
  ['2.4 × 1.3 can be found by splitting a rectangle into smaller rectangles.', true, 'That is the area model.'],
  ['3.47 × 100 = 347', true, 'Every digit moves 2 places to the left.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Estimate to check.', solution: why }
}

export const multiplyQuestionTypes: QuestionType[] = [
  { id: 'pow10', name: 'Times 10, 100, 1000', unlockLevel: 1, make: powersOfTen },
  { id: 'mulTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'areaModel', name: 'Area models', unlockLevel: 2, make: areaModel },
  { id: 'point', name: 'Placing the decimal point', unlockLevel: 2, make: placeThePoint },
  { id: 'perPound', name: 'Price per pound', unlockLevel: 3, make: priceStory },
  { id: 'estMul', name: 'Estimating products', unlockLevel: 4, make: estimate },
]
