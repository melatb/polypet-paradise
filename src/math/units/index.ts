import type { Zone } from '../types'
import { polygonLessons } from './g6u1/lessons'
import { polygonQuestionTypes } from './g6u1/questions'

const IM_CREDIT = 'Math content based on Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).'

/** Playable zones. Add a folder under units/ and register it here to add a new section. */
export const ZONES: Zone[] = [
  {
    id: 'g6u1-polygons',
    grade: 6,
    unit: 1,
    unitTitle: 'Area and Surface Area',
    title: 'Triangles and Other Polygons',
    questionTypes: polygonQuestionTypes,
    lessons: polygonLessons,
    credit: IM_CREDIT,
  },
]
export const ZONES_BY_ID: Record<string, Zone> = Object.fromEntries(ZONES.map((z) => [z.id, z]))

/** Grade 6 roadmap, shown on the world map. */
export const GRADE6_UNITS = [
  { unit: 1, title: 'Area and Surface Area' },
  { unit: 2, title: 'Introducing Ratios' },
  { unit: 3, title: 'Unit Rates and Percentages' },
  { unit: 4, title: 'Dividing Fractions' },
  { unit: 5, title: 'Arithmetic in Base Ten' },
  { unit: 6, title: 'Expressions and Equations' },
  { unit: 7, title: 'Rational Numbers' },
  { unit: 8, title: 'Data Sets and Distributions' },
  { unit: 9, title: 'Putting It All Together' },
] as const
