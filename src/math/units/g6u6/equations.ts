/**
 * Grade 6, Unit 6 (Expressions and Equations) — equations in one variable.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { COLORS } from '../../ratioDiagrams'
import type { FigLabel, FigPoly, FigureSpec, Question, QuestionType } from '../../types'

interface Block { w: number; t: string; fill: string }
/** One tape of blocks with a bracket and total above it. */
export function eqTape(blocks: Block[], total: string, alt: string): FigureSpec {
  const polys: FigPoly[] = []
  const labels: FigLabel[] = []
  let x = 0
  for (const b of blocks) {
    polys.push({ pts: [[x, 0], [x + b.w, 0], [x + b.w, 1.2], [x, 1.2]], fill: b.fill, sw: 2.5 })
    labels.push({ x: x + b.w / 2, y: 0.6, t: b.t })
    x += b.w
  }
  labels.push({ x: x / 2, y: 2.25, t: total })
  return {
    x0: -0.5, x1: x + 0.5, y0: -0.5, y1: 2.8, alt, polys, labels,
    segs: [{ a: [0, 1.45], b: [0, 1.75], color: '#1E2A4A', solid: true }, { a: [0, 1.75], b: [x, 1.75], color: '#1E2A4A', solid: true }, { a: [x, 1.45], b: [x, 1.75], color: '#1E2A4A', solid: true }],
  }
}

function matchTape(): Question {
  const multiply = Math.random() < 0.5
  const p = R(2, 5), x = R(2, 9)
  if (multiply) {
    const q = p * x
    return {
      name: 'Match the diagram',
      prompt: 'Which equation matches the tape diagram?',
      figure: () => eqTape(Array.from({ length: p }, () => ({ w: 1.6, t: 'x', fill: COLORS.a })), String(q), `${p} equal parts labeled x, total ${q}`),
      choices: shuffle([
        { label: `${p}x = ${q}`, ok: true },
        { label: `x + ${p} = ${q}`, ok: false, why: `The diagram has ${p} equal parts that are each x, so it's ${p} times x.` },
        { label: `${q}x = ${p}`, ok: false, why: `The total is ${q}, so ${q} goes alone on one side.` },
        { label: `x = ${p} + ${q}`, ok: false, why: `The parts add up to ${q}. They aren't added to it.` },
      ]),
      hint: `Count the parts. Each is x, and together they make ${q}.`,
      solution: `${p} parts of x make ${q}: ${p}x = ${q}.`,
    }
  }
  const q = p + x + R(0, 5)
  const pp = q - x
  return {
    name: 'Match the diagram',
    prompt: 'Which equation matches the tape diagram?',
    figure: () => eqTape([{ w: 2.4, t: 'x', fill: COLORS.a }, { w: 1.8, t: String(pp), fill: COLORS.b }], String(q), `A part labeled x and a part labeled ${pp}, total ${q}`),
    choices: shuffle([
      { label: `x + ${pp} = ${q}`, ok: true },
      { label: `${pp}x = ${q}`, ok: false, why: `The diagram has one x and one ${pp} side by side, which means adding.` },
      { label: `x = ${q} + ${pp}`, ok: false, why: `x and ${pp} together make ${q}.` },
      { label: `x + ${q} = ${pp}`, ok: false, why: `${q} is the total, so it goes by itself on one side.` },
    ]),
    hint: `The two parts side by side add up to the total.`,
    solution: `x and ${pp} make ${q}: x + ${pp} = ${q}.`,
  }
}

function solveAdd({ level }: { level: number }): Question {
  const useDec = level >= 3 && Math.random() < 0.5
  const x = useDec ? R(11, 99) / 10 : R(2, 40)
  const p = useDec ? R(11, 99) / 10 : R(2, 40)
  const q = +(x + p).toFixed(1)
  const flip = Math.random() < 0.3
  return {
    name: 'Solve',
    prompt: flip ? `Solve: ${q} = x + ${p}` : `Solve: x + ${p} = ${q}`,
    answer: x,
    hint: `Subtract ${p} from both sides.`,
    solution: `x = ${q} − ${p} = ${x}`,
  }
}

function solveMul({ level }: { level: number }): Question {
  const p = R(2, 12), x = level >= 3 && Math.random() < 0.4 ? R(3, 19) / 2 : R(2, 12)
  const q = +(p * x).toFixed(1)
  return {
    name: 'Solve',
    prompt: `Solve: ${p}x = ${q}`,
    answer: x,
    hint: `Divide both sides by ${p}.`,
    solution: `x = ${q} ÷ ${p} = ${x}`,
  }
}

function whichSolution(): Question {
  const p = R(2, 9), x = R(2, 12)
  const opts = [...new Set([x, x + 1, x * 2, p * x, Math.max(1, x - 2)])].slice(0, 4)
  if (!opts.includes(x)) opts[0] = x
  return {
    name: 'Which is the solution?',
    prompt: `Which value of x makes ${p}x = ${p * x} true?`,
    choices: shuffle(opts.map((v) => ({ label: `x = ${v}`, ok: v === x, why: `Try it: ${p} × ${v} = ${p * v}, not ${p * x}.` }))),
    hint: 'Put each choice in for x and check if both sides are equal.',
    solution: `${p} × ${x} = ${p * x}, so x = ${x}.`,
  }
}

function storyEquation(): Question {
  const s = pick([
    () => { const n = R(3, 9), c = R(2, 6); return { t: `Tickets cost $${c} each. Elena spent $${n * c}. Which equation finds how many tickets (t) she bought?`, right: `${c}t = ${n * c}`, wrong: [`t + ${c} = ${n * c}`, `t = ${c} × ${n * c}`, `${n * c}t = ${c}`] } },
    () => { const a = R(5, 20), b = R(21, 60); return { t: `Noah had some stickers. After his friend gave him ${a} more, he had ${b}. Which equation finds how many he started with (s)?`, right: `s + ${a} = ${b}`, wrong: [`${a}s = ${b}`, `s = ${a} + ${b}`, `s + ${b} = ${a}`] } },
    () => { const k = R(2, 6), m = R(3, 12); return { t: `A recipe is made ${k} times. It uses ${k * m} cups of flour in all. Which equation finds the flour in one batch (f)?`, right: `${k}f = ${k * m}`, wrong: [`f + ${k} = ${k * m}`, `f = ${k} × ${k * m}`, `${k * m}f = ${k}`] } },
  ])()
  return {
    name: 'Write the equation',
    prompt: s.t,
    choices: shuffle([{ label: s.right, ok: true }, ...s.wrong.map((w) => ({ label: w, ok: false, why: `Think about what's happening: is something added, or is it the same amount several times?` }))]),
    hint: 'Same amount several times → multiply. Adding more on → add.',
    solution: s.right,
  }
}

function percentEquation(): Question {
  const p = pick([10, 20, 25, 40, 50, 75])
  const whole = 20 * R(1, 10)
  const part = (whole * p) / 100
  return {
    name: 'Percent equations',
    prompt: `${p}% of x is ${part}. What is x?`,
    answer: whole,
    hint: `${p}% is ${p / 100}. Solve ${p / 100}x = ${part} by dividing both sides by ${p / 100}.`,
    solution: `x = ${part} ÷ ${p / 100} = ${whole}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['A variable is a letter that stands for a number.', true, 'Like x in 3x = 15.'],
  ['x = 5 is a solution to 3x = 15.', true, '3 × 5 = 15.'],
  ['To solve x + 7 = 12, you add 7 to both sides.', false, 'Subtract 7 from both sides: x = 5.'],
  ['3x means 3 times x.', true, 'A number right next to a letter means multiply.'],
  ['15 = 3x and 3x = 15 have the same solution.', true, 'An equation says the same thing either way around.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Try putting a number in for x.', solution: why }
}

export const equationQuestionTypes: QuestionType[] = [
  { id: 'tape', name: 'Tape diagrams', unlockLevel: 1, make: matchTape },
  { id: 'solveAdd', name: 'Solving x + p = q', unlockLevel: 1, make: solveAdd },
  { id: 'eqTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'solveMul', name: 'Solving px = q', unlockLevel: 2, make: solveMul },
  { id: 'whichSol', name: 'Which is the solution?', unlockLevel: 2, make: whichSolution },
  { id: 'story', name: 'Writing equations', unlockLevel: 3, make: storyEquation },
  { id: 'pctEq', name: 'Percent equations', unlockLevel: 4, make: percentEquation },
]
