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
import { coordinateQuestionTypes } from './g6u7/coordinates'
import { factorQuestionTypes } from './g6u7/factors'
import { inequalityQuestionTypes } from './g6u7/inequalities'
import { coordinateLessons, factorLessons, inequalityLessons, negativeLessons } from './g6u7/lessons'
import { negativeQuestionTypes } from './g6u7/negatives'
import { displayQuestionTypes } from './g6u8/displays'
import { displayLessons, meanLessons, medianLessons } from './g6u8/lessons'
import { meanQuestionTypes } from './g6u8/mean'
import { medianQuestionTypes } from './g6u8/median'
import { fermiQuestionTypes } from './g6u9/fermi'
import { fermiLessons, reviewLessons, votingLessons } from './g6u9/lessons'
import { reviewQuestionTypes } from './g6u9/review'
import { votingQuestionTypes } from './g6u9/voting'

const IM_CREDIT = 'Math content based on Illustrative Mathematics 6–8 Math v.360 (CC BY-NC 4.0).'
const U1 = { grade: 6, unit: 1, unitTitle: 'Area and Surface Area', credit: IM_CREDIT }
const U2 = { grade: 6, unit: 2, unitTitle: 'Introducing Ratios', credit: IM_CREDIT }
const U3 = { grade: 6, unit: 3, unitTitle: 'Unit Rates and Percentages', credit: IM_CREDIT }
const U4 = { grade: 6, unit: 4, unitTitle: 'Dividing Fractions', credit: IM_CREDIT }
const U5 = { grade: 6, unit: 5, unitTitle: 'Arithmetic in Base Ten', credit: IM_CREDIT }
const U6 = { grade: 6, unit: 6, unitTitle: 'Expressions and Equations', credit: IM_CREDIT }
const U7 = { grade: 6, unit: 7, unitTitle: 'Rational Numbers', credit: IM_CREDIT }
const U8 = { grade: 6, unit: 8, unitTitle: 'Data Sets and Distributions', credit: IM_CREDIT }
const U9 = { grade: 6, unit: 9, unitTitle: 'Putting It All Together', credit: IM_CREDIT }

/** One zone per curriculum section. To add a section: make a folder under units/ and register it here. */
const UNIT_ZONES: Zone[] = [
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
  { ...U7, id: 'g6u7-negatives', title: 'Negative Numbers and Absolute Value', short: 'Negative Numbers', blurb: 'Temperatures, elevations and distance from 0', questionTypes: negativeQuestionTypes, lessons: negativeLessons },
  { ...U7, id: 'g6u7-inequalities', title: 'Inequalities', short: 'Inequalities', blurb: 'Solutions and graphs of x < 1', questionTypes: inequalityQuestionTypes, lessons: inequalityLessons },
  { ...U7, id: 'g6u7-coordinates', title: 'The Coordinate Plane', short: 'Coordinate Plane', blurb: 'Four quadrants, distances and reflections', questionTypes: coordinateQuestionTypes, lessons: coordinateLessons },
  { ...U7, id: 'g6u7-factors', title: 'Common Factors and Multiples', short: 'Factors and Multiples', blurb: 'GCF, LCM and no leftovers', questionTypes: factorQuestionTypes, lessons: factorLessons },
  { ...U8, id: 'g6u8-displays', title: 'Statistical Questions and Displays', short: 'Data Displays', blurb: 'Dot plots and histograms', questionTypes: displayQuestionTypes, lessons: displayLessons },
  { ...U8, id: 'g6u8-mean', title: 'Mean and MAD', short: 'Mean and MAD', blurb: 'Fair shares and how spread out data is', questionTypes: meanQuestionTypes, lessons: meanLessons },
  { ...U8, id: 'g6u8-median', title: 'Median and Box Plots', short: 'Median and Box Plots', blurb: 'Middle values, IQR and outliers', questionTypes: medianQuestionTypes, lessons: medianLessons },
  { ...U9, id: 'g6u9-fermi', title: 'Fermi Problems', short: 'Fermi Problems', blurb: 'Smart estimates for huge numbers', questionTypes: fermiQuestionTypes, lessons: fermiLessons },
  { ...U9, id: 'g6u9-voting', title: 'Voting', short: 'Voting', blurb: 'Percents, majorities and fair seats', questionTypes: votingQuestionTypes, lessons: votingLessons },
]

/**
 * Playable zones, in world-map order. The Grand Review mixes every question type from the other worlds.
 */
export const ZONES: Zone[] = [
  ...UNIT_ZONES,
  { ...U9, id: 'g6u9-review', title: 'Grand Review', short: 'Grand Review', blurb: 'A mix of everything from Grade 6', questionTypes: reviewQuestionTypes(UNIT_ZONES), lessons: reviewLessons },
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
