import type { Zone } from '../types'
import { areaQuestionTypes } from './g6u1/area'
import { areaLessons } from './g6u1/areaLessons'
import { parallelogramLessons } from './g6u1/parallelogramLessons'
import { parallelogramQuestionTypes } from './g6u1/parallelograms'
import { polygonLessons } from './g6u1/lessons'
import { polygonQuestionTypes } from './g6u1/questions'
import { surfaceLessons } from './g6u1/surfaceLessons'
import { surfaceQuestionTypes } from './g6u1/surface'
import { numberLineLessons, ratioLessons, tableLessons } from './g6u2/lessons'
import { numberLineQuestionTypes } from './g6u2/numberLines'
import { ratioQuestionTypes } from './g6u2/ratios'
import { tableQuestionTypes } from './g6u2/tables'
import { measureLessons, percentLessons, rateLessons } from './g6u3/lessons'
import { measureQuestionTypes } from './g6u3/measure'
import { percentQuestionTypes } from './g6u3/percent'
import { rateQuestionTypes } from './g6u3/rates'
import { fractionDivQuestionTypes } from './g6u4/dividing'
import { fractionGeometryQuestionTypes } from './g6u4/geometry'
import { fractionDivLessons, fractionGeometryLessons, meaningLessons } from './g6u4/lessons'
import { meaningQuestionTypes } from './g6u4/meaning'
import { addSubQuestionTypes } from './g6u5/addsub'
import { divideQuestionTypes } from './g6u5/divide'
import { addSubLessons, divideLessons, multiplyLessons } from './g6u5/lessons'
import { multiplyQuestionTypes } from './g6u5/multiply'
import { equationQuestionTypes } from './g6u6/equations'
import { exponentQuestionTypes } from './g6u6/exponents'
import { expressionQuestionTypes } from './g6u6/expressions'
import { equationLessons, exponentLessons, expressionLessons, relationshipLessons } from './g6u6/lessons'
import { relationshipQuestionTypes } from './g6u6/relationships'

const IM_CREDIT = 'Math content based on Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).'
const U1 = { grade: 6, unit: 1, unitTitle: 'Area and Surface Area', credit: IM_CREDIT }
const U2 = { grade: 6, unit: 2, unitTitle: 'Introducing Ratios', credit: IM_CREDIT }
const U3 = { grade: 6, unit: 3, unitTitle: 'Unit Rates and Percentages', credit: IM_CREDIT }
const U4 = { grade: 6, unit: 4, unitTitle: 'Dividing Fractions', credit: IM_CREDIT }
const U5 = { grade: 6, unit: 5, unitTitle: 'Arithmetic in Base Ten', credit: IM_CREDIT }
const U6 = { grade: 6, unit: 6, unitTitle: 'Expressions and Equations', credit: IM_CREDIT }

/**
 * Playable zones, in the order they appear on the world map.
 * To add a section: make a folder under units/ and register a zone here.
 */
export const ZONES: Zone[] = [
  { ...U1, id: 'g6u1-area', title: 'Reasoning to Find Area', short: 'Finding Area', blurb: 'Count squares, break shapes apart, move pieces', questionTypes: areaQuestionTypes, lessons: areaLessons },
  { ...U1, id: 'g6u1-parallelograms', title: 'Parallelograms', short: 'Parallelograms', blurb: 'Base times height, and matching heights', questionTypes: parallelogramQuestionTypes, lessons: parallelogramLessons },
  { ...U1, id: 'g6u1-polygons', title: 'Triangles and Other Polygons', short: 'Polygons', blurb: 'Half a parallelogram, and cutting polygons into triangles', questionTypes: polygonQuestionTypes, lessons: polygonLessons },
  { ...U1, id: 'g6u1-surface', title: 'Surface Area', short: 'Surface Area', blurb: 'Nets, prisms and pyramids', questionTypes: surfaceQuestionTypes, lessons: surfaceLessons },
  { ...U2, id: 'g6u2-ratios', title: 'What Are Ratios?', short: 'Ratios', blurb: 'Ratio language, recipes and equivalent ratios', questionTypes: ratioQuestionTypes, lessons: ratioLessons },
  { ...U2, id: 'g6u2-number-lines', title: 'Double Number Lines', short: 'Number Lines', blurb: 'Rates on number lines, price of one, who is faster', questionTypes: numberLineQuestionTypes, lessons: numberLineLessons },
  { ...U2, id: 'g6u2-tables', title: 'Tables and Tape Diagrams', short: 'Ratio Tables', blurb: 'Tables of equivalent ratios and part-part-whole', questionTypes: tableQuestionTypes, lessons: tableLessons },
  { ...U3, id: 'g6u3-measure', title: 'Units of Measurement', short: 'Measurement', blurb: 'Feet, meters, pounds and kilograms', questionTypes: measureQuestionTypes, lessons: measureLessons },
  { ...U3, id: 'g6u3-rates', title: 'Unit Rates', short: 'Unit Rates', blurb: 'Per 1, better deals and speed', questionTypes: rateQuestionTypes, lessons: rateLessons },
  { ...U3, id: 'g6u3-percent', title: 'Percentages', short: 'Percents', blurb: 'Per 100, finding the whole, sales', questionTypes: percentQuestionTypes, lessons: percentLessons },
  { ...U4, id: 'g6u4-meaning', title: 'Making Sense of Division', short: 'Meaning of Division', blurb: 'How many groups? How much in each?', questionTypes: meaningQuestionTypes, lessons: meaningLessons },
  { ...U4, id: 'g6u4-dividing', title: 'Dividing Fractions', short: 'Dividing Fractions', blurb: 'Groups of fractions and the reciprocal', questionTypes: fractionDivQuestionTypes, lessons: fractionDivLessons },
  { ...U4, id: 'g6u4-geometry', title: 'Fractions in Lengths, Areas and Volumes', short: 'Fraction Geometry', blurb: 'Rectangles and boxes with fraction sides', questionTypes: fractionGeometryQuestionTypes, lessons: fractionGeometryLessons },
  { ...U5, id: 'g6u5-addsub', title: 'Adding and Subtracting Decimals', short: 'Adding Decimals', blurb: 'Place value, bundling and making change', questionTypes: addSubQuestionTypes, lessons: addSubLessons },
  { ...U5, id: 'g6u5-multiply', title: 'Multiplying Decimals', short: 'Multiplying Decimals', blurb: 'Area models and placing the decimal point', questionTypes: multiplyQuestionTypes, lessons: multiplyLessons },
  { ...U5, id: 'g6u5-divide', title: 'Dividing Numbers', short: 'Dividing Decimals', blurb: 'Partial quotients and dividing by decimals', questionTypes: divideQuestionTypes, lessons: divideLessons },
  { ...U6, id: 'g6u6-equations', title: 'Equations in One Variable', short: 'Equations', blurb: 'Tape diagrams and solving for x', questionTypes: equationQuestionTypes, lessons: equationLessons },
  { ...U6, id: 'g6u6-expressions', title: 'Equivalent Expressions', short: 'Expressions', blurb: 'The distributive property', questionTypes: expressionQuestionTypes, lessons: expressionLessons },
  { ...U6, id: 'g6u6-exponents', title: 'Expressions with Exponents', short: 'Exponents', blurb: 'Powers and order of operations', questionTypes: exponentQuestionTypes, lessons: exponentLessons },
  { ...U6, id: 'g6u6-relationships', title: 'Relationships Between Quantities', short: 'Relationships', blurb: 'Tables, equations and graphs', questionTypes: relationshipQuestionTypes, lessons: relationshipLessons },
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
