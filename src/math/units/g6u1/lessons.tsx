import { animate } from 'framer-motion'
import { useState } from 'react'
import { Figure, HELP, INK, Mini, SHAPE2 } from '../../Figure'
import type { FigSeg, Lesson, Pt } from '../../types'

function BaseHeight() {
  const [ax, setAx] = useState(2)
  const segs: FigSeg[] = [{ a: [ax, 4], b: [ax, 0] }]
  if (ax < 0) segs.push({ a: [ax, 0], b: [0, 0] })
  if (ax > 6) segs.push({ a: [6, 0], b: [ax, 0] })
  return (
    <>
      <p>Any side of a triangle can be the <b>base</b>. The <b>height</b> goes from the base to the opposite corner, straight up at a right angle. It can even land outside the triangle.</p>
      <div className="fig">
        <Figure spec={{
          x0: -4, x1: 10, y0: -1, y1: 5, grid: true, alt: 'Triangle with base 6 and height 4',
          polys: [{ pts: [[0, 0], [6, 0], [ax, 4]] }], segs,
          marks: [{ p: [ax, 0], dx: [ax > 3 ? -1 : 1, 0], dy: [0, 1], color: HELP }],
          labels: [{ x: 3, y: -0.5, t: 'base 6' }, { x: ax + (ax > 3 ? 0.75 : -0.75), y: 2, t: 4, color: HELP }],
        }} />
      </div>
      <div className="row">
        <label htmlFor="l1s" style={{ fontWeight: 800 }}>Slide the top corner</label>
        <input id="l1s" type="range" min={-3} max={9} step={1} value={ax} onChange={(e) => setAx(+e.target.value)} />
      </div>
      <div className="row"><span className="formula">½ × 6 × 4 = 12</span><span className="sub">Same base, same height, same area, however slanted it gets.</span></div>
    </>
  )
}

/* Triangle A(0,0) B(5,0) C(2,3); a copy spins 180° and slides into place to make a parallelogram. */
const G: Pt = [7 / 3, 1]
const G_END: Pt = [14 / 3, 2]
const G_START: Pt = [G[0] + 8, G[1]]
function copyAt(t: number): Pt[] {
  const th = Math.PI * t
  const cx = G_START[0] + (G_END[0] - G_START[0]) * t
  const cy = G_START[1] + (G_END[1] - G_START[1]) * t
  return ([[0, 0], [5, 0], [2, 3]] as Pt[]).map(([x, y]) => {
    const dx = x - G[0], dy = y - G[1]
    return [cx + dx * Math.cos(th) - dy * Math.sin(th), cy + dx * Math.sin(th) + dy * Math.cos(th)]
  })
}
function TwoTriangles() {
  const [t, setT] = useState(0)
  const [together, setTogether] = useState(false)
  const toggle = () => {
    const to = together ? 0 : 1
    setTogether(!together)
    animate(t, to, { duration: 0.9, ease: 'easeInOut', onUpdate: setT })
  }
  return (
    <>
      <p>Make a copy of a triangle, spin it halfway around, and snap it on. You always get a parallelogram. So a triangle's area is half of the parallelogram's.</p>
      <div className="fig">
        <Figure spec={{
          x0: -1, x1: 15, y0: -1, y1: 4, grid: true, alt: 'Triangle and a rotated copy forming a parallelogram',
          polys: [{ pts: [[0, 0], [5, 0], [2, 3]] }, { pts: copyAt(t), fill: SHAPE2 }],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={toggle}>{together ? 'Pull apart' : 'Snap together'}</button>
        <span className="formula">5 × 3 = 15, half is 7.5</span>
      </div>
      <div className="row"><span className="formula">Triangle area = ½ × base × height</span></div>
    </>
  )
}

function CutPolygons() {
  const [cut, setCut] = useState(false)
  return (
    <>
      <p>To find the area of any polygon, cut it into triangles and rectangles, find each piece, and add them up.</p>
      <div className="fig">
        <Figure spec={{
          x0: -1, x1: 7, y0: -2, y1: 4, grid: true, alt: 'Polygon cut into two triangles',
          polys: [{ pts: [[0, 0], [2, 3], [6, 0], [4, -1]] }],
          segs: cut ? [{ a: [0, 0], b: [6, 0], color: INK }, { a: [2, 3], b: [2, 0] }, { a: [4, -1], b: [4, 0] }] : [],
          labels: cut ? [{ x: 2.5, y: 1.5, t: 3, color: HELP }, { x: 4.5, y: -0.5, t: 1, color: HELP }] : [],
        }} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={() => setCut(!cut)}>{cut ? 'Hide the cut' : 'Show the cut'}</button>
        {cut && <span className="formula">½×6×3 + ½×6×1 = 9 + 3 = 12</span>}
      </div>
    </>
  )
}

const STAR: Pt[] = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 13 : 32
  return [+(45 + r * Math.cos(a)).toFixed(1), +(48 + r * Math.sin(a)).toFixed(1)] as Pt
})
function WhatIsAPolygon() {
  return (
    <>
      <p>A polygon is a flat shape made of straight line segments that close up and meet only at their endpoints. Triangles, quadrilaterals, pentagons and hexagons are all polygons.</p>
      <div className="minis">
        <div><Mini shape={{ kind: 'polygon', pts: STAR }} />Polygon ✓</div>
        <div><Mini shape={{ kind: 'curve' }} />Curved ✗</div>
        <div><Mini shape={{ kind: 'open' }} />Open ✗</div>
        <div><Mini shape={{ kind: 'bowtie' }} />Crossing ✗</div>
      </div>
    </>
  )
}

export const polygonLessons: Lesson[] = [
  { id: 'g6u1-base-height', tag: 'BASE & HEIGHT', body: () => <BaseHeight /> },
  { id: 'g6u1-two-triangles', tag: 'TWO TRIANGLES MAKE A PARALLELOGRAM', body: () => <TwoTriangles /> },
  { id: 'g6u1-cut', tag: 'CUT POLYGONS INTO PIECES', body: () => <CutPolygons /> },
  { id: 'g6u1-polygon', tag: 'WHAT COUNTS AS A POLYGON', body: () => <WhatIsAPolygon /> },
]
