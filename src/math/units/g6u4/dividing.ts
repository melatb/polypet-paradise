/**
 * Grade 6, Unit 4 (Dividing Fractions) — dividing fractions: how many groups, how much in one group, the algorithm.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { div, F, FRACTION_HINT, groupBars, plain, show, val } from '../../fractions'
import type { Question, QuestionType } from '../../types'

const properFrac = (maxD = 6) => { const q = R(2, maxD); return F(R(1, q - 1), q) }

function howManyGroups({ level }: { level: number }): Question {
  const n = R(1, level >= 3 ? 5 : 4)
  const q = R(2, 5)
  const p = R(1, q - 1)
  const g = F(p, q)
  const ans = div(F(n), g)
  return {
    name: 'How many groups?',
    prompt: `How many groups of ${show(g)} are in ${n}?`,
    answer: val(ans), inputHint: FRACTION_HINT,
    figure: (help) => groupBars(n, p, q, help, `${n} wholes cut into ${q}ths, grouped by ${show(g)}`),
    hint: `Each whole has ${q} pieces, so ${n} wholes have ${n * q} pieces. Each group is ${p} piece${p > 1 ? 's' : ''}. How many groups? A leftover part counts as a fraction of a group.`,
    solution: `${n} ÷ ${show(g)} = ${show(ans)} (type ${plain(ans)})`,
  }
}

function byUnitFraction(): Question {
  const n = R(2, 9), q = R(2, 9)
  return {
    name: 'Dividing by a unit fraction',
    prompt: `${n} ÷ ${show(F(1, q))} = ?`,
    answer: n * q,
    hint: `There are ${q} pieces of size ${show(F(1, q))} in every whole. How many in ${n} wholes?`,
    solution: `${n} × ${q} = ${n * q}`,
  }
}

function reciprocal(): Question {
  const b = properFrac(9)
  const flip = F(b.d, b.n)
  // Keep the first copy of any label, so a wrong option can never replace the right one (e.g. ⅓ → "3").
  const opts: [string, boolean][] = []
  for (const [k, v] of [[show(flip, true), true], [show(b, true), false], [show(F(1, b.d * b.n), true), false], [`${b.d + 1}`, false]] as [string, boolean][]) {
    if (!opts.some(([x]) => x === k)) opts.push([k, v])
  }
  return {
    name: 'Flip it',
    prompt: `Dividing by ${show(b)} is the same as multiplying by what?`,
    choices: shuffle(opts.map(([label, ok]) => ({ label, ok, why: `Dividing by ${show(b)} means multiplying by its reciprocal, ${show(flip, true)}: flip the fraction upside down.` }))),
    hint: 'The reciprocal of a fraction is the fraction flipped upside down.',
    solution: `The reciprocal of ${show(b)} is ${show(flip, true)}.`,
  }
}

function compute({ level }: { level: number }): Question {
  const a = level >= 3 && Math.random() < 0.5 ? F(R(3, 12), R(2, 6)) : properFrac(8)
  const b = properFrac(8)
  const ans = div(a, b)
  return {
    name: 'Divide fractions',
    prompt: `${show(a, true)} ÷ ${show(b)} = ?`,
    answer: val(ans), inputHint: FRACTION_HINT,
    hint: `Multiply ${show(a, true)} by the reciprocal of ${show(b)}, which is ${show(F(b.d, b.n), true)}.`,
    solution: `${show(a, true)} × ${show(F(b.d, b.n), true)} = ${show(ans)} (type ${plain(ans)})`,
  }
}

const ONE_GROUP = [
  (part: string, amt: string) => `${amt} pounds of rice fill ${part} of a bag. How many pounds fill the whole bag?`,
  (part: string, amt: string) => `${amt} cups of water fill ${part} of a pitcher. How many cups fill the whole pitcher?`,
  (part: string, amt: string) => `Priya walked ${amt} miles, which is ${part} of the trail. How long is the whole trail?`,
]
function howMuchInOne(): Question {
  const part = properFrac(5)
  const whole = R(2, 12)
  const amt = F(whole * part.n, part.d)
  return {
    name: 'How much in one group?',
    prompt: pick(ONE_GROUP)(show(part), show(amt)),
    answer: whole, inputHint: FRACTION_HINT,
    hint: `If ${show(part)} of the whole is ${show(amt)}, find ${show(F(1, part.d))} first by dividing by ${part.n}, then multiply by ${part.d}. That's the same as ${show(amt)} ÷ ${show(part)}.`,
    solution: `${show(amt)} ÷ ${show(part)} = ${whole}`,
  }
}

function compareQuotients(): Question {
  const make = () => {
    const a = F(R(1, 12), R(2, 10)), b = properFrac(9)
    return { label: `${show(a, true)} ÷ ${show(b, true)}`, v: div(a, b) }
  }
  const x = make()
  let y = Math.random() < 0.3 ? (() => { const k = R(2, 5); const a = F(x.v.n * k, x.v.d * 2); const b = F(k, 2); return { label: `${show(a, true)} ÷ ${show(b, true)}`, v: div(a, b) } })() : make()
  while (y.label === x.label) y = make()
  const vx = val(x.v), vy = val(y.v)
  const ans = Math.abs(vx - vy) < 1e-9 ? 'same' : vx > vy ? 'x' : 'y'
  const why = `${x.label} = ${show(x.v)} and ${y.label} = ${show(y.v)}.`
  return {
    name: 'Which is greater?',
    prompt: `Which has the greater value?`,
    choices: [
      { label: x.label, ok: ans === 'x', why },
      { label: y.label, ok: ans === 'y', why },
      { label: 'They are equal', ok: ans === 'same', why },
    ],
    hint: 'Work out each one by multiplying by the reciprocal, then compare.',
    solution: why,
  }
}

const FACTS: [string, boolean, string][] = [
  ['2 ÷ ⅓ = 6, because there are 3 thirds in every whole.', true, '2 × 3 = 6.'],
  ['To divide by a fraction, you can multiply by its reciprocal.', true, 'That is the "invert and multiply" rule.'],
  ['The reciprocal of ⅖ is ⁵⁄₂.', true, 'Flip it upside down.'],
  ['3 ÷ ½ = 1½', false, '3 ÷ ½ = 6. There are 6 halves in 3.'],
  ['5 ÷ ⅔ = 7½', true, 'There are 7 whole groups of ⅔ in 5, plus half a group.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Ask: how many groups of the divisor fit?', solution: why }
}

export const fractionDivQuestionTypes: QuestionType[] = [
  { id: 'groups', name: 'How many groups?', unlockLevel: 1, make: howManyGroups },
  { id: 'unitFrac', name: 'Dividing by unit fractions', unlockLevel: 1, make: byUnitFraction },
  { id: 'fracTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'reciprocal', name: 'Reciprocals', unlockLevel: 2, make: reciprocal },
  { id: 'computeFrac', name: 'Dividing fractions', unlockLevel: 2, make: compute },
  { id: 'oneGroup', name: 'How much in one group?', unlockLevel: 3, make: howMuchInOne },
  { id: 'compareDiv', name: 'Comparing quotients', unlockLevel: 4, make: compareQuotients },
]
