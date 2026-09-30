/**
 * Grade 6, Unit 7 (Rational Numbers) — the coordinate plane.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R, shuffle } from '../../../game/random'
import { HELP } from '../../Figure'
import { coordPlane, sn } from '../../dataDiagrams'
import type { Question, QuestionType } from '../../types'

const M = 5
const pt = (x: number, y: number) => `(${sn(x)}, ${sn(y)})`
const nz = () => { let v = 0; while (v === 0) v = R(-M, M); return v }

function whichPoint(): Question {
  const x = nz(), y = nz()
  const opts = [...new Set([pt(x, y), pt(y, x), pt(-x, y), pt(x, -y)])]
  return {
    name: 'Name the point',
    prompt: 'What are the coordinates of the point?',
    figure: () => coordPlane(M, [{ x, y }], 'Coordinate plane with one point'),
    choices: shuffle(opts.map((o) => ({ label: o, ok: o === pt(x, y), why: 'The first number is how far left or right (x). The second is how far up or down (y).' }))),
    hint: 'Start at the center (0, 0). Count left or right first, then up or down.',
    solution: `The point is at ${pt(x, y)}.`,
  }
}

function quadrant(): Question {
  const x = nz(), y = nz()
  const q = x > 0 ? (y > 0 ? 'I' : 'IV') : y > 0 ? 'II' : 'III'
  return {
    name: 'Which quadrant?',
    prompt: `Which quadrant is ${pt(x, y)} in?`,
    choices: ['I', 'II', 'III', 'IV'].map((n) => ({ label: `Quadrant ${n}`, ok: n === q, why: 'I is top right, II top left, III bottom left, IV bottom right.' })),
    hint: `x is ${x > 0 ? 'positive (right)' : 'negative (left)'}, y is ${y > 0 ? 'positive (up)' : 'negative (down)'}.`,
    solution: `${pt(x, y)} is in Quadrant ${q}.`,
  }
}

function distance(): Question {
  const horiz = Math.random() < 0.5
  const c = nz()
  let a = 0, b = 0
  do { a = R(-M, M); b = R(-M, M) } while (a === b || (a > 0) === (b > 0) && Math.random() < 0.6)
  const [p, q] = horiz ? [[a, c], [b, c]] : [[c, a], [c, b]]
  return {
    name: 'Distance',
    prompt: `How far apart are ${pt(p[0], p[1])} and ${pt(q[0], q[1])}?`,
    answer: Math.abs(a - b),
    figure: (help) => coordPlane(M, [{ x: p[0], y: p[1] }, { x: q[0], y: q[1], color: '#7FD0FF' }], 'Two points on the same line',
      help ? [{ a: p as [number, number], b: q as [number, number], color: HELP }] : []),
    hint: `They share the same ${horiz ? 'y' : 'x'}-coordinate, so count along the ${horiz ? 'x' : 'y'} direction. If they're on opposite sides of 0, add the two distances from 0.`,
    solution: `|${sn(a)} − ${sn(b)}| = ${Math.abs(a - b)}`,
  }
}

function reflect(): Question {
  const x = nz(), y = nz()
  const axis = pick(['x', 'y'] as const)
  const r = axis === 'x' ? [x, -y] : [-x, y]
  const opts = [...new Set([pt(r[0], r[1]), pt(-x, -y), pt(y, x), pt(x, y)])]
  return {
    name: 'Reflect',
    prompt: `The point ${pt(x, y)} is reflected across the ${axis}-axis. Where does it land?`,
    choices: shuffle(opts.map((o) => ({ label: o, ok: o === pt(r[0], r[1]), why: `Reflecting across the ${axis}-axis flips the sign of the ${axis === 'x' ? 'y' : 'x'}-coordinate only.` }))),
    hint: `Across the ${axis}-axis, the point flips ${axis === 'x' ? 'up/down' : 'left/right'}. Which coordinate changes sign?`,
    solution: `${pt(x, y)} → ${pt(r[0], r[1])}`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['The point (−4, 1) is in Quadrant II.', true, 'Left of the y-axis and above the x-axis.'],
  ['(3, 5) and (5, 3) are the same point.', false, 'Order matters: x first, then y.'],
  ['The origin is the point (0, 0).', true, 'It is where the axes cross.'],
  ['(−3.5, −3) is in Quadrant III.', true, 'Both coordinates are negative.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'x first, then y.', solution: why }
}

export const coordinateQuestionTypes: QuestionType[] = [
  { id: 'namePt', name: 'Naming points', unlockLevel: 1, make: whichPoint },
  { id: 'coordTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'quadrant', name: 'Quadrants', unlockLevel: 2, make: quadrant },
  { id: 'dist', name: 'Distances', unlockLevel: 3, make: distance },
  { id: 'reflect', name: 'Reflections', unlockLevel: 4, make: reflect },
]
