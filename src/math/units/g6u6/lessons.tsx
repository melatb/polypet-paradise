import { useState } from 'react'
import { Figure } from '../../Figure'
import { COLORS } from '../../ratioDiagrams'
import { eqTape } from './equations'
import { distributeFigure } from './expressions'
import { graphFigure } from './relationships'
import type { Lesson } from '../../types'

function TapeEquations() {
  const [solved, setSolved] = useState(false)
  return (
    <>
      <p>A <b>variable</b> is a letter that stands for a number. This tape diagram shows <b>3x = 15</b>: three equal parts that make 15. The <b>solution</b> is the number that makes the equation true.</p>
      <div className="fig"><Figure spec={eqTape([0, 1, 2].map(() => ({ w: 1.8, t: solved ? '5' : 'x', fill: COLORS.a })), '15', 'Three parts labeled x, total 15')} /></div>
      <div className="row">
        <button className="btn sm white" onClick={() => setSolved(!solved)}>{solved ? 'Hide' : 'Solve it'}</button>
        {solved && <span className="formula">15 ÷ 3 = 5, so x = 5</span>}
      </div>
    </>
  )
}

function Distributive() {
  const [help, setHelp] = useState(false)
  return (
    <>
      <p>The big rectangle is 3 tall and x + 2 wide, so its area is <b>3(x + 2)</b>. Split it into two smaller rectangles and you get <b>3x + 6</b>. Same area, so the expressions are <b>equivalent</b>.</p>
      <div className="fig"><Figure spec={distributeFigure(3, 'x', 2, help)} /></div>
      <div className="row">
        <button className="btn sm white" onClick={() => setHelp(!help)}>{help ? 'Hide' : 'Split it'}</button>
        {help && <span className="formula">3(x + 2) = 3x + 6</span>}
      </div>
    </>
  )
}

function Exponents() {
  const [e, setE] = useState(4)
  return (
    <>
      <p>An <b>exponent</b> tells how many factors of the base to multiply. The base can be a whole number, a fraction, a decimal or a variable.</p>
      <div className="row">
        <label htmlFor="u6e" style={{ fontWeight: 800 }}>Exponent</label>
        <input id="u6e" type="range" min={1} max={6} value={e} onChange={(ev) => setE(+ev.target.value)} />
      </div>
      <div className="row"><span className="formula">7{'⁰¹²³⁴⁵⁶'[e]} = {Array(e).fill(7).join(' · ')} = {(7 ** e).toLocaleString()}</span></div>
    </>
  )
}

function Relationships() {
  return (
    <>
      <p>Bags of coins are worth 25 cents each, so <b>v = 25n</b>. The value <b>v</b> depends on the number of bags <b>n</b>. An equation, a table and a graph all show the same relationship.</p>
      <div className="fig"><Figure spec={graphFigure(25, [1, 2, 3, 4, 5, 6], null, true, ['number of bags', 'value (cents)'])} /></div>
    </>
  )
}

export const equationLessons: Lesson[] = [{ id: 'g6u6-tape', tag: 'EQUATIONS AND TAPE DIAGRAMS', body: () => <TapeEquations /> }]
export const expressionLessons: Lesson[] = [{ id: 'g6u6-distribute', tag: 'THE DISTRIBUTIVE PROPERTY', body: () => <Distributive /> }]
export const exponentLessons: Lesson[] = [{ id: 'g6u6-exponents', tag: 'EXPONENTS', body: () => <Exponents /> }]
export const relationshipLessons: Lesson[] = [{ id: 'g6u6-relations', tag: 'TABLES, EQUATIONS AND GRAPHS', body: () => <Relationships /> }]
