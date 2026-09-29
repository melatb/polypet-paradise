import { useState } from 'react'
import { Figure, RatioTable } from '../../Figure'
import { doubleNumberLine, hundredGrid } from '../../ratioDiagrams'
import type { Lesson } from '../../types'

function SmallerUnits() {
  return (
    <>
      <p>The same length can be measured in different units. <b>Smaller units mean you need more of them.</b> 1 foot is 12 inches, and 1 meter is 100 centimeters.</p>
      <div className="row">
        <span className="formula">3 feet = 36 inches</span>
        <span className="formula">2 meters = 200 cm</span>
      </div>
    </>
  )
}

function KgAndPounds() {
  return (
    <>
      <p>To switch between kilograms and pounds, use equivalent ratios. 1 kilogram is about 2.2 pounds, so a 99-pound canoe is about 45 kilograms.</p>
      <RatioTable spec={{ cols: ['kilograms', 'pounds'], rows: [[1, 2.2], [5, 11], [12, 26.4], [45, 99]], highlight: 3 }} />
    </>
  )
}

function UnitRates() {
  return (
    <>
      <p>A <b>unit rate</b> is a rate "per 1". Andre biked 25 miles in 2 hours, which is <b>12.5 miles per hour</b>. Lin biked 30 miles in 3 hours, which is <b>10 miles per hour</b>. Unit rates make it easy to compare: Andre was faster.</p>
      <div className="row"><span className="formula">25 ÷ 2 = 12.5</span><span className="formula">30 ÷ 3 = 10</span></div>
    </>
  )
}

function TwoRates() {
  const [flip, setFlip] = useState(false)
  return (
    <>
      <p>Every ratio has <b>two</b> unit rates. Dog food costs $16 for 4 pounds.</p>
      <div className="row">
        <button className="btn sm white" onClick={() => setFlip(!flip)}>{flip ? 'Dollars per pound' : 'Pounds per dollar'}</button>
        <span className="formula">{flip ? '4 ÷ 16 = 0.25 pounds per dollar' : '16 ÷ 4 = $4 per pound'}</span>
      </div>
    </>
  )
}

function Per100() {
  const [n, setN] = useState(25)
  return (
    <>
      <p><b>Percent</b> means "per 100". If 100 squares are the whole, then {n} shaded squares is {n}%.</p>
      <div className="fig"><Figure spec={hundredGrid(n, `${n} of 100 squares shaded`)} /></div>
      <div className="row">
        <label htmlFor="u3p" style={{ fontWeight: 800 }}>Shade</label>
        <input id="u3p" type="range" min={0} max={100} value={n} onChange={(e) => setN(+e.target.value)} />
        <span className="formula">{n}%</span>
      </div>
    </>
  )
}

function PercentLine() {
  return (
    <>
      <p>A double number line works for percents too. A class is raising $40, so $40 is <b>100%</b>. Then 25% is $10, 50% is $20, and 75% is $30.</p>
      <div className="fig"><Figure spec={doubleNumberLine({ name: 'dollars', vals: [0, 10, 20, 30, 40] }, { name: 'percent', vals: ['0%', '25%', '50%', '75%', '100%'] }, 'Percent number line, 100% is $40')} /></div>
    </>
  )
}

function Over100() {
  return (
    <>
      <p>Percents can be <b>more than 100%</b>. Elena planned to walk 8 miles but walked 12. That's 150% of her plan.</p>
      <div className="fig"><Figure spec={doubleNumberLine({ name: 'miles', vals: [0, 4, 8, 12] }, { name: 'percent', vals: ['0%', '50%', '100%', '150%'] }, '8 miles is 100%, 12 miles is 150%', { mark: 3 })} /></div>
    </>
  )
}

export const measureLessons: Lesson[] = [
  { id: 'g6u3-smaller', tag: 'SMALLER UNITS, BIGGER NUMBERS', body: () => <SmallerUnits /> },
  { id: 'g6u3-kg', tag: 'KILOGRAMS AND POUNDS', body: () => <KgAndPounds /> },
]
export const rateLessons: Lesson[] = [
  { id: 'g6u3-unit-rate', tag: 'UNIT RATES', body: () => <UnitRates /> },
  { id: 'g6u3-two-rates', tag: 'TWO UNIT RATES', body: () => <TwoRates /> },
]
export const percentLessons: Lesson[] = [
  { id: 'g6u3-per100', tag: 'PER 100', body: () => <Per100 /> },
  { id: 'g6u3-pct-line', tag: 'PERCENT NUMBER LINES', body: () => <PercentLine /> },
  { id: 'g6u3-over100', tag: 'MORE THAN 100%', body: () => <Over100 /> },
]
