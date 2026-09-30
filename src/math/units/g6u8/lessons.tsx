import { useState } from 'react'
import { Figure } from '../../Figure'
import { boxPlot, dotPlot } from '../../dataDiagrams'
import type { Lesson } from '../../types'

function Statistical() {
  return (
    <>
      <p>A <b>statistical question</b> expects answers that vary, like "What band is most popular among sixth graders?" A <b>dot plot</b> shows each answer as a dot. For lots of data, a <b>histogram</b> groups values into bars.</p>
      <div className="fig"><Figure spec={dotPlot([1, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 8], 0, 8, 'books read', 'Dot plot of books read')} /></div>
    </>
  )
}

function FairShare() {
  const [even, setEven] = useState(false)
  const days = [2, 4, 3, 5, 2]
  return (
    <>
      <p>The <b>mean</b> is a fair share. Mai ran {days.join(', ')} miles on 5 days, 16 miles in all. Spread evenly, that's <b>3.2 miles a day</b>. The <b>MAD</b> (mean absolute deviation) tells how far the values typically are from the mean.</p>
      <div className="row">
        {(even ? Array(5).fill(3.2) : days).map((d, i) => <span key={i} className="formula">{d}</span>)}
      </div>
      <div className="row"><button className="btn sm white" onClick={() => setEven(!even)}>{even ? 'Show real days' : 'Share it out evenly'}</button><span className="formula">16 ÷ 5 = 3.2</span></div>
    </>
  )
}

function BoxPlots() {
  return (
    <>
      <p>The <b>median</b> is the middle value in order. A <b>box plot</b> shows five numbers: the least, Q1, the median, Q3 and the greatest. The box is the middle half of the data, and its width is the <b>IQR</b>.</p>
      <div className="fig"><Figure spec={boxPlot([5, 12, 18, 24, 40], 0, 50, 5, 'minutes of reading', 'Box plot', true)} /></div>
      <div className="row"><span className="formula">IQR = 24 − 12 = 12</span></div>
    </>
  )
}

export const displayLessons: Lesson[] = [{ id: 'g6u8-stat', tag: 'STATISTICAL QUESTIONS', body: () => <Statistical /> }]
export const meanLessons: Lesson[] = [{ id: 'g6u8-mean', tag: 'MEAN AS A FAIR SHARE', body: () => <FairShare /> }]
export const medianLessons: Lesson[] = [{ id: 'g6u8-box', tag: 'MEDIAN AND BOX PLOTS', body: () => <BoxPlots /> }]
