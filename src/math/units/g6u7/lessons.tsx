import { useState } from 'react'
import { Figure } from '../../Figure'
import { coordPlane, inequalityLine, numberLine, sn } from '../../dataDiagrams'
import type { Lesson } from '../../types'

function Absolute() {
  const [v, setV] = useState(-3)
  return (
    <>
      <p>Numbers left of 0 are <b>negative</b>. The <b>absolute value</b> of a number is its distance from 0, so |−3| = 3 and |3| = 3.</p>
      <div className="fig"><Figure spec={numberLine(-8, 8, [{ v, t: sn(v) }, { v: -v, t: sn(-v), color: '#7FD0FF' }], 'A number and its opposite', 2)} /></div>
      <div className="row">
        <label htmlFor="u7a" style={{ fontWeight: 800 }}>Move the point</label>
        <input id="u7a" type="range" min={-8} max={8} value={v} onChange={(e) => setV(+e.target.value)} />
        <span className="formula">|{sn(v)}| = {Math.abs(v)}</span>
      </div>
    </>
  )
}

function Inequalities() {
  const [closed, setClosed] = useState(false)
  return (
    <>
      <p>An <b>inequality</b> like <b>x {closed ? '≤' : '<'} 1</b> is true for many numbers. The graph shows all of them. An open circle means 1 is not included; a filled circle means it is.</p>
      <div className="fig"><Figure spec={inequalityLine(1, '<', closed, 'x less than 1')} /></div>
      <div className="row"><button className="btn sm white" onClick={() => setClosed(!closed)}>{closed ? 'Show x < 1' : 'Show x ≤ 1'}</button></div>
    </>
  )
}

function Plane() {
  return (
    <>
      <p>The coordinate plane has four <b>quadrants</b>. The first coordinate says how far right (+) or left (−); the second says how far up (+) or down (−).</p>
      <div className="fig"><Figure spec={coordPlane(5, [{ x: -4, y: 1, t: '(−4, 1)' }, { x: -3.5, y: -3, t: '(−3.5, −3)', color: '#7FD0FF' }, { x: 3, y: 2, t: '(3, 2)', color: '#FFD23F' }], 'Points in three quadrants')} /></div>
    </>
  )
}

function FactorsMultiples() {
  return (
    <>
      <p>Since 2 × 6 = 12, 2 and 6 are <b>factors</b> of 12. The <b>greatest common factor</b> of 18 and 24 is 6. The <b>least common multiple</b> of 18 and 24 is 72.</p>
      <p>A loaf makes 10 sandwiches and a package of cheese makes 15. The least common multiple is 30, so 30 sandwiches uses 3 loaves and 2 packages with nothing left over.</p>
      <div className="row"><span className="formula">GCF(18, 24) = 6</span><span className="formula">LCM(10, 15) = 30</span></div>
    </>
  )
}

export const negativeLessons: Lesson[] = [{ id: 'g6u7-abs', tag: 'NEGATIVES AND ABSOLUTE VALUE', body: () => <Absolute /> }]
export const inequalityLessons: Lesson[] = [{ id: 'g6u7-ineq', tag: 'INEQUALITIES', body: () => <Inequalities /> }]
export const coordinateLessons: Lesson[] = [{ id: 'g6u7-plane', tag: 'FOUR QUADRANTS', body: () => <Plane /> }]
export const factorLessons: Lesson[] = [{ id: 'g6u7-factors', tag: 'FACTORS AND MULTIPLES', body: () => <FactorsMultiples /> }]
