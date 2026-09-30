/**
 * Grade 6, Unit 7 (Rational Numbers) — common factors and common multiples.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { gcd } from '../../fractions'
import type { Question, QuestionType } from '../../types'

const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

function greatestFactor(): Question {
  const g = R(2, 12), a = g * R(2, 7)
  let b = g * R(2, 7)
  while (b === a) b = g * R(2, 7)
  const G = gcd(a, b)
  return {
    name: 'Greatest common factor',
    prompt: `What is the greatest common factor of ${a} and ${b}?`,
    answer: G,
    hint: `List the factors of each number (numbers that divide it evenly). Which is the biggest one on both lists?`,
    solution: `The GCF of ${a} and ${b} is ${G}: ${a} = ${G} × ${a / G} and ${b} = ${G} × ${b / G}.`,
  }
}

function leastMultiple(): Question {
  let a = 0, b = 0
  do { a = R(2, 15); b = R(2, 15) } while (a === b || lcm(a, b) > 120)
  const L = lcm(a, b)
  return {
    name: 'Least common multiple',
    prompt: `What is the least common multiple of ${a} and ${b}?`,
    answer: L,
    commonSlip: a * b !== L ? { value: a * b, message: `${a * b} is a common multiple, but there's a smaller one.` } : undefined,
    hint: `Count by ${Math.max(a, b)}s and check which number ${Math.min(a, b)} also goes into.`,
    solution: `Multiples of ${a}: ${Array.from({ length: L / a }, (_, i) => a * (i + 1)).join(', ')}. ${L} is the first that ${b} also divides.`,
  }
}

function sandwichStory(): Question {
  let a = 0, b = 0
  do { a = pick([6, 8, 10, 12, 15]); b = pick([4, 6, 9, 10, 15, 20]) } while (a === b || lcm(a, b) === Math.max(a, b))
  const L = lcm(a, b)
  const askWhat = pick(['total', 'loaves'] as const)
  return {
    name: 'No leftovers',
    prompt: askWhat === 'total'
      ? `A loaf of bread makes ${a} sandwiches. A package of cheese makes ${b} sandwiches. What is the smallest number of sandwiches the cook can make with no bread or cheese left over?`
      : `A loaf of bread makes ${a} sandwiches and a package of cheese makes ${b}. To use everything up with no leftovers, making as few sandwiches as possible, how many loaves of bread are needed?`,
    answer: askWhat === 'total' ? L : L / a,
    hint: `You need a number of sandwiches that is a multiple of ${a} AND of ${b}. Find the smallest one.`,
    solution: `The least common multiple of ${a} and ${b} is ${L} sandwiches: ${L / a} loaves and ${L / b} packages.`,
  }
}

function equalGroups(): Question {
  const g = R(3, 12)
  const a = g * R(2, 6)
  let b = g * R(2, 6)
  while (b === a) b = g * R(2, 6)
  const G = gcd(a, b)
  const [x, y] = pick([['pencils', 'erasers'], ['apples', 'oranges'], ['stickers', 'bookmarks']])
  return {
    name: 'Equal groups',
    prompt: `There are ${a} ${x} and ${b} ${y}. You want to make identical gift bags with nothing left over. What is the greatest number of bags you can make?`,
    answer: G,
    hint: `The number of bags must divide both ${a} and ${b}. Find the greatest common factor.`,
    solution: `The GCF is ${G}, so ${G} bags, each with ${a / G} ${x} and ${b / G} ${y}.`,
  }
}

function isFactor(): Question {
  const n = R(12, 60)
  const factors = Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0 && d > 1 && d < n)
  if (!factors.length) return isFactor()
  const f = pick(factors)
  const non = shuffle(Array.from({ length: 12 }, (_, i) => i + 2).filter((d) => n % d !== 0)).slice(0, 3)
  return {
    name: 'Is it a factor?',
    prompt: `Which number is a factor of ${n}?`,
    choices: shuffle([f, ...non]).map((v) => ({ label: String(v), ok: v === f, why: `${n} ÷ ${v} = ${+(n / v).toFixed(2)}${n % v ? ', which is not a whole number' : ''}.` })),
    hint: 'A factor divides the number evenly, with nothing left over.',
    solution: `${n} ÷ ${f} = ${n / f}, so ${f} is a factor of ${n}.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['2 and 6 are factors of 12.', true, '2 × 6 = 12.'],
  ['The greatest common factor of 18 and 24 is 6.', true, '6 divides both, and nothing bigger does.'],
  ['The least common multiple of 18 and 24 is 432.', false, '432 is a common multiple, but 72 is the least.'],
  ['Every number is a multiple of itself.', true, '1 times the number.'],
  ['The least common multiple of two numbers is always their product.', false, 'For 4 and 6 it is 12, not 24.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Factors divide evenly; multiples come from counting by.', solution: why }
}

export const factorQuestionTypes: QuestionType[] = [
  { id: 'isFactor', name: 'Factors', unlockLevel: 1, make: isFactor },
  { id: 'gcf', name: 'Greatest common factor', unlockLevel: 1, make: greatestFactor },
  { id: 'factTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'lcm', name: 'Least common multiple', unlockLevel: 2, make: leastMultiple },
  { id: 'groups', name: 'Equal groups', unlockLevel: 3, make: equalGroups },
  { id: 'sandwich', name: 'No leftovers', unlockLevel: 4, make: sandwichStory },
]
