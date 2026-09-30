/**
 * Grade 6, Unit 8 (Data Sets and Distributions) — mean and mean absolute deviation (MAD).
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'

/** n whole numbers with a whole-number mean. */
function niceSet(n: number, lo: number, hi: number): number[] {
  for (;;) {
    const v = Array.from({ length: n }, () => R(lo, hi))
    if (v.reduce((a, b) => a + b, 0) % n === 0) return v
  }
}
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
const mad = (v: number[]) => { const m = mean(v); return mean(v.map((x) => Math.abs(x - m))) }

function findMean(): Question {
  const run = Math.random() < 0.3
  if (run) {
    const tenths = Array.from({ length: 5 }, () => R(15, 50))
    const total = tenths.reduce((a, b) => a + b, 0)
    return {
      name: 'Mean',
      prompt: `Mai ran ${tenths.map((t) => fmt(t / 10)).join(', ')} miles on 5 days. What is the mean distance per day?`,
      unit: 'miles', answer: total / 50,
      hint: 'Add all the distances, then share them equally over 5 days: divide by 5.',
      solution: `${fmt(total / 10)} ÷ 5 = ${fmt(total / 50)} miles`,
    }
  }
  const v = niceSet(R(4, 6), 2, 20)
  return {
    name: 'Mean',
    prompt: `What is the mean of ${v.join(', ')}?`,
    answer: mean(v),
    hint: `Add them up, then divide by how many there are (${v.length}).`,
    solution: `${v.join(' + ')} = ${v.reduce((a, b) => a + b, 0)}, and ${v.reduce((a, b) => a + b, 0)} ÷ ${v.length} = ${mean(v)}`,
  }
}

function missingValue(): Question {
  const v = niceSet(5, 3, 15)
  const m = mean(v)
  const hidden = v.pop()!
  return {
    name: 'Fair share',
    prompt: `Five friends collected shells. Four of them found ${v.join(', ')} shells. The mean for all five was ${m}. How many did the fifth friend find?`,
    unit: 'shells', answer: hidden,
    hint: `If the mean is ${m} for 5 people, the total must be ${m} × 5 = ${m * 5}. Subtract what the four found.`,
    solution: `${m * 5} − (${v.join(' + ')}) = ${m * 5} − ${v.reduce((a, b) => a + b, 0)} = ${hidden}`,
  }
}

function findMad(): Question {
  let v: number[]
  do { v = niceSet(R(4, 5), 1, 12) } while (!Number.isInteger(mad(v) * 2) || mad(v) === 0)
  const m = mean(v)
  return {
    name: 'MAD',
    prompt: `The mean of ${v.join(', ')} is ${m}. What is the mean absolute deviation (MAD)?`,
    answer: mad(v),
    hint: `Find how far each value is from ${m} (ignore the sign). Then find the mean of those distances.`,
    solution: `Distances: ${v.map((x) => Math.abs(x - m)).join(', ')}. Their mean is ${fmt(mad(v))}.`,
  }
}

function moreSpread(): Question {
  let a: number[], b: number[]
  do { a = niceSet(5, 5, 15); b = niceSet(5, 5, 15) } while (mean(a) !== mean(b) || Math.abs(mad(a) - mad(b)) < 1)
  const [na, nb] = shuffle(['Team Red', 'Team Blue'])
  const right = mad(a) > mad(b) ? na : nb
  return {
    name: 'More spread out?',
    prompt: `Two teams scored points in 5 games. ${na}: ${a.join(', ')}. ${nb}: ${b.join(', ')}. Both have a mean of ${mean(a)}. Whose scores vary more?`,
    choices: [na, nb].map((t) => ({ label: t, ok: t === right, why: `${na} has a MAD of ${fmt(mad(a))} and ${nb} has ${fmt(mad(b))}. Bigger MAD means more spread out.` })),
    hint: 'Look at how far the scores are from the mean. The bigger the typical distance, the more spread out.',
    solution: `${na}'s MAD is ${fmt(mad(a))} and ${nb}'s is ${fmt(mad(b))}, so ${right}'s scores vary more.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['The mean is like a fair share: what each gets if everything is split evenly.', true, 'Add up, then divide equally.'],
  ['Running 16 miles in 5 days is a mean of 3.2 miles a day.', true, '16 ÷ 5 = 3.2.'],
  ['A MAD of 0 means every value is the same.', true, 'Nothing is any distance from the mean.'],
  ['A bigger MAD means the data is more bunched together.', false, 'A bigger MAD means the data is more spread out.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Mean = fair share. MAD = typical distance from the mean.', solution: why }
}

export const meanQuestionTypes: QuestionType[] = [
  { id: 'mean', name: 'Mean', unlockLevel: 1, make: findMean },
  { id: 'meanTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'fairShare', name: 'Fair share', unlockLevel: 2, make: missingValue },
  { id: 'mad', name: 'Mean absolute deviation', unlockLevel: 3, make: findMad },
  { id: 'spread', name: 'Comparing spread', unlockLevel: 4, make: moreSpread },
]
