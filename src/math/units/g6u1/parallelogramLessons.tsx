import { animate } from 'framer-motion'
import { useState } from 'react'
import { Figure, INK, Mini, SHAPE2 } from '../../Figure'
import type { Lesson, Pt } from '../../types'
import { HEIGHT_PAIRS, heightPairFigure } from './parallelograms'

function CutAndSlide() {
  const [t, setT] = useState(0)
  const [on, setOn] = useState(false)
  const toggle = () => { setOn(!on); animate(t, on ? 0 : 1, { duration: 0.9, ease: 'easeInOut', onUpdate: setT }) }
  return (
    <>
      <p>Cut a triangle off one end of a parallelogram and slide it to the other end. You get a <b>rectangle</b> with the same base, the same height and the same area.</p>
      <div className="fig">
        <Figure spec={{
          x0: -0.8, x1: 7.8, y0: -0.8, y1: 3.8, grid: true, alt: 'Parallelogram cut and rearranged into a rectangle',
          polys: [{ pts: [[2, 0], [5, 0], [7, 3], [2, 3]] }, { pts: ([[0, 0], [2, 0], [2, 3]] as Pt[]).map(([x, y]) => [x + 5 * t, y] as Pt), fill: SHAPE2 }],
          segs: [{ a: [2, 0], b: [2, 3], color: INK }],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={toggle}>{on ? 'Slide it back' : 'Slide the triangle'}</button>
        <span className="formula">Area = base × height = 5 × 3 = 15</span>
      </div>
    </>
  )
}

function MatchingHeights() {
  const [show, setShow] = useState<1 | 2>(1)
  const p = HEIGHT_PAIRS[0]
  return (
    <>
      <p>Any side can be the <b>base</b>. Its <b>matching height</b> is the distance to the opposite side, measured at a right angle. Different bases have different heights, but the area comes out the same.</p>
      <div className="fig"><Figure spec={heightPairFigure(p, show)} /></div>
      <div className="row">
        <button className={'btn sm ' + (show === 1 ? '' : 'white')} onClick={() => setShow(1)}>Base 9</button>
        <button className={'btn sm ' + (show === 2 ? '' : 'white')} onClick={() => setShow(2)}>Base 7.5</button>
        <span className="formula">{show === 1 ? '9 × 6 = 54' : '7.5 × 7.2 = 54'}</span>
      </div>
    </>
  )
}

function WhichAreParallelograms() {
  return (
    <>
      <p>A <b>parallelogram</b> has four sides, and its opposite sides are parallel. Rectangles, squares and rhombuses all count!</p>
      <div className="minis">
        <div><Mini shape={{ kind: 'polygon', pts: [[14, 66], [56, 66], [76, 26], [34, 26]] }} />Yes ✓</div>
        <div><Mini shape={{ kind: 'polygon', pts: [[16, 28], [74, 28], [74, 64], [16, 64]] }} />Rectangle ✓</div>
        <div><Mini shape={{ kind: 'polygon', pts: [[45, 14], [74, 46], [45, 78], [16, 46]] }} />Rhombus ✓</div>
        <div><Mini shape={{ kind: 'polygon', pts: [[12, 68], [78, 68], [60, 26], [30, 26]] }} />Trapezoid ✗</div>
      </div>
    </>
  )
}

export const parallelogramLessons: Lesson[] = [
  { id: 'g6u1-cut-slide', tag: 'CUT AND SLIDE', body: () => <CutAndSlide /> },
  { id: 'g6u1-matching-heights', tag: 'BASE AND MATCHING HEIGHT', body: () => <MatchingHeights /> },
  { id: 'g6u1-which-para', tag: 'WHAT COUNTS AS A PARALLELOGRAM', body: () => <WhichAreParallelograms /> },
]
