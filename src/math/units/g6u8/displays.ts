/**
 * Grade 6, Unit 8 (Data Sets and Distributions) — statistical questions, dot plots and histograms.
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { pick, randInt as R } from '../../../game/random'
import { dotPlot, histogram } from '../../dataDiagrams'
import type { Question, QuestionType } from '../../types'

const STAT: [string, boolean][] = [
  ['What band is most popular among sixth graders?', true],
  ['How many hours of sleep do students in our class get?', true],
  ['How tall are the dogs at the shelter?', true],
  ['How many pets do families on our street have?', true],
  ['How tall is the school’s front door?', false],
  ['What is my favorite color?', false],
  ['How many days are in September?', false],
  ['What time does the school bus leave today?', false],
]
function statisticalQuestion(): Question {
  const [q, isStat] = pick(STAT)
  const why = isStat ? 'The answers would vary from person to person (or dog to dog), so you need data to answer it.' : 'There is just one answer, so the data would not vary.'
  return {
    name: 'Statistical question?',
    prompt: `Is this a statistical question? "${q}"`,
    choices: [
      { label: 'Yes, answers will vary', ok: isStat, why },
      { label: 'No, there is one answer', ok: !isStat, why },
    ],
    hint: 'A statistical question expects different answers that you collect as data.',
    solution: why,
  }
}

/** Random whole-number data between lo and hi, bunched in the middle. */
function data(n: number, lo: number, hi: number): number[] {
  return Array.from({ length: n }, () => Math.round((R(lo, hi) + R(lo, hi)) / 2)).sort((a, b) => a - b)
}

function readDotPlot(): Question {
  const vals = data(R(12, 20), 0, 8)
  const ask = pick(['atLeast', 'mode', 'total'] as const)
  const k = R(3, 6)
  const counts = new Map<number, number>()
  vals.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
  const maxC = Math.max(...counts.values())
  const modes = [...counts.entries()].filter(([, c]) => c === maxC).map(([v]) => v)
  if (ask === 'mode' && modes.length > 1) return readDotPlot()
  const prompt = ask === 'atLeast' ? `The dot plot shows how many books students read this month. How many students read ${k} or more books?`
    : ask === 'mode' ? 'The dot plot shows how many books students read this month. What number of books was most common?'
    : 'The dot plot shows how many books students read this month. How many students answered?'
  const answer = ask === 'atLeast' ? vals.filter((v) => v >= k).length : ask === 'mode' ? modes[0] : vals.length
  return {
    name: 'Dot plot',
    prompt, answer,
    figure: () => dotPlot(vals, 0, 8, 'books read', 'Dot plot of books read'),
    hint: ask === 'atLeast' ? `Count every dot above ${k} and above the numbers to its right.` : ask === 'mode' ? 'Find the tallest stack of dots.' : 'Each dot is one student. Count them all.',
    solution: `The answer is ${answer}.`,
  }
}

function readHistogram(): Question {
  const w = pick([5, 10])
  const lo = w === 5 ? 20 : 0
  const counts = Array.from({ length: 5 }, () => R(1, 9))
  const i = R(0, 3)
  const two = Math.random() < 0.5
  const answer = two ? counts[i] + counts[i + 1] : counts[i]
  const hiEdge = lo + (i + (two ? 2 : 1)) * w
  const unit = w === 5 ? 'pounds' : 'minutes'
  return {
    name: 'Histogram',
    prompt: w === 5
      ? `The histogram shows the weights of dogs at a shelter. How many dogs weigh at least ${lo + i * w} but less than ${hiEdge} pounds?`
      : `The histogram shows how many minutes students spent getting to school. How many took at least ${lo + i * w} but less than ${hiEdge} minutes?`,
    answer,
    figure: () => histogram(counts, lo, w, unit, `Histogram of ${unit}`),
    hint: `Each bar covers ${w} ${unit}. Read the height of the bar${two ? 's' : ''} for ${lo + i * w} to ${hiEdge}${two ? ' and add them' : ''}.`,
    solution: two ? `${counts[i]} + ${counts[i + 1]} = ${answer}` : `That bar is ${answer} tall.`,
  }
}

function whichDisplay(): Question {
  const many = Math.random() < 0.5
  return {
    name: 'Choose a display',
    prompt: many
      ? 'You collected the heights of 300 students, from 120 cm to 180 cm. Which display shows the overall shape best?'
      : 'You collected how many siblings 15 students have (from 0 to 5). Which display shows every single value?',
    choices: [
      { label: 'A histogram', ok: many, why: many ? 'Groups (bins) make lots of spread-out data easy to see.' : 'A histogram groups values, so you lose the individual values.' },
      { label: 'A dot plot', ok: !many, why: many ? '300 dots over 60 different values would be very crowded.' : 'With a few values, each dot can be shown.' },
    ],
    hint: 'Dot plots show every value; histograms group values into ranges.',
    solution: many ? 'A histogram: lots of data spread over many values.' : 'A dot plot: a small data set with few possible values.',
  }
}

const FACTS: [string, boolean, string][] = [
  ['"How old am I?" is a statistical question.', false, 'It has one answer. It does not vary.'],
  ['In a histogram, each bar stands for a range of values.', true, 'Those ranges are called bins.'],
  ['Each dot in a dot plot is one piece of data.', true, 'Like one student’s answer.'],
  ['A histogram shows every exact value in the data.', false, 'It groups values into bins.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Does the data vary?', solution: why }
}

export const displayQuestionTypes: QuestionType[] = [
  { id: 'statQ', name: 'Statistical questions', unlockLevel: 1, make: statisticalQuestion },
  { id: 'dotPlot', name: 'Dot plots', unlockLevel: 1, make: readDotPlot },
  { id: 'dataTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'hist', name: 'Histograms', unlockLevel: 2, make: readHistogram },
  { id: 'display', name: 'Choosing a display', unlockLevel: 3, make: whichDisplay },
]
