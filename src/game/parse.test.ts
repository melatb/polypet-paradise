import { expect, it } from 'vitest'
import { parseAnswer } from './rules'

it('reads the ways kids type answers', () => {
  expect(parseAnswer('12')).toBe(12)
  expect(parseAnswer('7.5')).toBe(7.5)
  expect(parseAnswer('7 1/2')).toBe(7.5)
  expect(parseAnswer('15/2')).toBe(7.5)
  expect(parseAnswer('7½')).toBe(7.5)
  expect(parseAnswer('-5')).toBe(-5)
  expect(parseAnswer('−5')).toBe(-5)
  expect(parseAnswer('1,000')).toBe(1000)
  expect(parseAnswer('12,345,678')).toBe(12345678)
  expect(parseAnswer('2,5')).toBe(2.5)
  expect(parseAnswer('12 sq units')).toBe(12)
  expect(parseAnswer('abc')).toBeNaN()
})
