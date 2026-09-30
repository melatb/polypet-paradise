import type { Lesson } from '../../types'

function Fermi() {
  return (
    <>
      <p>A <b>Fermi problem</b> asks for a good estimate of something you can't easily count, like how many times your heart beats in a day. Break it into steps you can guess, and round to easy numbers.</p>
      <div className="row"><span className="formula">70 beats/min × 60 × 24 ≈ 100,000</span></div>
    </>
  )
}
function Voting() {
  return (
    <>
      <p>Voting uses ratios and percents. If 12 of 30 students vote for pizza, that's <b>40%</b>. A <b>majority</b> means more than half. Councils can share seats <b>fairly</b> by giving each town the same share of seats as its share of the people.</p>
      <div className="row"><span className="formula">12/30 = 40/100 = 40%</span></div>
    </>
  )
}
function Review() {
  return <p>The <b>Grand Review</b> mixes questions from every world you've visited. Its level goes up just like any other world, bringing in harder question types as you go.</p>
}

export const fermiLessons: Lesson[] = [{ id: 'g6u9-fermi', tag: 'FERMI PROBLEMS', body: () => <Fermi /> }]
export const votingLessons: Lesson[] = [{ id: 'g6u9-voting', tag: 'THE MATH OF VOTING', body: () => <Voting /> }]
export const reviewLessons: Lesson[] = [{ id: 'g6u9-review', tag: 'GRAND REVIEW', body: () => <Review /> }]
