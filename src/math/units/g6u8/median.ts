/**
 * Grade 6, Unit 8 (Data Sets and Distributions) — median, range, IQR and box plots.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import { boxPlot } from '../../dataDiagrams'
import type { Question, QuestionType } from '../../types'

const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

function findMedian({ level }: { level: number }): Question {
  const n = level >= 2 && Math.random() < 0.5 ? pick([4, 6, 8]) : pick([5, 7, 9])
  const v = shuffle(Array.from({ length: n }, () => R(1, 30)))
  const s = [...v].sort((a, b) => a - b)
  const md = median(v)
  return {
    name: 'Median',
    prompt: `What is the median of ${v.join(', ')}?`,
    answer: md,
    hint: n % 2 ? 'Put the numbers in order and find the one in the middle.' : 'Put them in order. With an even count there are two middle numbers: find the number halfway between them.',
    solution: `In order: ${s.join(', ')}. The median is ${fmt(md)}.`,
  }
}

function findRange(): Question {
  const v = shuffle(Array.from({ length: R(5, 8) }, () => R(1, 40)))
  const rg = Math.max(...v) - Math.min(...v)
  return {
    name: 'Range',
    prompt: `What is the range of ${v.join(', ')}?`,
    answer: rg,
    hint: 'Range = the greatest value minus the least value.',
    solution: `${Math.max(...v)} − ${Math.min(...v)} = ${rg}`,
  }
}

function fiveNumber(): [number, number, number, number, number] {
  const mn = R(0, 10), q1 = mn + R(2, 8), md = q1 + R(1, 8), q3 = md + R(1, 8), mx = q3 + R(2, 10)
  return [mn, q1, md, q3, mx]
}
function readBoxPlot(): Question {
  const s = fiveNumber()
  const ask = pick(['median', 'iqr', 'range'] as const)
  const answer = ask === 'median' ? s[2] : ask === 'iqr' ? s[3] - s[1] : s[4] - s[0]
  return {
    name: 'Box plot',
    prompt: ask === 'median' ? 'What is the median of the data in this box plot?' : ask === 'iqr' ? 'What is the interquartile range (IQR) of this data?' : 'What is the range of this data?',
    answer,
    figure: (help) => boxPlot(s, 0, 50, 5, 'minutes of reading', 'Box plot', help),
    hint: ask === 'median' ? 'The line inside the box is the median.' : ask === 'iqr' ? 'IQR = the right edge of the box (Q3) minus the left edge (Q1). It is the middle half of the data.' : 'Range = the end of the right whisker minus the end of the left whisker.',
    solution: ask === 'median' ? `The median is ${s[2]}.` : ask === 'iqr' ? `${s[3]} − ${s[1]} = ${answer}` : `${s[4]} − ${s[0]} = ${answer}`,
  }
}

function outlier(): Question {
  const v = Array.from({ length: 6 }, () => R(8, 14))
  const big = R(60, 90)
  const all = [...v, big]
  const mn = all.reduce((a, b) => a + b, 0) / all.length
  const md = median(all)
  return {
    name: 'Mean or median?',
    prompt: `Seven kids' allowances in dollars are ${all.join(', ')}. Which is a better way to describe a typical allowance?`,
    choices: [
      { label: `The median (${fmt(md)})`, ok: true },
      { label: `The mean (${fmt(Math.round(mn * 100) / 100)})`, ok: false, why: `The ${big} pulls the mean up, even though most allowances are around ${fmt(md)}.` },
    ],
    hint: `One value (${big}) is much bigger than the rest. Which measure does it pull up a lot?`,
    solution: `The median, ${fmt(md)}, isn't pulled up much by the ${big}, so it describes a typical allowance better.`,
  }
}

const FACTS: [string, boolean, string][] = [
  ['The median is the middle value when the data is in order.', true, 'With an even count, it is halfway between the two middle values.'],
  ['The box in a box plot shows the middle half of the data.', true, 'From Q1 to Q3.'],
  ['The median of 2, 4, 6, 100 is 5.', true, 'Halfway between 4 and 6.'],
  ['A very large value changes the median more than the mean.', false, 'It changes the mean more; the median barely moves.'],
  ['IQR = Q3 − Q1.', true, 'The width of the box.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Put the data in order.', solution: why }
}

export const medianQuestionTypes: QuestionType[] = [
  { id: 'median', name: 'Median', unlockLevel: 1, make: findMedian },
  { id: 'range', name: 'Range', unlockLevel: 1, make: findRange },
  { id: 'medTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'boxplot', name: 'Box plots', unlockLevel: 2, make: readBoxPlot },
  { id: 'outlier', name: 'Mean or median?', unlockLevel: 3, make: outlier },
]
