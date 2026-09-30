/**
 * Grade 6, Unit 6 (Expressions and Equations) — relationships between quantities: tables, equations, graphs.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { INK } from '../../Figure'
import type { FigLabel, FigSeg, FigureSpec, Question, QuestionType } from '../../types'

const STORIES = [
  { x: 'n', y: 'v', xs: 'number of bags', ys: 'value (cents)', about: 'how the value (v) grows with the number of bags (n)', k: [25, 10, 5], t: (k: number) => `Each bag holds coins worth ${k} cents.` },
  { x: 't', y: 'd', xs: 'time (hours)', ys: 'distance (miles)', about: 'how the distance (d) grows with the time (t)', k: [30, 45, 60, 55], t: (k: number) => `A train travels at a steady ${k} miles per hour.` },
  { x: 'p', y: 'c', xs: 'pounds', ys: 'cost ($)', about: 'how the cost (c) grows with the pounds of apples (p)', k: [2, 3, 4, 6], t: (k: number) => `Apples cost $${k} per pound.` },
]

function tableFromEquation(): Question {
  const s = pick(STORIES), k = pick(s.k)
  const xs = shuffle([1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((a, b) => a - b)
  const ask = R(0, 2)
  return {
    name: 'Use the equation',
    prompt: `${s.t(k)} The equation is ${s.y} = ${k}${s.x}. What is ${s.y} when ${s.x} = ${xs[ask]}?`,
    table: { cols: [`${s.x} (${s.xs})`, `${s.y} (${s.ys})`], rows: xs.map((x, i) => [x, i === ask ? '?' : k * x]), highlight: ask },
    answer: k * xs[ask],
    hint: `Put ${xs[ask]} in for ${s.x}: ${k} × ${xs[ask]}.`,
    solution: `${s.y} = ${k} × ${xs[ask]} = ${k * xs[ask]}`,
  }
}

function equationFromTable(): Question {
  const k = R(2, 9), add = Math.random() < 0.35
  const xs = [1, 2, 3, 4]
  const f = (x: number) => (add ? x + k : k * x)
  const right = add ? `y = x + ${k}` : `y = ${k}x`
  const opts = [...new Set([right, add ? `y = ${k}x` : `y = x + ${k}`, `y = ${f(1) + 1}x`, `x = ${k}y`])]
  return {
    name: 'Find the equation',
    prompt: 'Which equation matches the table?',
    table: { cols: ['x', 'y'], rows: xs.map((x) => [x, f(x)]) },
    choices: shuffle(opts.map((o) => ({ label: o, ok: o === right, why: `Check a row: when x = 3, y is ${f(3)}. Does the equation give ${f(3)}?` }))),
    hint: 'Pick a row and test each equation. The right one works for every row.',
    solution: `${right} works for every row: when x = 3, y = ${f(3)}.`,
  }
}

function dependent(): Question {
  const s = pick(STORIES), k = pick(s.k)
  return {
    name: 'Which depends on which?',
    prompt: `${s.t(k)} In ${s.y} = ${k}${s.x}, which variable depends on the other?`,
    choices: [
      { label: `${s.y} (${s.ys.replace(/ \(.*\)/, '')}) depends on ${s.x}`, ok: true },
      { label: `${s.x} (${s.xs.replace(/ \(.*\)/, '')}) depends on ${s.y}`, ok: false, why: `You choose ${s.x}, and ${s.y} is worked out from it. So ${s.y} is the dependent variable.` },
    ],
    hint: 'Which one do you choose first? The other one is worked out from it.',
    solution: `${s.y} is the dependent variable: it depends on ${s.x}, the independent variable.`,
  }
}

/** Points on a grid for y = kx. */
export function graphFigure(k: number, xs: number[], hideAt: number | null, help: boolean, labels: [string, string]): FigureSpec {
  const xMax = 6, sy = 5 / (k * xMax)
  const segs: FigSeg[] = [{ a: [0, 0], b: [xMax + 0.4, 0], color: INK, solid: true }, { a: [0, 0], b: [0, k * xMax * sy + 0.4], color: INK, solid: true }]
  const lab: FigLabel[] = []
  const dots: NonNullable<FigureSpec['dots']> = []
  for (let x = 1; x <= xMax; x++) { segs.push({ a: [x, 0], b: [x, k * xMax * sy], color: '#D9E6F2', solid: true }); lab.push({ x, y: -0.45, t: x, small: true }) }
  for (let j = 1; j <= xMax; j++) { const y = j * k * sy; segs.push({ a: [0, y], b: [xMax, y], color: '#D9E6F2', solid: true }); lab.push({ x: -0.5, y, t: j * k, small: true, anchor: 'end' }) }
  for (const x of xs) {
    if (x === hideAt && !help) continue
    dots.push({ x, y: k * x * sy, color: x === hideAt ? '#FFD23F' : '#FF5FA8' })
  }
  lab.push({ x: xMax / 2, y: -1.05, t: labels[0], small: true }, { x: -0.3, y: k * xMax * sy + 0.75, t: labels[1], small: true, anchor: 'start' })
  return { x0: -2.1, x1: xMax + 0.8, y0: -1.4, y1: k * xMax * sy + 1.1, alt: `Graph of points on the line y = ${k}x`, segs, dots, labels: lab }
}

function readGraph(): Question {
  const s = pick(STORIES), k = pick(s.k)
  const shown = [1, 2, 4, 5]
  const ask = pick([3, 6])
  return {
    name: 'Read the graph',
    prompt: `${s.t(k)} The graph shows ${s.about}. Following the pattern, what is ${s.y} when ${s.x} = ${ask}?`,
    figure: (help) => graphFigure(k, [...shown, ask], ask, help, [s.xs, s.ys]),
    answer: k * ask,
    hint: `The points go up by ${k} each time ${s.x} goes up by 1.`,
    solution: `${k} × ${ask} = ${k * ask}`,
  }
}

function writeRule(): Question {
  const k = pick([12, 15, 20, 55, 60]), s = pick(['miles per hour', 'pages per day', 'dollars per ticket'])
  const [x, y] = s.startsWith('miles') ? ['t', 'd'] : s.startsWith('pages') ? ['n', 'p'] : ['t', 'c']
  const right = `${y} = ${k}${x}`
  return {
    name: 'Write the rule',
    prompt: `The rate is ${k} ${s}. Which equation shows how ${y} depends on ${x}?`,
    choices: shuffle([right, `${x} = ${k}${y}`, `${y} = ${x} + ${k}`, `${y} = ${k} ÷ ${x}`].map((o) => ({ label: o, ok: o === right, why: `For every 1 of ${x}, you get ${k} of ${y}. So ${y} is ${k} times ${x}.` }))),
    hint: `Try ${x} = 2: how much ${y} should there be?`,
    solution: right,
  }
}

const FACTS: [string, boolean, string][] = [
  ['In v = 25n, v depends on n.', true, 'You pick n, then work out v.'],
  ['The points of y = 3x on a graph line up in a straight line.', true, 'They go up by the same amount each step.'],
  ['A table, an equation and a graph can all show the same relationship.', true, 'They are three views of the same thing.'],
  ['In d = 60t, if t = 2 then d = 62.', false, 'd = 60 × 2 = 120.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try putting in a number.', solution: why }
}

export const relationshipQuestionTypes: QuestionType[] = [
  { id: 'useEq', name: 'Using an equation', unlockLevel: 1, make: tableFromEquation },
  { id: 'relTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'findEq', name: 'Finding the equation', unlockLevel: 2, make: equationFromTable },
  { id: 'dependent', name: 'Dependent and independent', unlockLevel: 2, make: dependent },
  { id: 'readGraph', name: 'Reading graphs', unlockLevel: 3, make: readGraph },
  { id: 'writeRule', name: 'Writing the rule', unlockLevel: 4, make: writeRule },
]
