/**
 * Grade 6, Unit 9 (Putting It All Together) — voting: percents, ratios and fair representation.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R } from '../../../game/random'
import type { Question, QuestionType } from '../../types'

const CHOICES = ['pizza', 'tacos', 'pasta', 'a movie day', 'a field trip', 'a science fair']

function percentOfVotes(): Question {
  const total = pick([20, 25, 40, 50])
  const p = pick([10, 20, 30, 40, 60, 80].filter((x) => (total * x) % 100 === 0))
  const votes = (total * p) / 100
  const c = pick(CHOICES)
  return {
    name: 'Percent of votes',
    prompt: `In a class vote, ${votes} of the ${total} students chose ${c}. What percent of the class chose ${c}?`,
    unit: '%', answer: p,
    hint: `${votes} out of ${total} is the same as how many out of 100? Multiply both by ${100 / total}.`,
    solution: `${votes}/${total} = ${p}/100 = ${p}%`,
  }
}

function ratioVotes(): Question {
  let a = 0, b = 0
  do { a = R(1, 5); b = R(1, 5) } while (a === b)
  const k = R(3, 12), total = (a + b) * k
  const [x, y] = [pick(CHOICES.slice(0, 3)), pick(CHOICES.slice(3))]
  return {
    name: 'Votes in a ratio',
    prompt: `Votes for ${x} and ${y} were in a ratio of ${a} : ${b}. There were ${total} votes in all. How many votes did ${x} get?`,
    answer: a * k,
    hint: `Each "part" of the ratio is ${total} ÷ ${a + b} votes.`,
    solution: `${total} ÷ ${a + b} = ${k} votes per part, and ${a} × ${k} = ${a * k}.`,
  }
}

function majority(): Question {
  const a = R(30, 60)
  const b = R(10, 100 - a - 5)
  const c = 100 - a - b
  const win = a > 50
  return {
    name: 'Majority',
    prompt: `In an election, Ana got ${a}% of the votes, Ben got ${b}% and Chen got ${c}%. Did Ana win a majority (more than half of all votes)?`,
    choices: [
      { label: 'Yes', ok: win, why: `A majority means more than 50%. Ana has ${a}%.` },
      { label: 'No', ok: !win, why: `A majority means more than 50%. Ana has ${a}%.` },
    ],
    hint: 'Is her percent more than 50%?',
    solution: win ? `Yes: ${a}% is more than 50%.` : `No: ${a}% is not more than half${a > b && a > c ? ', even though she got the most votes' : ''}.`,
  }
}

function fairSeats(): Question {
  const seats = pick([10, 12, 20])
  let s1 = 0
  do { s1 = R(2, seats - 2) } while (s1 * 2 === seats)
  const unit = pick([500, 1000, 1500])
  const p1 = s1 * unit, p2 = (seats - s1) * unit
  return {
    name: 'Fair seats',
    prompt: `Two towns share a council with ${seats} seats, split by population. Northtown has ${p1.toLocaleString()} people and Southtown has ${p2.toLocaleString()}. How many seats should Northtown get?`,
    answer: s1, inputHint: 'You can type big numbers with or without commas.',
    hint: `Northtown's share of all the people is ${p1.toLocaleString()} out of ${(p1 + p2).toLocaleString()}. Give it the same share of the ${seats} seats.`,
    solution: `${p1.toLocaleString()} ÷ ${(p1 + p2).toLocaleString()} = ${s1}/${seats} of the people, so ${s1} of the ${seats} seats.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['Getting the most votes always means getting a majority.', false, 'With 3 choices, 40% can win without being more than half.'],
  ['12 out of 30 votes is 40%.', true, '12/30 = 40/100.'],
  ['Fair representation gives bigger towns more seats.', true, 'Seats are shared in the same ratio as the populations.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think in percents and ratios.', solution: why }
}

export const votingQuestionTypes: QuestionType[] = [
  { id: 'pctVotes', name: 'Percent of votes', unlockLevel: 1, make: percentOfVotes },
  { id: 'voteTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'majority', name: 'Majority', unlockLevel: 2, make: majority },
  { id: 'ratioVotes', name: 'Votes in a ratio', unlockLevel: 2, make: ratioVotes },
  { id: 'seats', name: 'Fair seats', unlockLevel: 3, make: fairSeats },
]
