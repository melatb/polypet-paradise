import { describe, expect, it } from 'vitest'
import type { FigureSpec } from '../types'
import { ZONES } from './index'

const RUNS = 400

function checkFigure(spec: FigureSpec) {
  const nums: number[] = [spec.x0, spec.x1, spec.y0, spec.y1]
  for (const p of spec.polys ?? []) for (const q of p.pts) nums.push(...q)
  for (const s of spec.segs ?? []) nums.push(...s.a, ...s.b)
  for (const m of spec.marks ?? []) nums.push(...m.p, ...m.dx, ...m.dy)
  for (const d of spec.dots ?? []) nums.push(d.x, d.y)
  for (const l of spec.labels ?? []) { nums.push(l.x, l.y); expect(String(l.t)).not.toMatch(/NaN|undefined|Infinity/) }
  for (const n of nums) expect(Number.isFinite(n)).toBe(true)
  expect(spec.x1).toBeGreaterThan(spec.x0)
  expect(spec.y1).toBeGreaterThan(spec.y0)
  // Drawings should fit a phone screen without becoming tiny.
  expect(spec.x1 - spec.x0).toBeLessThanOrEqual(20)
  expect(spec.y1 - spec.y0).toBeLessThanOrEqual(12)
}

for (const zone of ZONES) {
  describe(zone.title, () => {
    for (const type of zone.questionTypes) {
      it(`${type.name} always makes a valid problem`, () => {
        for (let i = 0; i < RUNS; i++) {
          const q = type.make({ level: 1 + (i % 6) })
          const text = [q.prompt, q.hint, q.solution, q.unit ?? '', ...(q.choices ?? []).map((c) => (c.label ?? '') + (c.why ?? ''))].join(' ')
          expect(text).not.toMatch(/NaN|undefined|Infinity|\[object/)
          if (q.choices) {
            expect(q.answer).toBeUndefined()
            expect(q.choices.filter((c) => c.ok)).toHaveLength(1)
            const labels = q.choices.filter((c) => c.label).map((c) => c.label)
            expect(new Set(labels).size).toBe(labels.length)
          } else {
            expect(Number.isFinite(q.answer)).toBe(true)
            expect(q.answer!).toBeGreaterThan(0)
            if (q.commonSlip) expect(q.commonSlip.value).not.toBe(q.answer)
          }
          if (q.figure) { checkFigure(q.figure(false)); checkFigure(q.figure(true)) }
          if (q.table) {
            for (const row of q.table.rows) {
              expect(row).toHaveLength(2)
              for (const c of row) expect(String(c)).not.toMatch(/NaN|undefined|Infinity/)
            }
          }
        }
      })
    }
  })
}
