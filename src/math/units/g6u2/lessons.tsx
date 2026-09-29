import { useState } from 'react'
import { Figure, RatioTable } from '../../Figure'
import { COLORS, discrete, doubleNumberLine, tape } from '../../ratioDiagrams'
import type { Lesson } from '../../types'

function WhatIsARatio() {
  return (
    <>
      <p>A <b>ratio</b> compares two or more amounts. This drink uses 6 cups of juice and 4 cups of soda water. You can say it several ways:</p>
      <div className="fig"><Figure spec={discrete([{ n: 6, name: 'cups of juice', color: '#4FD6A5' }, { n: 4, name: 'cups of soda water', color: '#fff' }], '6 cups of juice and 4 cups of soda water')} /></div>
      <ul className="say">
        <li>The ratio of juice to soda water is <b>6 : 4</b>.</li>
        <li>The ratio of soda water to juice is <b>4 to 6</b>. Order matters!</li>
        <li>There are <b>3 cups of juice for every 2 cups of soda water</b>.</li>
      </ul>
    </>
  )
}

function Batches() {
  const [n, setN] = useState(2)
  return (
    <>
      <p>One batch is 3 cups of juice and 2 cups of soda water. Every batch tastes the same, so <b>3 : 2</b>, <b>6 : 4</b> and <b>9 : 6</b> are <b>equivalent ratios</b>.</p>
      <div className="fig"><Figure spec={discrete([{ n: 3 * n, name: 'cups of juice', color: '#4FD6A5' }, { n: 2 * n, name: 'cups of soda water', color: '#fff' }], `${n} batches`, 12)} /></div>
      <div className="row">
        <label htmlFor="u2b" style={{ fontWeight: 800 }}>Batches</label>
        <input id="u2b" type="range" min={1} max={4} value={n} onChange={(e) => setN(+e.target.value)} />
        <span className="formula">{3 * n} : {2 * n}</span>
      </div>
    </>
  )
}

function ThreeWays() {
  return (
    <>
      <p>A ratio can compare three things. Four horses each have 4 legs, 1 tail and 2 ears. The ratio of legs to tails to ears is <b>16 : 4 : 8</b>. There are 2 ears for every tail, and 2 legs for every ear.</p>
      <div className="fig"><Figure spec={discrete([{ n: 16, name: 'legs', color: COLORS.a }, { n: 4, name: 'tails', color: COLORS.b }, { n: 8, name: 'ears', color: COLORS.c }], '16 legs, 4 tails, 8 ears')} /></div>
    </>
  )
}

function ReadingDNL() {
  const [i, setI] = useState(1)
  return (
    <>
      <p>A <b>double number line</b> shows equivalent ratios. Raffle tickets cost $6 for 5 tickets. Numbers that line up go together.</p>
      <div className="fig"><Figure spec={doubleNumberLine({ name: 'price ($)', vals: [0, 6, 12, 18, 24, 30] }, { name: 'tickets', vals: [0, 5, 10, 15, 20, 25] }, 'Double number line: $6 for 5 tickets', { mark: i })} /></div>
      <div className="row">
        <label htmlFor="u2d" style={{ fontWeight: 800 }}>Slide along</label>
        <input id="u2d" type="range" min={0} max={5} value={i} onChange={(e) => setI(+e.target.value)} />
        <span className="formula">${6 * i} for {5 * i} tickets</span>
      </div>
    </>
  )
}

function PriceOfOne() {
  const [show, setShow] = useState(false)
  return (
    <>
      <p>To find the price of <b>1</b> ticket, split $6 into 5 equal parts. That's called the <b>unit price</b>.</p>
      <div className="fig"><Figure spec={doubleNumberLine(
        { name: 'price ($)', vals: [0, show ? '1.20' : '?', '', '', '', 6] }, { name: 'tickets', vals: [0, 1, 2, 3, 4, 5] }, 'Double number line from 0 to 5 tickets', { mark: show ? 1 : undefined })} /></div>
      <div className="row">
        <button className="btn sm white" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Find the price of 1'}</button>
        {show && <span className="formula">$6 ÷ 5 = $1.20</span>}
      </div>
    </>
  )
}

function Tables() {
  return (
    <>
      <p>For big numbers, a <b>table</b> works better than a number line. To find the price of 300 tickets at $6 for 5, first divide to find 1 ticket, then multiply by 300.</p>
      <RatioTable spec={{ cols: ['price ($)', 'tickets'], rows: [[6, 5], ['1.20', 1], [360, 300]], highlight: 2 }} />
      <div className="row"><span className="formula">÷ 5, then × 300</span></div>
    </>
  )
}

function TapeDiagrams() {
  const [show, setShow] = useState(false)
  return (
    <>
      <p>A <b>tape diagram</b> helps when you know the total. Red and blue beads are in a ratio of 2 : 3, and there are 40 beads. That's 5 equal boxes, so each box is 8.</p>
      <div className="fig"><Figure spec={tape([{ boxes: 2, name: 'red', color: COLORS.a }, { boxes: 3, name: 'blue', color: COLORS.b }], 'Tape diagram 2 to 3, total 40', { each: show ? '8' : undefined, total: 'total 40' })} /></div>
      <div className="row">
        <button className="btn sm white" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Fill in the boxes'}</button>
        {show && <span className="formula">16 red, 24 blue</span>}
      </div>
    </>
  )
}

export const ratioLessons: Lesson[] = [
  { id: 'g6u2-what-ratio', tag: 'WHAT IS A RATIO?', body: () => <WhatIsARatio /> },
  { id: 'g6u2-batches', tag: 'EQUIVALENT RATIOS', body: () => <Batches /> },
  { id: 'g6u2-three', tag: 'THREE AT ONCE', body: () => <ThreeWays /> },
]
export const numberLineLessons: Lesson[] = [
  { id: 'g6u2-dnl', tag: 'DOUBLE NUMBER LINES', body: () => <ReadingDNL /> },
  { id: 'g6u2-unit-price', tag: 'THE PRICE OF ONE', body: () => <PriceOfOne /> },
]
export const tableLessons: Lesson[] = [
  { id: 'g6u2-tables', tag: 'TABLES OF EQUIVALENT RATIOS', body: () => <Tables /> },
  { id: 'g6u2-tape', tag: 'TAPE DIAGRAMS', body: () => <TapeDiagrams /> },
]
