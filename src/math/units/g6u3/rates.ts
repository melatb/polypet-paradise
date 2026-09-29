/**
 * Grade 6, Unit 3 (Unit Rates and Percentages) — section "Rates".
 * Content adapted from Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).
 */
import { fmt, pick, randInt as R, shuffle } from '../../../game/random'
import type { Question, QuestionType } from '../../types'
import { money } from '../g6u2/numberLines'

const GOODS = [
  { item: 'pounds of dog food', one: 'pound', per: [2, 2.5, 3, 4, 1.5] },
  { item: 'pounds of apples', one: 'pound', per: [1.5, 2, 2.5, 0.75, 1.25] },
  { item: 'notebooks', one: 'notebook', per: [1.5, 2, 2.5, 3, 0.75] },
  { item: 'gallons of gas', one: 'gallon', per: [3, 3.5, 4, 2.5] },
]

function unitRate(): Question {
  const g = pick(GOODS)
  const p = pick(g.per), n = R(2, 8)
  const total = +(p * n).toFixed(2)
  return {
    name: 'Unit rate',
    prompt: `${n} ${g.item} cost ${money(total)}. What is the cost per ${g.one}?`,
    unit: 'dollars', answer: p,
    hint: `"Per ${g.one}" means for 1 ${g.one}. Divide the cost by ${n}.`,
    solution: `${money(total)} ÷ ${n} = ${money(p)} per ${g.one}`,
  }
}

/** Pairs where dividing either way gives a friendly decimal. */
const FLIP: [number, number][] = [[16, 4], [10, 4], [8, 2], [12, 3], [20, 5], [6, 3], [5, 2], [15, 6], [9, 4]]
function otherWay(): Question {
  const [dollars, pounds] = pick(FLIP)
  return {
    name: 'The other unit rate',
    prompt: `Dog food costs ${money(dollars)} for ${pounds} pounds. How many pounds of dog food can you buy for $1?`,
    unit: 'pounds', answer: pounds / dollars,
    commonSlip: { value: dollars / pounds, message: `That's dollars per pound. The question asks for pounds per dollar.` },
    hint: `Split the ${pounds} pounds into ${dollars} equal parts, one for each dollar: ${pounds} ÷ ${dollars}.`,
    solution: `${pounds} ÷ ${dollars} = ${fmt(pounds / dollars)} pounds per dollar. (The other unit rate is ${money(dollars / pounds)} per pound.)`,
  }
}

function betterDeal(): Question {
  const g = pick(GOODS)
  const [pa, pb] = shuffle([...g.per]).slice(0, 2)
  const same = Math.random() < 0.2
  const pB = same ? pa : pb
  let na = R(2, 6), nb = R(2, 6)
  if (na === nb) nb++
  const ta = +(pa * na).toFixed(2), tb = +(pB * nb).toFixed(2)
  const answer = same ? 'same' : pa < pB ? 'A' : 'B'
  const why = `Per ${g.one}: Store A is ${money(pa)} and Store B is ${money(pB)}.`
  return {
    name: 'Better deal',
    prompt: `Store A sells ${na} ${g.item} for ${money(ta)}. Store B sells ${nb} ${g.item} for ${money(tb)}. Which is the better deal?`,
    choices: [
      { label: 'Store A', ok: answer === 'A', why },
      { label: 'Store B', ok: answer === 'B', why },
      { label: 'Same price per ' + g.one, ok: answer === 'same', why },
    ],
    hint: `Find the price for 1 ${g.one} at each store.`,
    solution: why,
  }
}

const SPEEDS = [6, 8, 10, 12, 12.5, 15, 20]
function useRate(): Question {
  const r = pick(SPEEDS), h = R(2, 6)
  const askDist = Math.random() < 0.6
  const who = pick(['Andre', 'Lin', 'Elena', 'Diego'])
  return askDist ? {
    name: 'Use the rate',
    prompt: `${who} bikes at ${fmt(r)} miles per hour. How far does ${who} go in ${h} hours?`,
    unit: 'miles', answer: r * h,
    hint: `${fmt(r)} miles for each hour, for ${h} hours.`,
    solution: `${fmt(r)} × ${h} = ${fmt(r * h)} miles`,
  } : {
    name: 'Use the rate',
    prompt: `${who} bikes at ${fmt(r)} miles per hour. How many hours does it take to go ${fmt(r * h)} miles?`,
    unit: 'hours', answer: h,
    hint: `How many groups of ${fmt(r)} miles fit in ${fmt(r * h)} miles?`,
    solution: `${fmt(r * h)} ÷ ${fmt(r)} = ${h} hours`,
  }
}

function cheapestOfThree(): Question {
  const sizes = shuffle([2, 3, 4, 5, 6, 8]).slice(0, 3)
  const unit = shuffle([0.5, 0.75, 1, 1.25, 1.5, 2]).slice(0, 3)
  const packs = sizes.map((n, i) => ({ n, price: +(n * unit[i]).toFixed(2), each: unit[i] }))
  const best = packs.reduce((a, b) => (b.each < a.each ? b : a))
  return {
    name: 'Best buy',
    prompt: `Which pack of granola bars costs the least per bar?`,
    choices: packs.map((p) => ({
      label: `${p.n} bars for ${money(p.price)}`, ok: p === best,
      why: `That's ${money(p.each)} per bar. Compare: ${packs.map((q) => money(q.each)).join(', ')}.`,
    })),
    hint: 'Divide each price by the number of bars to get the price of one bar.',
    solution: packs.map((p) => `${money(p.price)} ÷ ${p.n} = ${money(p.each)}`).join(', ') + '.',
  }
}

const FACTS: [string, boolean, string][] = [
  ['A unit rate tells you how much for 1.', true, 'Like miles per 1 hour, or dollars per 1 pound.'],
  ['Every ratio has two unit rates.', true, 'For $16 for 4 pounds: $4 per pound, and 0.25 pounds per dollar.'],
  ['Andre biked 25 miles in 2 hours and Lin biked 30 miles in 3 hours, so Lin was faster.', false, 'Andre: 12.5 miles per hour. Lin: 10 miles per hour.'],
  ['The cheaper deal is always the bigger pack.', false, 'Compare the price per item to know for sure.'],
  ['“Per” means “for each.”', true, '3 dollars per pound = 3 dollars for each pound.'],
]
function trueOrFalse(): Question {
  const [statement, isTrue, why] = pick(FACTS)
  return { name: 'True or false', prompt: statement, choices: [{ label: 'True', ok: isTrue, why }, { label: 'False', ok: !isTrue, why }], hint: 'Think "for 1".', solution: why }
}

export const rateQuestionTypes: QuestionType[] = [
  { id: 'unitRate', name: 'Unit rates', unlockLevel: 1, make: unitRate },
  { id: 'rateTF', name: 'True or false', unlockLevel: 1, make: trueOrFalse },
  { id: 'otherWay', name: 'The other unit rate', unlockLevel: 2, make: otherWay },
  { id: 'betterDeal', name: 'Better deals', unlockLevel: 2, make: betterDeal },
  { id: 'useRate', name: 'Using rates', unlockLevel: 3, make: useRate },
  { id: 'bestBuy', name: 'Best buys', unlockLevel: 4, make: cheapestOfThree },
]
