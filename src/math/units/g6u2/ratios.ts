/**
 * Grade 6, Unit 2 (Introducing Ratios) — section "What Are Ratios?" and equivalent ratios.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { COLORS, discrete } from '../../ratioDiagrams'
import type { Question, QuestionType } from '../../types'

interface Thing { sg: string; pl: string }
const say = (n: number, t: Thing) => `${n} ${n === 1 ? t.sg : t.pl}`
export const PAIRS: [Thing, Thing][] = [
  [{ sg: 'cup of juice', pl: 'cups of juice' }, { sg: 'cup of soda water', pl: 'cups of soda water' }],
  [{ sg: 'red bead', pl: 'red beads' }, { sg: 'blue bead', pl: 'blue beads' }],
  [{ sg: 'cat', pl: 'cats' }, { sg: 'dog', pl: 'dogs' }],
  [{ sg: 'tulip', pl: 'tulips' }, { sg: 'daisy', pl: 'daisies' }],
  [{ sg: 'cup of flour', pl: 'cups of flour' }, { sg: 'egg', pl: 'eggs' }],
]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
/** A ratio p:q in simplest form with p ≠ q. */
function simpleRatio(max = 5): [number, number] {
  let p = 0, q = 0
  do { p = R(1, max); q = R(1, max) } while (p === q || gcd(p, q) !== 1)
  return [p, q]
}

function ratioFromDiagram(): Question {
  const [A, B] = pick(PAIRS)
  let a = 0, b = 0
  do { a = R(2, 8); b = R(2, 8) } while (a === b)
  const flip = Math.random() < 0.5
  const [x, y, X, Y] = flip ? [b, a, B, A] : [a, b, A, B]
  const opts = [`${x} : ${y}`, `${y} : ${x}`, `${x} : ${x + y}`, `${x + y} : ${y}`]
  return {
    name: 'Read a ratio',
    prompt: `What is the ratio of ${X.pl} to ${Y.pl}?`,
    figure: () => discrete([{ n: a, name: A.pl, color: COLORS.a }, { n: b, name: B.pl, color: COLORS.b }], `${a} ${A.pl} and ${b} ${B.pl}`),
    choices: shuffle(opts.map((label, i) => ({
      label, ok: i === 0,
      why: i === 1 ? `Order matters! ${X.pl} come first because they're named first.` : "That uses the total. The question asks for one part compared to the other.",
    }))),
    hint: `Count each kind. The ratio of ${X.pl} to ${Y.pl} puts the number of ${X.pl} first.`,
    solution: `${say(x, X)} to ${say(y, Y)}: ${x} : ${y}`,
  }
}

function forEvery(): Question {
  const [A, B] = pick(PAIRS)
  const [p, q] = simpleRatio(4)
  const k = R(2, 3)
  const right = `There are ${say(p, A)} for every ${say(q, B)}.`
  const opts = [
    { label: right, ok: true },
    { label: `There are ${say(q, A)} for every ${say(p, B)}.`, ok: false, why: 'The numbers are switched.' },
    { label: `There are ${say(p, A)} for every ${say(p + q, B)}.`, ok: false, why: `${p + q} is the size of a whole group, not the number of ${B.pl}.` },
    { label: `The ratio of ${B.pl} to ${A.pl} is ${p} : ${q}.`, ok: false, why: `Order matters: ${B.pl} to ${A.pl} would be ${q} : ${p}.` },
  ]
  return {
    name: 'For every',
    prompt: 'Which sentence describes the picture?',
    figure: () => discrete([{ n: k * p, name: A.pl, color: COLORS.a }, { n: k * q, name: B.pl, color: COLORS.b }], `${k * p} ${A.pl} and ${k * q} ${B.pl}`),
    choices: shuffle(opts),
    hint: `Try splitting the picture into ${k} matching groups. What's in each group?`,
    solution: `${k * p} : ${k * q} splits into ${k} groups of ${p} and ${q}. ${right}`,
  }
}

function equivalent(): Question {
  const [p, q] = simpleRatio(6)
  const k = R(2, 5), d = R(1, 4)
  const opts = [
    { label: `${k * p} : ${k * q}`, ok: true },
    { label: `${p + d} : ${q + d}`, ok: false, why: `Adding ${d} to both doesn't keep the same ratio. Equivalent ratios multiply both numbers by the same amount.` },
    { label: `${k * p} : ${q}`, ok: false, why: 'Only one number was multiplied. Both have to be multiplied by the same number.' },
    { label: `${q} : ${p}`, ok: false, why: 'The numbers are switched, which is a different ratio.' },
  ]
  return {
    name: 'Equivalent ratios',
    prompt: `Which ratio is equivalent to ${p} : ${q}?`,
    choices: shuffle(opts),
    hint: 'Equivalent ratios come from multiplying (or dividing) both numbers by the same number.',
    solution: `${p} × ${k} = ${k * p} and ${q} × ${k} = ${k * q}, so ${k * p} : ${k * q} is equivalent.`,
  }
}

const RECIPES: [Thing, Thing, string][] = [
  [{ sg: 'cup of blue paint', pl: 'cups of blue paint' }, { sg: 'cup of yellow paint', pl: 'cups of yellow paint' }, 'green paint'],
  [{ sg: 'scoop of lemonade mix', pl: 'scoops of lemonade mix' }, { sg: 'cup of water', pl: 'cups of water' }, 'lemonade'],
  [{ sg: 'cup of flour', pl: 'cups of flour' }, { sg: 'cup of milk', pl: 'cups of milk' }, 'pancake batter'],
  [{ sg: 'cup of rice', pl: 'cups of rice' }, { sg: 'cup of water', pl: 'cups of water' }, 'rice'],
]
function batches(): Question {
  const [A, B, what] = pick(RECIPES)
  const [p, q] = simpleRatio(5)
  const k = R(2, 8)
  const askBatches = Math.random() < 0.5
  return {
    name: 'Recipes',
    prompt: askBatches
      ? `A recipe for ${what} uses ${say(p, A)} and ${say(q, B)}. How many ${B.pl} are needed for ${k} batches?`
      : `A recipe for ${what} uses ${say(p, A)} for every ${say(q, B)}. If you use ${k * p} ${A.pl}, how many ${B.pl} do you need to make it taste the same?`,
    unit: B.pl, answer: k * q,
    hint: askBatches ? `${k} batches means ${k} times as much of everything.` : `${k * p} is ${k} times ${p}. Multiply the ${B.pl} by the same number.`,
    solution: `${q} × ${k} = ${k * q} ${B.pl}`,
  }
}

const SINGULAR: Record<string, string> = { legs: 'leg', tails: 'tail', ears: 'ear', wings: 'wing', beaks: 'beak', antennae: 'antenna', heads: 'head' }
const CREATURES: { name: string; parts: Record<string, number> }[] = [
  { name: 'horses', parts: { legs: 4, tails: 1, ears: 2 } },
  { name: 'birds', parts: { legs: 2, wings: 2, beaks: 1 } },
  { name: 'ladybugs', parts: { legs: 6, antennae: 2, heads: 1 } },
]
function threeParts(): Question {
  const c = pick(CREATURES)
  const n = R(2, 4)
  const names = Object.keys(c.parts)
  const per = c.parts
  const pairs = names.flatMap((a) => names.map((b) => [a, b] as [string, string])).filter(([a, b]) => a !== b && per[a] > per[b] && per[a] % per[b] === 0)
  const [a, b] = pick(pairs)
  const k = R(1, 4)
  const ans = (k * per[a]) / per[b]
  const colors = [COLORS.a, COLORS.b, COLORS.c]
  const one = (nm: string) => SINGULAR[nm] ?? nm
  const list = names.map((nm) => `${per[nm]} ${per[nm] === 1 ? one(nm) : nm}`).join(', ').replace(/, ([^,]*)$/, ' and $1')
  return {
    name: 'Three quantities',
    prompt: `There are ${n} ${c.name}. Each one has ${list}. For every ${k === 1 ? one(b) : `${k} ${b}`}, how many ${a} are there?`,
    unit: a, answer: ans,
    figure: () => discrete(names.map((nm, i) => ({ n: n * per[nm], name: nm, color: colors[i] })), `${n} ${c.name}: ${names.map((nm) => `${n * per[nm]} ${nm}`).join(', ')}`),
    hint: `Count all the ${a} and all the ${b} in the picture. How many ${a} go with each one of the ${b}?`,
    solution: `${n * per[a]} ${a} for ${n * per[b]} ${b} is ${per[a] / per[b]} for every 1, so ${ans} for every ${k}.`,
  }
}

function missingValue(): Question {
  const [p, q] = simpleRatio(9)
  const k = R(2, 9)
  const left = Math.random() < 0.5
  return {
    name: 'Missing number',
    prompt: left ? `${p} : ${q} is equivalent to ? : ${k * q}. What is the missing number?` : `${p} : ${q} is equivalent to ${k * p} : ?. What is the missing number?`,
    answer: left ? k * p : k * q,
    hint: left ? `What do you multiply ${q} by to get ${k * q}? Do the same to ${p}.` : `What do you multiply ${p} by to get ${k * p}? Do the same to ${q}.`,
    solution: `Both numbers are multiplied by ${k}: ${k * p} : ${k * q}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['The ratio 6 : 4 is equivalent to 3 : 2.', true, 'Divide both numbers by 2.'],
  ['The ratio of cats to dogs is the same as the ratio of dogs to cats.', false, 'Order matters. 3 : 2 and 2 : 3 are different.'],
  ['You can make an equivalent ratio by adding the same number to both parts.', false, 'You have to multiply or divide both parts by the same number.'],
  ['A ratio can compare more than two quantities, like 16 : 4 : 8.', true, 'Like legs to tails to ears.'],
  ['“3 cups of juice for every 2 cups of soda water” describes the ratio 3 : 2.', true, 'That’s another way to say it.'],
  ['Doubling a recipe keeps it tasting the same.', true, 'Both amounts are multiplied by 2, so the ratio stays equivalent.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think about what makes ratios equivalent.', solution: why }
}

export const ratioQuestionTypes: QuestionType[] = [
  { id: 'readRatio', name: 'Reading ratios', unlockLevel: 1, make: ratioFromDiagram },
  { id: 'forEvery', name: '“For every” sentences', unlockLevel: 1, make: forEvery },
  { id: 'ratioTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'equivalent', name: 'Equivalent ratios', unlockLevel: 2, make: equivalent },
  { id: 'batches', name: 'Recipes and batches', unlockLevel: 2, make: batches },
  { id: 'threeParts', name: 'Three quantities', unlockLevel: 3, make: threeParts },
  { id: 'missingRatio', name: 'Missing numbers', unlockLevel: 4, make: missingValue },
]
