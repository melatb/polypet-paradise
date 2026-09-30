import { describe, expect, it } from 'vitest'
import { freshState, newPet } from '../game/rules'
import type { GameState } from '../game/types'
import { applyTrade, fairness, formatCode, makeFriendCode, normalizeCode, offerProblem, pairId, petPoints, sanitizePet, sidePoints } from './model'

function stateWith(...species: string[]): GameState {
  const s = freshState()
  const pets = species.map((sp, i) => ({ ...newPet(sp), id: `p${i}` }))
  return { ...s, pets, activeId: pets[0].id }
}

describe('friend codes', () => {
  it('makes 8-character codes that normalize back to themselves', () => {
    for (let i = 0; i < 200; i++) {
      const c = makeFriendCode()
      expect(c).toHaveLength(8)
      expect(normalizeCode(c)).toBe(c)
      expect(normalizeCode(formatCode(c).toLowerCase())).toBe(c)
    }
  })
  it('rejects codes with confusable or missing characters', () => {
    expect(normalizeCode('ABCD-EFG')).toBeNull()
    expect(normalizeCode('ABCD-EFG0')).toBeNull()
    expect(normalizeCode('ABCD EFGI')).toBeNull()
    expect(normalizeCode(' abcd-efgh ')).toBe('ABCDEFGH')
  })
  it('pair ids are the same from both sides', () => {
    expect(pairId('b', 'a')).toBe('a_b')
    expect(pairId('a', 'b')).toBe('a_b')
  })
})

describe('fairness', () => {
  it('counts corners times stage', () => {
    expect(petPoints({ species: 'tripup', stage: 0 })).toBe(1)
    expect(petPoints({ species: 'decaphoenix', stage: 4 })).toBe(80)
    expect(sidePoints([{ species: 'tripup', stage: 1 }, { species: 'tripup', stage: 2 }])).toBe(5)
  })
  it('gives sensible verdicts', () => {
    expect(fairness(10, 10).verdict).toBe('fair')
    expect(fairness(10, 12).verdict).toBe('fair')
    expect(fairness(10, 15).verdict).toBe('good')
    expect(fairness(10, 40).verdict).toBe('great')
    expect(fairness(10, 7).verdict).toBe('bad')
    expect(fairness(10, 2).verdict).toBe('awful')
    expect(fairness(10, 40).tilt).toBe(1)
    expect(fairness(40, 10).tilt).toBe(-1)
  })
})

describe('sanitizePet', () => {
  it('rejects things that are not pets', () => {
    expect(sanitizePet(null)).toBeNull()
    expect(sanitizePet({ species: 'unicornzilla' })).toBeNull()
    expect(sanitizePet('pet')).toBeNull()
  })
  it('clamps numbers and locks outfits to the stage', () => {
    const p = sanitizePet({ id: 'x', species: 'tripup', stage: 99, prog: -3, need: 1e9, look: { paint: 'galactic', hat: 'crown', neck: 'nope' } })!
    expect(p.stage).toBe(4)
    expect(p.prog).toBe(0)
    expect(p.look).toEqual({ paint: 'galactic', hat: 'crown', neck: 'none' })
    const baby = sanitizePet({ id: 'y', species: 'tripup', stage: 0, look: { paint: 'galactic', hat: 'crown' } })!
    expect(baby.look).toEqual({ paint: 'natural', hat: 'none', neck: 'none' })
  })
})

describe('applyTrade', () => {
  it('swaps pets once, even if applied again', () => {
    const s = stateWith('tripup', 'cubbycat')
    const incoming = [{ id: 'far', species: 'hexowl', stage: 2, prog: 1, need: 0, look: { paint: 'ocean', hat: 'headphones', neck: 'bib' } }]
    const a = applyTrade(s, 'T1', ['p1'], incoming)
    expect(a.pets.map((p) => p.species)).toEqual(['tripup', 'hexowl'])
    expect(a.pets[1].id).toBe('tT1-0')
    expect(a.appliedTrades).toEqual(['T1'])
    expect(applyTrade(a, 'T1', ['p0'], incoming)).toBe(a)
  })
  it('brings a new pet to the yard when the active pet leaves', () => {
    const s = stateWith('tripup', 'cubbycat')
    const a = applyTrade(s, 'T2', ['p0'], [{ species: 'rhombun', stage: 0 }])
    expect(a.activeId).toBe('tT2-0')
    const b = applyTrade(stateWith('tripup'), 'T3', ['p0'], [{ species: 'rhombun', stage: 0 }])
    expect(b.pets).toHaveLength(1)
    expect(b.activeId).toBe('tT3-0')
  })
  it('never leaves a player with no pets', () => {
    const s = stateWith('tripup')
    expect(applyTrade(s, 'T4', ['p0'], [{ species: 'fake' }]).pets).toHaveLength(1)
  })
})

describe('offerProblem', () => {
  const s = stateWith('tripup', 'cubbycat', 'rhombun')
  it('accepts a normal offer', () => {
    expect(offerProblem(s, ['p1'], ['x'], new Set())).toBeNull()
  })
  it('catches empty, locked, foreign and give-everything offers', () => {
    expect(offerProblem(s, [], ['x'], new Set())).toMatch(/offer/)
    expect(offerProblem(s, ['p1'], [], new Set())).toMatch(/like/)
    expect(offerProblem(s, ['p1'], ['x'], new Set(['p1']))).toMatch(/another offer/)
    expect(offerProblem(s, ['zz'], ['x'], new Set())).toMatch(/isn’t yours/)
    expect(offerProblem(s, ['p0', 'p1'], ['x'], new Set(['p2']))).toMatch(/at least one/)
    expect(offerProblem(s, ['p0', 'p1', 'p2'], ['x'], new Set())).toMatch(/at least one/)
  })
})
