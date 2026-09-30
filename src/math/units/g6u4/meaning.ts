/**
 * Grade 6, Unit 4 (Dividing Fractions) — making sense of division.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { div, F, FRACTION_HINT, plain, show, val, type Frac } from '../../fractions'
import type { Question, QuestionType } from '../../types'

/** Stories for a ÷ b, each told as "how many groups" or "how much in each group". */
const STORIES: { groups: (a: number, b: number) => string; each: (a: number, b: number) => string }[] = [
  {
    groups: (a, b) => `How many ${b}-liter bottles can be filled from ${a} liters of water?`,
    each: (a, b) => `${a} liters of water are poured equally into ${b} bottles. How many liters go in each bottle?`,
  },
  {
    groups: (a, b) => `A ribbon is ${a} inches long. How many ${b}-inch pieces can be cut from it?`,
    each: (a, b) => `A ${a}-inch ribbon is cut into ${b} equal pieces. How long is each piece?`,
  },
  {
    groups: (a, b) => `There are ${a} cups of pet food. Each scoop holds ${b} cups. How many scoops is that?`,
    each: (a, b) => `${a} cups of pet food are shared equally among ${b} pets. How much does each pet get?`,
  },
]

function whichExpression(): Question {
  let a = 0, b = 0
  do { a = R(6, 24); b = R(2, 9) } while (a === b)
  const s = pick(STORIES)
  const each = Math.random() < 0.5
  return {
    name: 'Which division?',
    prompt: (each ? s.each : s.groups)(a, b) + ' Which expression answers this?',
    choices: shuffle([
      { label: `${a} ÷ ${b}`, ok: true },
      { label: `${b} ÷ ${a}`, ok: false, why: `The total (${a}) is what gets divided, so it comes first.` },
      { label: `${a} × ${b}`, ok: false, why: "You're splitting the total up, so it's division." },
      { label: `${a} − ${b}`, ok: false, why: 'Subtracting takes away one group. You need to know how many groups (or how much in each).' },
    ]),
    hint: each ? 'You know the number of groups and the total. Division finds how much is in each group.' : 'You know the total and the size of each group. Division finds how many groups.',
    solution: `${a} ÷ ${b}: ${each ? `${b} equal groups` : `groups of ${b}`} from a total of ${a}.`,
  }
}

function estimate(): Question {
  let label: string, exact: Frac
  if (Math.random() < 0.5) {
    const x = R(1, 20), y = R(1, 20)
    label = `${x} ÷ ${y}`; exact = F(x, y)
  } else {
    const x = R(1, 6), p = R(1, 5), q = R(p + 1, 8)
    label = `${x} ÷ ${show(F(p, q))}`; exact = div(F(x), F(p, q))
  }
  const v = val(exact)
  const ans = exact.n === exact.d ? 'eq' : v < 1 ? 'lt' : 'gt'
  const why = `${label} = ${show(exact)}.`
  return {
    name: 'Estimate',
    prompt: `Without working it out exactly, is ${label} less than 1, equal to 1, or greater than 1?`,
    choices: [
      { label: 'Less than 1', ok: ans === 'lt', why },
      { label: 'Equal to 1', ok: ans === 'eq', why },
      { label: 'Greater than 1', ok: ans === 'gt', why },
    ],
    hint: 'Think "how many groups of the second number fit in the first?" If it fits more than once, the answer is more than 1.',
    solution: why,
  }
}

function wholeWithFraction(): Question {
  let a = 0, b = 0
  do { a = R(3, 25); b = R(2, 8) } while (a % b === 0)
  const ans = F(a, b)
  const s = pick(STORIES)
  return {
    name: 'Leftovers as fractions',
    prompt: s.each(a, b),
    answer: val(ans), inputHint: FRACTION_HINT,
    hint: `${b} goes into ${a} ${Math.floor(a / b)} times with ${a % b} left over. Split the leftover into ${b} equal parts too.`,
    solution: `${a} ÷ ${b} = ${show(ans)} (you can type ${plain(ans)})`,
  }
}

function matchStory(): Question {
  const p = R(1, 4), q = R(p + 1, 6), n = R(2, 6)
  const b = show(F(p, q))
  const right = `How many ${b}-pound bags can you fill with ${n} pounds of flour?`
  return {
    name: 'Match the story',
    prompt: `Which question could ${n} ÷ ${b} = ? answer?`,
    choices: shuffle([
      { label: right, ok: true },
      { label: `How many pounds of flour are in ${n} bags of ${b} pound each?`, ok: false, why: `That's ${n} × ${b}: groups times the size of each group.` },
      { label: `How many ${n}-pound bags can you fill with ${b} pound of flour?`, ok: false, why: `The total and the group size are switched. That's ${b} ÷ ${n}.` },
    ]),
    hint: `${n} ÷ ${b} asks: how many groups of ${b} are in ${n}?`,
    solution: `${n} ÷ ${b} = how many groups of ${b} fit in ${n}. ${right}`,
  }
}

function piecesStory(): Question {
  let a = 0, b = 0
  do { a = R(5, 30); b = R(2, 12) } while (a % b === 0 || b > a)
  const ans = F(a, b)
  return {
    name: 'How many pieces?',
    prompt: `A ${a}-inch ribbon is cut into pieces that are each ${b} inches long. How many pieces is that? (A leftover part counts as a fraction of a piece.)`,
    answer: val(ans), inputHint: FRACTION_HINT,
    hint: `How many ${b}s fit in ${a}? The leftover is what fraction of a ${b}-inch piece?`,
    solution: `${a} ÷ ${b} = ${show(ans)} pieces`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['10 ÷ 2 can mean "how many 2s are in 10?"', true, 'That is one meaning of division.'],
  ['10 ÷ 2 can also mean "if 10 is shared by 2, how much does each get?"', true, 'That is the other meaning.'],
  ['A division answer can never be a fraction.', false, '15 ÷ 6 = 2½.'],
  ['6 ÷ 1½ = 4, because four groups of 1½ make 6.', true, '1½ + 1½ + 1½ + 1½ = 6.'],
  ['Dividing by a number less than 1 gives an answer smaller than what you started with.', false, 'It gives a bigger answer: 3 ÷ ½ = 6.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try it with small numbers.', solution: why }
}

export const meaningQuestionTypes: QuestionType[] = [
  { id: 'whichDiv', name: 'Which division?', unlockLevel: 1, make: whichExpression },
  { id: 'estimate', name: 'Estimating quotients', unlockLevel: 1, make: estimate },
  { id: 'divTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'wholeFrac', name: 'Leftovers as fractions', unlockLevel: 2, make: wholeWithFraction },
  { id: 'matchStory', name: 'Matching stories', unlockLevel: 3, make: matchStory },
  { id: 'pieces', name: 'How many pieces?', unlockLevel: 4, make: piecesStory },
]
