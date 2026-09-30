/**
 * Grade 6, Unit 7 (Rational Numbers) — negative numbers and absolute value.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { numberLine, sn } from '../../dataDiagrams'
import type { Question, QuestionType } from '../../types'

const nz = (lo: number, hi: number) => { let v = 0; while (v === 0) v = R(lo, hi); return v }

function readPoint(): Question {
  const v = R(-9, 9)
  return {
    name: 'Read the number line',
    prompt: 'What number is the point at?',
    answer: v, allowNegative: true, inputHint: 'Use - for negative numbers, like -3.',
    figure: () => numberLine(-10, 10, [{ v, t: '?' }], 'Number line from −10 to 10 with one point', 2),
    hint: 'Count the ticks from 0. Left of 0 is negative, right of 0 is positive.',
    solution: `The point is at ${sn(v)}.`,
  }
}

function compare(): Question {
  let a = 0, b = 0
  do { a = R(-15, 15); b = R(-15, 15) } while (a === b || (a >= 0 && b >= 0))
  const ctx = pick([
    { t: (x: number, y: number) => `Which temperature is colder: ${sn(x)}°C or ${sn(y)}°C?`, pickLow: true },
    { t: (x: number, y: number) => `Which is greater: ${sn(x)} or ${sn(y)}?`, pickLow: false },
    { t: (x: number, y: number) => `A diver is at ${sn(x)} meters and a bird is at ${sn(y)} meters (0 is sea level). Which one is higher?`, pickLow: false },
  ])
  const right = ctx.pickLow ? Math.min(a, b) : Math.max(a, b)
  return {
    name: 'Compare',
    prompt: ctx.t(a, b),
    figure: () => numberLine(-16, 16, [{ v: a, t: sn(a), color: '#7FD0FF' }, { v: b, t: sn(b), color: '#FF8FC1' }], `Number line with ${sn(a)} and ${sn(b)}`, 4),
    choices: [a, b].map((v) => ({ label: sn(v), ok: v === right, why: `On a number line, numbers to the right are greater. ${sn(Math.max(a, b))} is to the right of ${sn(Math.min(a, b))}.` })),
    hint: 'Picture them on a number line. The one further right is greater (warmer, higher).',
    solution: `${sn(Math.max(a, b))} > ${sn(Math.min(a, b))}`,
  }
}

function opposite(): Question {
  const v = nz(-20, 20)
  return {
    name: 'Opposites',
    prompt: `What is the opposite of ${sn(v)}?`,
    answer: -v, allowNegative: true, inputHint: 'Use - for negative numbers, like -3.',
    hint: 'Opposites are the same distance from 0, on different sides.',
    solution: `${sn(v)} and ${sn(-v)} are both ${Math.abs(v)} away from 0.`,
  }
}

function absoluteValue(): Question {
  const v = nz(-30, 30)
  const story = pick([
    { t: `What is |${sn(v)}|?` },
    { t: `A submarine is at ${sn(-Math.abs(v))} meters. How far is it from sea level?` },
    { t: `The temperature is ${sn(-Math.abs(v))}°F. How many degrees is that from 0°F?` },
  ])
  return {
    name: 'Absolute value',
    prompt: story.t,
    answer: Math.abs(v),
    hint: 'Absolute value is the distance from 0. Distance is never negative.',
    solution: `The distance from 0 is ${Math.abs(v)}.`,
  }
}

function smallest(): Question {
  const vals = shuffle([...new Set(Array.from({ length: 6 }, () => R(-12, 12)))]).slice(0, 4)
  while (vals.length < 4) vals.push(R(13, 20))
  const askMin = Math.random() < 0.5
  const right = askMin ? Math.min(...vals) : Math.max(...vals)
  return {
    name: 'Order numbers',
    prompt: `Which number is the ${askMin ? 'smallest' : 'greatest'}?`,
    choices: vals.map((v) => ({ label: sn(v), ok: v === right, why: `From least to greatest: ${[...vals].sort((x, y) => x - y).map(sn).join(', ')}.` })),
    hint: 'Negative numbers with bigger digits are further left, so they are smaller: −10 < −2.',
    solution: `From least to greatest: ${[...vals].sort((x, y) => x - y).map(sn).join(', ')}.`,
  }
}

function distanceAcross(): Question {
  const a = -R(1, 15), b = R(1, 15)
  const ctx = pick([
    `The temperature was ${sn(a)}°F in the morning and ${b}°F in the afternoon. How many degrees did it rise?`,
    `A fish is at ${sn(a)} feet and a seagull is at ${b} feet. How far apart are they?`,
  ])
  return {
    name: 'Across zero',
    prompt: ctx,
    answer: b - a,
    hint: `Go from ${sn(a)} up to 0 (that's ${-a}), then from 0 up to ${b}. Add them.`,
    solution: `${-a} + ${b} = ${b - a}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['−3 and 3 have the same absolute value.', true, 'Both are 3 units from 0.'],
  ['−8 is greater than −2.', false, '−8 is further left on the number line, so it is smaller.'],
  ['The opposite of −5 is 5.', true, 'Same distance from 0, other side.'],
  ['Absolute value can be negative.', false, 'It is a distance, so it is never negative.'],
  ['−10°C is colder than −1°C.', true, 'Lower temperatures are further left.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Picture a number line.', solution: why }
}

export const negativeQuestionTypes: QuestionType[] = [
  { id: 'readNL', name: 'Reading number lines', unlockLevel: 1, make: readPoint },
  { id: 'compareNeg', name: 'Comparing', unlockLevel: 1, make: compare },
  { id: 'negTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'opposite', name: 'Opposites', unlockLevel: 2, make: opposite },
  { id: 'abs', name: 'Absolute value', unlockLevel: 2, make: absoluteValue },
  { id: 'order', name: 'Ordering', unlockLevel: 3, make: smallest },
  { id: 'across', name: 'Across zero', unlockLevel: 4, make: distanceAcross },
]
