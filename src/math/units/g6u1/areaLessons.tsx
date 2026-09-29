import { animate } from 'framer-motion'
import { useState } from 'react'
import { Figure, HELP, INK, SHAPE, SHAPE2 } from '../../Figure'
import { cellPoly, halfCell } from '../../shapes'
import type { Lesson, Pt } from '../../types'

/** Rotate points 180° around their centroid and move the centroid; t=0 start, t=1 end. */
function spinSlide(pts: Pt[], from: Pt, to: Pt, fromTurns: number, toTurns: number, t: number): Pt[] {
  const g: Pt = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]
  const th = Math.PI * (fromTurns + (toTurns - fromTurns) * t)
  const cx = from[0] + (to[0] - from[0]) * t, cy = from[1] + (to[1] - from[1]) * t
  return pts.map(([x, y]) => {
    const dx = x - g[0], dy = y - g[1]
    return [cx + dx * Math.cos(th) - dy * Math.sin(th), cy + dx * Math.sin(th) + dy * Math.cos(th)]
  })
}

function useToggleAnim(duration = 0.9) {
  const [t, setT] = useState(0)
  const [on, setOn] = useState(false)
  const toggle = () => { setOn(!on); animate(t, on ? 0 : 1, { duration, ease: 'easeInOut', onUpdate: setT }) }
  return { t, on, toggle }
}

const TRI: Pt[] = [[0, 0], [4, 0], [0, 3]]
function MatchUp() {
  const { t, on, toggle } = useToggleAnim()
  const g: Pt = [4 / 3, 1]
  return (
    <>
      <p>Two shapes that <b>match up exactly</b> have the same area. Triangle B is Triangle A turned halfway around. Slide it over and it fits perfectly on top.</p>
      <div className="fig">
        <Figure spec={{
          x0: -0.8, x1: 11, y0: -0.8, y1: 3.8, grid: true, alt: 'Two identical triangles, one rotated',
          polys: [{ pts: TRI }, { pts: spinSlide(TRI, [g[0] + 6, g[1]], g, 1, 0, t), fill: SHAPE2 }],
          labels: t < 0.05 ? [{ x: 1, y: 0.9, t: 'A' }, { x: 8.3, y: 1.4, t: 'B' }] : [],
        }} />
      </div>
      <div className="row"><button className="btn sm white" onClick={toggle}>{on ? 'Move B back' : 'Place B on A'}</button></div>
    </>
  )
}

function Decompose() {
  const [cut, setCut] = useState(false)
  return (
    <>
      <p>You can <b>break a shape into pieces</b> and add the areas of the pieces. This shape is Rectangle A, plus Rectangle B, plus Rectangle C.</p>
      <div className="fig">
        <Figure spec={{
          x0: -0.8, x1: 7.8, y0: -0.8, y1: 5.8, grid: true, alt: 'Polygon made of three rectangles',
          polys: [{ pts: [[0, 0], [7, 0], [7, 3], [5, 3], [5, 5], [3, 5], [3, 2], [0, 2]] }],
          segs: cut ? [{ a: [3, 0], b: [3, 2], color: INK, solid: true }, { a: [5, 0], b: [5, 3], color: INK, solid: true }] : [],
          labels: cut ? [{ x: 1.5, y: 1, t: 'A: 6', color: HELP }, { x: 4, y: 2.5, t: 'B: 10', color: HELP }, { x: 6, y: 1.5, t: 'C: 6', color: HELP }] : [],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={() => setCut(!cut)}>{cut ? 'Hide the pieces' : 'Show the pieces'}</button>
        {cut && <span className="formula">6 + 10 + 6 = 22</span>}
      </div>
    </>
  )
}

function Rearrange() {
  const { t, on, toggle } = useToggleAnim()
  return (
    <>
      <p>Sometimes it helps to <b>move a piece</b>. Take the 4-by-2 block off the top, split it into two strips, and lay them side by side. Now it's an 8-by-6 rectangle.</p>
      <div className="fig">
        <Figure spec={{
          x0: -0.8, x1: 8.8, y0: -0.8, y1: 7.8, grid: true, alt: 'Shape rearranged into an 8 by 6 rectangle',
          polys: [
            { pts: [[0, 0], [8, 0], [8, 5], [0, 5]] },
            { pts: [[0, 5], [4, 5], [4, 6], [0, 6]], fill: SHAPE2 },
            { pts: ([[0, 6], [4, 6], [4, 7], [0, 7]] as Pt[]).map(([x, y]) => [x + 4 * t, y - t] as Pt), fill: '#FFF1B8' },
          ],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={toggle}>{on ? 'Put it back' : 'Move the strip'}</button>
        <span className="formula">8 × 6 = 48</span>
      </div>
    </>
  )
}

function Halves() {
  return (
    <>
      <p>Two triangles that each cut a unit square in half make <b>1 whole square unit</b>. So each triangle is <b>½</b> square unit. This shape has 2 whole squares and 5 half squares.</p>
      <div className="fig">
        <Figure spec={{
          x0: -0.6, x1: 5.6, y0: -0.6, y1: 3.6, grid: true, alt: 'Shape made of 2 squares and 5 half squares',
          polys: [cellPoly([1, 1]), cellPoly([2, 1]), halfCell([0, 1], 1), halfCell([3, 1], 0), halfCell([1, 2], 0), halfCell([2, 2], 1), halfCell([1, 0], 3)].map((p, i) => (i > 1 ? { ...p, fill: SHAPE2 } : { ...p, fill: SHAPE })),
        }} />
      </div>
      <div className="row"><span className="formula">2 + 5 × ½ = 4½ square units</span></div>
    </>
  )
}

export const areaLessons: Lesson[] = [
  { id: 'g6u1-match-up', tag: 'SAME SHAPE, SAME AREA', body: () => <MatchUp /> },
  { id: 'g6u1-decompose', tag: 'BREAK IT INTO PIECES', body: () => <Decompose /> },
  { id: 'g6u1-rearrange', tag: 'MOVE A PIECE', body: () => <Rearrange /> },
  { id: 'g6u1-halves', tag: 'TWO HALVES MAKE A WHOLE', body: () => <Halves /> },
]
