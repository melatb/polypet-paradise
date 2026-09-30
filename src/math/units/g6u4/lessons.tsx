import { useState } from 'react'
import { Figure } from '../../Figure'
import { F, groupBars, show } from '../../fractions'
import type { Lesson } from '../../types'

function TwoMeanings() {
  const [each, setEach] = useState(false)
  return (
    <>
      <p>Division answers two kinds of questions. <b>10 ÷ 2</b> can mean:</p>
      <div className="row">
        <button className={'btn sm ' + (each ? 'white' : '')} onClick={() => setEach(false)}>How many groups?</button>
        <button className={'btn sm ' + (each ? '' : 'white')} onClick={() => setEach(true)}>How much in each?</button>
      </div>
      <p>{each ? 'If 10 liters are shared equally by 2 bottles, how many liters go in each bottle? 5 liters.' : 'How many 2-liter bottles can you fill with 10 liters? 5 bottles.'}</p>
      <p>The same two meanings work with fractions. <b>6 ÷ 1½</b> asks how many 1½s are in 6 (4 of them), or how much is in 1 group if 1½ groups make 6 (also 4).</p>
    </>
  )
}

function GroupsOfFractions() {
  const [help, setHelp] = useState(false)
  return (
    <>
      <p>How many groups of <b>⅔</b> are in <b>5</b>? Cut each whole into thirds and make groups of 2 thirds. There are 7 full groups, and the leftover third is half a group.</p>
      <div className="fig"><Figure spec={groupBars(5, 2, 3, help, '5 wholes in thirds, grouped by 2 thirds')} /></div>
      <div className="row">
        <button className="btn sm white" onClick={() => setHelp(!help)}>{help ? 'Hide the count' : 'Count the groups'}</button>
        {help && <span className="formula">5 ÷ ⅔ = 7½</span>}
      </div>
    </>
  )
}

function InvertMultiply() {
  return (
    <>
      <p>There are 3 thirds in every whole, so <b>2 ÷ ⅓ = 2 × 3 = 6</b>. That's why dividing by a fraction is the same as multiplying by its <b>reciprocal</b> (the fraction flipped).</p>
      <div className="fig"><Figure spec={groupBars(2, 1, 3, true, '2 wholes cut into 6 thirds')} /></div>
      <div className="row"><span className="formula">¾ ÷ ⅖ = ¾ × ⁵⁄₂ = ¹⁵⁄₈</span></div>
    </>
  )
}

function Rooms() {
  return (
    <>
      <p>Fractions show up in lengths and areas. A room is <b>2½</b> meters wide and has an area of <b>11¼</b> square meters. Its length is the area divided by the width.</p>
      <div className="row"><span className="formula">11¼ ÷ 2½ = ⁴⁵⁄₄ × ⅖ = 4½ meters</span></div>
      <p>Volume works the same way: a box {show(F(3, 2))} by {show(F(1, 2))} by 2 inches holds {show(F(3, 2))} cubic inches.</p>
    </>
  )
}

export const meaningLessons: Lesson[] = [{ id: 'g6u4-meanings', tag: 'TWO MEANINGS OF DIVISION', body: () => <TwoMeanings /> }]
export const fractionDivLessons: Lesson[] = [
  { id: 'g6u4-groups', tag: 'GROUPS OF FRACTIONS', body: () => <GroupsOfFractions /> },
  { id: 'g6u4-flip', tag: 'MULTIPLY BY THE RECIPROCAL', body: () => <InvertMultiply /> },
]
export const fractionGeometryLessons: Lesson[] = [{ id: 'g6u4-rooms', tag: 'FRACTIONS IN AREA AND VOLUME', body: () => <Rooms /> }]
