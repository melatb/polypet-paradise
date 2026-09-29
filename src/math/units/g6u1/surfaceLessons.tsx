import { useState } from 'react'
import { Figure, HELP } from '../../Figure'
import { box, boxNet, NET_FILLS, rectPts, solidFigure, squarePyramid, triPrism, triPyramid, type Solid } from '../../shapes'
import type { Lesson } from '../../types'

const bare = (s: Solid): Solid => ({ ...s, labels: [], segs: s.segs.filter((g) => g.color) })

function PaintTheBox() {
  const [net, setNet] = useState(false)
  const faces = boxNet(5, 2, 4)
  return (
    <>
      <p>Imagine painting every side of a box. The amount of surface you cover is the <b>surface area</b>. Unfold the box into a <b>net</b> to see all 6 faces at once, then add up their areas.</p>
      <div className="fig">
        <Figure spec={net ? {
          x0: -0.6, x1: 14.6, y0: -0.6, y1: 8.6, grid: true, alt: 'Net of a 5 by 2 by 4 box with face areas',
          polys: faces.map((f, i) => ({ pts: rectPts(f.rect), fill: NET_FILLS[i], sw: 2.5 })),
          labels: faces.map((f) => ({ x: f.rect[0] + f.rect[2] / 2, y: f.rect[1] + f.rect[3] / 2, t: f.area, color: HELP })),
        } : solidFigure(box(5, 2, 4, { l: '5', w: '2', h: '4' }, 0.9), 'Box 5 by 2 by 4')} />
      </div>
      <div className="row">
        <button className="btn sm white" onClick={() => setNet(!net)}>{net ? 'Fold it back up' : 'Unfold the box'}</button>
        {net && <span className="formula">20 + 20 + 10 + 10 + 8 + 8 = 76</span>}
      </div>
    </>
  )
}

function Solids() {
  const items: [Solid, string][] = [
    [box(4, 2, 3, null, 0.9), 'Rectangular prism · 6 faces'],
    [bare(triPrism(3, 4, 5, 5, 0.8)), 'Triangular prism · 5 faces'],
    [bare(squarePyramid(4, 4, 0.9)), 'Square pyramid · 5 faces'],
    [triPyramid(), 'Triangular pyramid · 4 faces'],
  ]
  return (
    <>
      <p><b>Prisms</b> have two matching ends joined by rectangles. <b>Pyramids</b> have one base, and triangles that meet at a point. Dashed lines are edges hidden at the back.</p>
      <div className="minis solids">
        {items.map(([s, cap]) => <div key={cap}><Figure spec={solidFigure(s, cap)} />{cap}</div>)}
      </div>
    </>
  )
}

function DontForgetHalf() {
  const [fixed, setFixed] = useState(false)
  return (
    <>
      <p>Andre found the surface area of a triangular prism. The triangles have a base of 8 and a height of 3, and the rectangles are 5 × 2, 8 × 2 and 5 × 2. He got 100, but he made two mistakes.</p>
      <div className="row">
        {fixed
          ? <span className="formula">2 × (½ × 8 × 3) + 10 + 16 + 10 = 24 + 36 = 60</span>
          : <span className="formula">2 × 24 + 2 × 16 + 2 × 10 = 100</span>}
      </div>
      {fixed && <p>Each triangle is <b>½ × 8 × 3 = 12</b>, not 24. And there's only <b>one</b> 8 × 2 rectangle, so it shouldn't be doubled.</p>}
      <div className="row"><button className="btn sm white" onClick={() => setFixed(!fixed)}>{fixed ? "Show Andre's work" : 'Fix it'}</button></div>
    </>
  )
}

export const surfaceLessons: Lesson[] = [
  { id: 'g6u1-paint-box', tag: 'PAINT THE BOX', body: () => <PaintTheBox /> },
  { id: 'g6u1-solids', tag: 'PRISMS AND PYRAMIDS', body: () => <Solids /> },
  { id: 'g6u1-half', tag: "DON'T FORGET THE ½", body: () => <DontForgetHalf /> },
]
