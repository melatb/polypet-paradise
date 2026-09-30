/**
 * Grade 6, Unit 9 (Putting It All Together) — Fermi problems: estimating with rough numbers.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'

const ESTIMATES: { q: string; choices: string[]; right: string; why: string }[] = [
  { q: 'About how many times does your heart beat in one day?', choices: ['1,000', '100,000', '10,000,000', '1,000,000,000'], right: '100,000', why: 'About 70 beats a minute × 60 minutes × 24 hours ≈ 100,000.' },
  { q: 'About how many seconds are in one week?', choices: ['6,000', '60,000', '600,000', '6,000,000'], right: '600,000', why: '60 × 60 × 24 × 7 = 604,800.' },
  { q: 'About how many hours old is an 11-year-old?', choices: ['1,000', '10,000', '100,000', '10,000,000'], right: '100,000', why: '11 × 365 × 24 ≈ 96,000, which is about 100,000.' },
  { q: 'If you counted to one million, one number every second without stopping, about how long would it take?', choices: ['12 hours', '12 days', '12 weeks', '12 years'], right: '12 days', why: '1,000,000 seconds ÷ 86,400 seconds in a day ≈ 11.6 days.' },
  { q: 'About how many steps does it take to walk one mile?', choices: ['20', '200', '2,000', '200,000'], right: '2,000', why: 'A mile is about 5,280 feet, and a step is about 2½ feet: roughly 2,000 steps.' },
  { q: 'About how many pencils, laid end to end, would stretch the length of a football field (about 100 meters)?', choices: ['50', '500', '5,000', '50,000'], right: '500', why: 'A pencil is about 19 cm. 10,000 cm ÷ 19 cm ≈ 500.' },
  { q: 'About how many times do you blink in a day (awake about 16 hours, blinking about 15 times a minute)?', choices: ['100', '1,000', '10,000', '1,000,000'], right: '10,000', why: '15 × 60 × 16 = 14,400, which is about 10,000.' },
  { q: 'About how many gallons of water does a family of 4 use in a year, if each person uses about 80 gallons a day?', choices: ['1,000', '10,000', '100,000', '10,000,000'], right: '100,000', why: '4 × 80 × 365 = 116,800, which is about 100,000.' },
]

function orderOfMagnitude(): Question {
  const e = pick(ESTIMATES)
  return {
    name: 'Estimate it',
    prompt: e.q,
    choices: shuffle(e.choices.map((c) => ({ label: c, ok: c === e.right, why: e.why }))),
    hint: 'Break it into smaller steps you can guess: per minute, per hour, per day. Round to easy numbers and multiply.',
    solution: e.why,
  }
}

function schoolApples(): Question {
  const classes = R(12, 30), kids = R(20, 28), days = pick([5, 10, 20])
  const total = classes * kids * days
  return {
    name: 'Step by step',
    prompt: `A school has ${classes} classes with ${kids} students each. Every student eats 1 apple a day at lunch. How many apples does the school need for ${days} school days?`,
    answer: total, inputHint: 'You can type big numbers with or without commas.',
    hint: `First find how many students there are (${classes} × ${kids}). Then multiply by ${days} days.`,
    solution: `${classes} × ${kids} = ${classes * kids} students, and ${classes * kids} × ${days} = ${total.toLocaleString()} apples.`,
  }
}

function roundAndMultiply(): Question {
  const a = R(18, 98), b = R(18, 98)
  const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10
  const est = ra * rb
  const opts = [...new Set([est, est * 10, Math.round(est / 10), est + ra])]
  return {
    name: 'Quick estimate',
    prompt: `Without a calculator, which is the best estimate for ${a} × ${b}?`,
    choices: shuffle(opts.map((o) => ({ label: `about ${o.toLocaleString()}`, ok: o === est, why: `Round to ${ra} × ${rb} = ${est.toLocaleString()}.` }))),
    hint: 'Round each number to the nearest ten, then multiply.',
    solution: `${ra} × ${rb} = ${est.toLocaleString()}. (Exactly: ${(a * b).toLocaleString()}.)`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['A Fermi problem is solved with careful estimates, not exact counting.', true, 'Named after the physicist Enrico Fermi, who loved these.'],
  ['When estimating, it helps to round to easy numbers.', true, '70 × 60 × 24 is hard; 70 × 60 ≈ 4,000 and × 25 ≈ 100,000 is easier.'],
  ['An estimate is useless if it is not exact.', false, 'Knowing if the answer is about 1,000 or about 1,000,000 is very useful.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Estimates are about being close enough.', solution: why }
}

export const fermiQuestionTypes: QuestionType[] = [
  { id: 'magnitude', name: 'Estimating', unlockLevel: 1, make: orderOfMagnitude },
  { id: 'fermiTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'roundMul', name: 'Quick estimates', unlockLevel: 2, make: roundAndMultiply },
  { id: 'apples', name: 'Step by step', unlockLevel: 3, make: schoolApples },
]
