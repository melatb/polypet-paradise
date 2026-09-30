/**
 * Grade 6, Unit 5 (Arithmetic in Base Ten) — adding and subtracting decimals, and place value.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'

/** Integer count of 1/10^places → tidy decimal string ("7.308", "12.5", "3"). */
export function dec(units: number, places: number): string {
  const s = (units / 10 ** places).toFixed(places)
  return places ? s.replace(/\.?0+$/, '') : s
}
/** Random decimal as [integer units, places]. */
export const rnd = (maxWhole: number, places: number): [number, number] => [R(1, maxWhole * 10 ** places), places]
const toPlaces = ([u, p]: [number, number], P: number) => u * 10 ** (P - p)

const PLACES = ['thousands', 'hundreds', 'tens', 'ones', 'tenths', 'hundredths', 'thousandths']
function placeValue(): Question {
  let digits = ''
  while (!/^[1-9]/.test(digits) || new Set(digits).size < digits.length) digits = String(R(1000000, 9999999))
  const whole = R(1, 4), frac = R(1, 3)
  let d = digits.slice(0, whole + frac)
  // A trailing 0 after the point looks odd; swap in a digit that isn't used yet, so every digit stays unique.
  if (d.endsWith('0')) d = d.slice(0, -1) + '123456789'.split('').find((c) => !d.includes(c))!
  const num = `${d.slice(0, whole)}.${d.slice(whole)}`
  const i = R(0, d.length - 1)
  const place = PLACES[3 - (whole - 1) + i]
  const opts = shuffle([...new Set([place, ...shuffle(PLACES.filter((p) => p !== place)).slice(0, 3)])])
  return {
    name: 'Place value',
    prompt: `In ${num}, what does the digit ${d[i]} stand for?`,
    choices: opts.map((p) => ({ label: `${d[i]} ${p}`, ok: p === place, why: 'Count places from the decimal point: tenths are just right of it, ones just left of it.' })),
    hint: 'Right after the decimal point come tenths, then hundredths, then thousandths. Left of it: ones, tens, hundreds.',
    solution: `The ${d[i]} is in the ${place} place.`,
  }
}

function addDecimals({ level }: { level: number }): Question {
  const a = rnd(level >= 3 ? 99 : 20, R(1, 2)), b = rnd(level >= 3 ? 20 : 9, R(1, 3))
  const P = Math.max(a[1], b[1])
  const sum = toPlaces(a, P) + toPlaces(b, P)
  return {
    name: 'Add decimals',
    prompt: `${dec(...a)} + ${dec(...b)} = ?`,
    answer: sum / 10 ** P,
    hint: 'Line up the decimal points so tenths add to tenths and hundredths to hundredths. Ten of one unit bundles into 1 of the next.',
    solution: `${dec(...a)} + ${dec(...b)} = ${dec(sum, P)}`,
  }
}

function subtractDecimals({ level }: { level: number }): Question {
  let a = rnd(level >= 3 ? 50 : 20, R(0, 2)), b = rnd(level >= 3 ? 20 : 9, R(1, 2))
  const P = Math.max(a[1], b[1])
  while (toPlaces(b, P) === toPlaces(a, P)) b = rnd(9, b[1])
  if (toPlaces(b, P) > toPlaces(a, P)) [a, b] = [b, a]
  const P2 = Math.max(a[1], b[1])
  const diff = toPlaces(a, P2) - toPlaces(b, P2)
  return {
    name: 'Subtract decimals',
    prompt: `${dec(...a)} − ${dec(...b)} = ?`,
    answer: diff / 10 ** P2,
    hint: `Line up the decimal points. You can write ${dec(...a)} as ${(a[0] / 10 ** a[1]).toFixed(P2)} so both numbers have the same places, then unbundle when you need to.`,
    solution: `${dec(...a)} − ${dec(...b)} = ${dec(diff, P2)}`,
  }
}

const ITEMS = ['a sandwich', 'a juice', 'a book', 'a toy car', 'a notebook', 'a bag of pretzels', 'a pack of stickers']
function change(): Question {
  const [x, y] = shuffle(ITEMS).slice(0, 2)
  const a = R(105, 1299), b = R(55, 899)
  const paid = [1000, 2000, 5000].find((p) => p > a + b) ?? 5000
  const left = paid - a - b
  return {
    name: 'Making change',
    prompt: `Diego buys ${x} for $${(a / 100).toFixed(2)} and ${y} for $${(b / 100).toFixed(2)}. He pays with a $${paid / 100} bill. How much change does he get?`,
    unit: 'dollars', answer: left / 100,
    hint: 'Add the two prices first, then subtract from the bill.',
    solution: `$${(a / 100).toFixed(2)} + $${(b / 100).toFixed(2)} = $${((a + b) / 100).toFixed(2)}, and $${paid / 100} − $${((a + b) / 100).toFixed(2)} = $${(left / 100).toFixed(2)}`,
  }
}

function missingAddend(): Question {
  const a = rnd(20, R(1, 2)), b = rnd(20, R(1, 3))
  const P = Math.max(a[1], b[1])
  const sum = toPlaces(a, P) + toPlaces(b, P)
  return {
    name: 'Missing number',
    prompt: `? + ${dec(...b)} = ${dec(sum, P)}. What is the missing number?`,
    answer: toPlaces(a, P) / 10 ** P,
    hint: `Subtract: ${dec(sum, P)} − ${dec(...b)}.`,
    solution: `${dec(sum, P)} − ${dec(...b)} = ${dec(toPlaces(a, P), P)}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['In 207.5, the 5 stands for 5 tenths.', true, 'It is the first place after the decimal point.'],
  ['0.9 + 0.3 = 0.12', false, '9 tenths + 3 tenths = 12 tenths = 1.2.'],
  ['When adding decimals, you line up the decimal points.', true, 'So each place adds to the same place.'],
  ['6.54 + 0.768 = 7.308', true, 'Line up the places and bundle when you get 10 of something.'],
  ['0.5 is the same as 0.50.', true, '5 tenths = 50 hundredths.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think about place value.', solution: why }
}

export const addSubQuestionTypes: QuestionType[] = [
  { id: 'placeValue', name: 'Place value', unlockLevel: 1, make: placeValue },
  { id: 'addDec', name: 'Adding decimals', unlockLevel: 1, make: addDecimals },
  { id: 'decTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'subDec', name: 'Subtracting decimals', unlockLevel: 2, make: subtractDecimals },
  { id: 'change', name: 'Making change', unlockLevel: 3, make: change },
  { id: 'missingAdd', name: 'Missing numbers', unlockLevel: 4, make: missingAddend },
]
