/**
 * Grade 6, Unit 3 (Unit Rates and Percentages) — section "Units of Measurement".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'

/** Exact conversions inside one system: 1 big = f small. */
const EXACT = [
  { big: 'foot', bigs: 'feet', small: 'inch', smalls: 'inches', f: 12 },
  { big: 'yard', bigs: 'yards', small: 'foot', smalls: 'feet', f: 3 },
  { big: 'meter', bigs: 'meters', small: 'centimeter', smalls: 'centimeters', f: 100 },
  { big: 'kilometer', bigs: 'kilometers', small: 'meter', smalls: 'meters', f: 1000 },
  { big: 'kilogram', bigs: 'kilograms', small: 'gram', smalls: 'grams', f: 1000 },
  { big: 'hour', bigs: 'hours', small: 'minute', smalls: 'minutes', f: 60 },
  { big: 'gallon', bigs: 'gallons', small: 'quart', smalls: 'quarts', f: 4 },
  { big: 'pound', bigs: 'pounds', small: 'ounce', smalls: 'ounces', f: 16 },
]
/** Conversions between systems (approximate, as used in the curriculum). */
const APPROX = [
  { a: 'kilogram', as: 'kilograms', b: 'pound', bs: 'pounds', f: 2.2 },
  { a: 'inch', as: 'inches', b: 'centimeter', bs: 'centimeters', f: 2.54 },
  { a: 'mile', as: 'miles', b: 'kilometer', bs: 'kilometers', f: 1.6 },
]
const COMPARE: [string, string, string][] = [
  ['1 inch', '1 centimeter', '1 inch'], ['1 kilogram', '1 pound', '1 kilogram'], ['1 mile', '1 kilometer', '1 mile'],
  ['1 meter', '1 yard', '1 meter'], ['1 liter', '1 quart', '1 liter'], ['1 gallon', '1 liter', '1 gallon'], ['1 meter', '1 foot', '1 meter'],
]

function whichIsBigger(): Question {
  const [x, y, big] = pick(COMPARE)
  const [first, second] = shuffle([x, y])
  const heavy = /gram|pound/.test(x)
  const vol = /liter|quart|gallon/.test(x)
  const word = heavy ? 'heavier' : vol ? 'more' : 'longer'
  const facts: Record<string, string> = {
    '1 inch': '1 inch is about 2.54 centimeters.', '1 kilogram': '1 kilogram is about 2.2 pounds.', '1 mile': '1 mile is about 1.6 kilometers.',
    '1 meter': '1 meter is a bit more than 1 yard (about 3.3 feet).', '1 liter': '1 liter is a little more than 1 quart.', '1 gallon': '1 gallon is almost 4 liters.',
  }
  return {
    name: 'Which is bigger?',
    prompt: `Which is ${word}: ${first} or ${second}?`,
    choices: [first, second].map((c) => ({ label: c, ok: c === big, why: facts[big] })),
    hint: 'Think about things you know: a ruler has inches and centimeters, a big bottle of soda is 2 liters.',
    solution: facts[big],
  }
}

function sameSystem(): Question {
  const c = pick(EXACT)
  const toSmall = Math.random() < 0.6
  const n = R(2, c.f >= 100 ? 9 : 12)
  return toSmall ? {
    name: 'Convert',
    prompt: `1 ${c.big} = ${c.f} ${c.smalls}. How many ${c.smalls} are in ${n} ${c.bigs}?`,
    unit: c.smalls, answer: n * c.f,
    hint: `Every ${c.big} is ${c.f} ${c.smalls}. Multiply.`,
    solution: `${n} × ${c.f} = ${n * c.f} ${c.smalls}`,
  } : {
    name: 'Convert',
    prompt: `1 ${c.big} = ${c.f} ${c.smalls}. How many ${c.bigs} are in ${n * c.f} ${c.smalls}?`,
    unit: c.bigs, answer: n,
    hint: `How many groups of ${c.f} are in ${n * c.f}? Divide.`,
    solution: `${n * c.f} ÷ ${c.f} = ${n} ${c.bigs}`,
  }
}

function acrossSystems(): Question {
  const c = pick(APPROX)
  const forward = Math.random() < 0.5
  const n = R(2, c.f === 2.2 ? 50 : 15)
  const other = +(n * c.f).toFixed(2)
  return forward ? {
    name: 'Across systems',
    prompt: `1 ${c.a} is about ${c.f} ${c.bs}. About how many ${c.bs} is ${n} ${c.as}?`,
    unit: c.bs, answer: other,
    hint: `Each ${c.a} is ${c.f} ${c.bs}. Multiply ${n} by ${c.f}.`,
    solution: `${n} × ${c.f} = ${fmt(other)} ${c.bs}`,
  } : {
    name: 'Across systems',
    prompt: `1 ${c.a} is about ${c.f} ${c.bs}. About how many ${c.as} is ${fmt(other)} ${c.bs}?`,
    unit: c.as, answer: n,
    hint: `How many groups of ${c.f} fit in ${fmt(other)}? Divide.`,
    solution: `${fmt(other)} ÷ ${c.f} = ${n} ${c.as}`,
  }
}

function moreOrFewer(): Question {
  const c = pick(EXACT)
  const n = R(3, 20)
  const toSmall = Math.random() < 0.5
  const [from, to] = toSmall ? [c.bigs, c.smalls] : [c.smalls, c.bigs]
  return {
    name: 'More or fewer?',
    prompt: `You measure something as ${n} ${from}. If you measure it in ${to} instead, will the number be bigger or smaller than ${n}?`,
    choices: [
      { label: `Bigger than ${n}`, ok: toSmall, why: `${to} are ${toSmall ? 'smaller' : 'bigger'} units, so you need ${toSmall ? 'more' : 'fewer'} of them.` },
      { label: `Smaller than ${n}`, ok: !toSmall, why: `${to} are ${toSmall ? 'smaller' : 'bigger'} units, so you need ${toSmall ? 'more' : 'fewer'} of them.` },
    ],
    hint: 'Smaller units means you need more of them to cover the same thing.',
    solution: `1 ${c.big} = ${c.f} ${c.smalls}. ${toSmall ? `Smaller units, so more of them: ${n * c.f} ${c.smalls}.` : `Bigger units, so fewer of them.`}`,
  }
}

function conversionTable(): Question {
  const c = pick(APPROX)
  const ks = shuffle([2, 3, 4, 5, 10, 20]).slice(0, 2).sort((x, y) => x - y)
  const n = R(6, 30)
  const askLeft = Math.random() < 0.4
  const rows: (string | number)[][] = [[1, c.f], ...ks.map((k) => [k, +(k * c.f).toFixed(2)]), askLeft ? ['?', +(n * c.f).toFixed(2)] : [n, '?']]
  return {
    name: 'Conversion table',
    prompt: 'Use the table to find the missing number.',
    table: { cols: [c.as, c.bs], rows, highlight: 3 },
    answer: askLeft ? n : +(n * c.f).toFixed(2),
    hint: askLeft ? `Divide by ${c.f}.` : `Multiply by ${c.f}.`,
    solution: askLeft ? `${fmt(n * c.f)} ÷ ${c.f} = ${n}` : `${n} × ${c.f} = ${fmt(n * c.f)}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['1 kilogram is heavier than 1 pound.', true, '1 kilogram is about 2.2 pounds.'],
  ['Measuring in a smaller unit gives a bigger number.', true, 'You need more small units to cover the same thing.'],
  ['12 inches is the same length as 1 foot.', true, 'That’s the definition of a foot.'],
  ['1 centimeter is longer than 1 inch.', false, '1 inch is about 2.54 centimeters.'],
  ['A canoe that weighs 99 pounds weighs about 45 kilograms.', true, '99 ÷ 2.2 = 45.'],
  ['A mile is shorter than a kilometer.', false, 'A mile is about 1.6 kilometers.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Picture the two units side by side.', solution: why }
}

export const measureQuestionTypes: QuestionType[] = [
  { id: 'bigger', name: 'Which is bigger?', unlockLevel: 1, make: whichIsBigger },
  { id: 'sameSys', name: 'Converting units', unlockLevel: 1, make: sameSystem },
  { id: 'measureTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'moreFewer', name: 'More or fewer?', unlockLevel: 2, make: moreOrFewer },
  { id: 'across', name: 'Metric and customary', unlockLevel: 2, make: acrossSystems },
  { id: 'convTable', name: 'Conversion tables', unlockLevel: 3, make: conversionTable },
]
