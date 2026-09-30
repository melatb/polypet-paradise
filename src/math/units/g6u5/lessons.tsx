import { useState } from 'react'
import { Figure, HELP } from '../../Figure'
import type { Lesson } from '../../types'

function PlaceValue() {
  return (
    <>
      <p>Each digit stands for a different unit. In <b>207.5</b>, the 2 is 2 hundreds, the 7 is 7 ones, and the 5 is 5 tenths. To add decimals, add matching units: tenths to tenths, ones to ones.</p>
      <div className="row"><span className="formula">10.5 + 84.3 = 94.8</span></div>
      <p>When you get 10 of a unit, bundle them into 1 of the next unit up: <b>0.9 + 0.3 = 1.2</b>.</p>
    </>
  )
}

function AreaModel() {
  const [help, setHelp] = useState(false)
  const W = 2.9 * 1.5, H = 1.6 * 1.5, X = 2 * 1.5, Y = 1 * 1.5
  return (
    <>
      <p>To multiply <b>2.9 × 1.6</b>, draw a rectangle that size and split it by place value. Add up the four smaller areas.</p>
      <div className="fig">
        <Figure spec={{
          x0: -1.4, x1: W + 0.6, y0: -1.1, y1: H + 0.5, alt: 'Area model for 2.9 times 1.6',
          polys: [{ pts: [[0, 0], [W, 0], [W, H], [0, H]] }],
          segs: [{ a: [X, 0], b: [X, H], color: '#1E2A4A', solid: true }, { a: [0, Y], b: [W, Y], color: '#1E2A4A', solid: true }],
          labels: [
            { x: X / 2, y: -0.5, t: 2 }, { x: X + (W - X) / 2, y: -0.5, t: '0.9' }, { x: -0.6, y: Y / 2, t: 1 }, { x: -0.6, y: Y + (H - Y) / 2, t: '0.6' },
            ...(help ? [{ x: X / 2, y: Y / 2, t: 2, color: HELP }, { x: X + (W - X) / 2, y: Y / 2, t: '0.9', color: HELP, small: true },
              { x: X / 2, y: Y + (H - Y) / 2, t: '1.2', color: HELP, small: true }, { x: X + (W - X) / 2, y: Y + (H - Y) / 2, t: '0.54', color: HELP, small: true }] : []),
          ],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={() => setHelp(!help)}>{help ? 'Hide' : 'Show the pieces'}</button>
        {help && <span className="formula">2 + 0.9 + 1.2 + 0.54 = 4.64</span>}
      </div>
    </>
  )
}

function ShareItOut() {
  const steps = ['10 grams each (40 used, 25 left)', '6 more each (24 used, 1 left)', '0.2 more each (0.8 used, 0.2 left)', '0.05 more each (0.2 used, 0 left)']
  const [n, setN] = useState(1)
  return (
    <>
      <p>Division is sharing into equal groups. To share <b>65 grams among 4 people</b>, hand out big amounts first, then smaller ones:</p>
      <ol className="say">{steps.slice(0, n).map((s) => <li key={s}>{s}</li>)}</ol>
      <div className="row">
        {n < steps.length ? <button className="btn sm white" onClick={() => setN(n + 1)}>Next step</button> : <button className="btn sm white" onClick={() => setN(1)}>Start over</button>}
        {n === steps.length && <span className="formula">10 + 6 + 0.2 + 0.05 = 16.25 grams</span>}
      </div>
    </>
  )
}

export const addSubLessons: Lesson[] = [{ id: 'g6u5-place', tag: 'PLACE VALUE AND BUNDLING', body: () => <PlaceValue /> }]
export const multiplyLessons: Lesson[] = [{ id: 'g6u5-area', tag: 'AREA MODELS', body: () => <AreaModel /> }]
export const divideLessons: Lesson[] = [{ id: 'g6u5-share', tag: 'SHARING IN STEPS', body: () => <ShareItOut /> }]
