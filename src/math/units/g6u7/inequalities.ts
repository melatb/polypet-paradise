/**
 * Grade 6, Unit 7 (Rational Numbers) — inequalities.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { inequalityLine, sn } from '../../dataDiagrams'
import type { Question, QuestionType } from '../../types'

type Op = '<' | '>' | '≤' | '≥'
const holds = (x: number, op: Op, k: number) => (op === '<' ? x < k : op === '>' ? x > k : op === '≤' ? x <= k : x >= k)
const OPS: Op[] = ['<', '>', '≤', '≥']

function isSolution(): Question {
  const k = R(-6, 8), op = pick(OPS)
  const good = shuffle(Array.from({ length: 20 }, (_, i) => k - 10 + i).filter((x) => holds(x, op, k)))[0]
  const bad = shuffle(Array.from({ length: 20 }, (_, i) => k - 10 + i).filter((x) => !holds(x, op, k))).slice(0, 3)
  return {
    name: 'Is it a solution?',
    prompt: `Which number is a solution to x ${op} ${sn(k)}?`,
    choices: shuffle([good, ...bad]).map((v) => ({ label: sn(v), ok: v === good, why: `Try it: is ${sn(v)} ${op} ${sn(k)}? ${holds(v, op, k) ? 'Yes.' : 'No.'}` })),
    hint: `Put each number in for x and check whether "x ${op} ${sn(k)}" is true.${op === '≤' || op === '≥' ? ` ${sn(k)} itself counts, because of the "or equal to" line.` : ` ${sn(k)} itself doesn't count.`}`,
    solution: `${sn(good)} ${op} ${sn(k)} is true.`,
  }
}

function matchGraph(): Question {
  const k = R(-4, 4), op = pick(OPS)
  const dir = op === '<' || op === '≤' ? '<' : '>'
  const closed = op === '≤' || op === '≥'
  return {
    name: 'Match the graph',
    prompt: 'Which inequality does the graph show?',
    figure: () => inequalityLine(k, dir, closed, `Inequality graph at ${sn(k)}`),
    choices: shuffle(OPS.map((o) => ({ label: `x ${o} ${sn(k)}`, ok: o === op, why: `An open circle means ${sn(k)} is not included; a filled circle means it is. The arrow points toward the solutions.` }))),
    hint: 'Open circle: < or >. Filled circle: ≤ or ≥. Arrow to the right: greater. To the left: less.',
    solution: `${closed ? 'Filled' : 'Open'} circle at ${sn(k)}, arrow to the ${dir === '>' ? 'right' : 'left'}: x ${op} ${sn(k)}.`,
  }
}

const STORIES: { t: (k: number) => string; op: Op; v: string }[] = [
  { t: (k) => `You must be at least ${k} inches tall to ride a roller coaster. Which inequality shows the heights (h) that can ride?`, op: '≥', v: 'h' },
  { t: (k) => `A bag can hold no more than ${k} pounds. Which inequality shows the weights (w) it can hold?`, op: '≤', v: 'w' },
  { t: (k) => `The temperature stayed above ${k}°F all day. Which inequality shows the temperatures (t)?`, op: '>', v: 't' },
  { t: (k) => `Tickets are for kids younger than ${k}. Which inequality shows the ages (a) that can get a ticket?`, op: '<', v: 'a' },
]
function storyInequality(): Question {
  const s = pick(STORIES), k = R(10, 60)
  return {
    name: 'Write the inequality',
    prompt: s.t(k),
    choices: shuffle(OPS.map((o) => ({ label: `${s.v} ${o} ${k}`, ok: o === s.op, why: '"At least" means ≥, "no more than" means ≤, "above" means >, "younger than" means <.' }))),
    hint: 'Does the number itself count? "At least" and "no more than" include it. "Above" and "less than" don\'t.',
    solution: `${s.v} ${s.op} ${k}`,
  }
}

function countSolutions(): Question {
  const lo = R(-5, 2), hi = lo + R(3, 7)
  const incLo = Math.random() < 0.5, incHi = Math.random() < 0.5
  let count = 0
  for (let x = lo; x <= hi; x++) if ((incLo ? x >= lo : x > lo) && (incHi ? x <= hi : x < hi)) count++
  return {
    name: 'Count the whole numbers',
    prompt: `How many integers (whole numbers and their opposites) make both x ${incLo ? '≥' : '>'} ${sn(lo)} and x ${incHi ? '≤' : '<'} ${sn(hi)} true?`,
    answer: count,
    hint: `List the integers from ${sn(lo)} to ${sn(hi)}, then check whether each end counts.`,
    solution: `They are ${Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((x) => (incLo ? x >= lo : x > lo) && (incHi ? x <= hi : x < hi)).map(sn).join(', ')}: ${count} integers.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['5 is a solution to x > 5.', false, '5 is not greater than 5. It would be a solution to x ≥ 5.'],
  ['An inequality can have many solutions.', true, 'x < 1 is true for 0, −3, 0.5 and many more.'],
  ['−10 is a solution to x < −2.', true, '−10 is to the left of −2.'],
  ['On a graph, a filled circle means the number is included.', true, 'That is how ≤ and ≥ are shown.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try the number in the inequality.', solution: why }
}

export const inequalityQuestionTypes: QuestionType[] = [
  { id: 'isSol', name: 'Solutions', unlockLevel: 1, make: isSolution },
  { id: 'ineqTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'graph', name: 'Graphs of inequalities', unlockLevel: 2, make: matchGraph },
  { id: 'storyIneq', name: 'Writing inequalities', unlockLevel: 3, make: storyInequality },
  { id: 'countInt', name: 'Counting solutions', unlockLevel: 4, make: countSolutions },
]
