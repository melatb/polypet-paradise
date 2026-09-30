import { freshState } from './rules'
import type { GameState, PetInstance } from './types'

/**
 * Where a player's save lives. Today it is the browser (localStorage).
 * Phase 2 swaps in a Firebase-backed implementation with the same shape.
 */
export interface GameStorage {
  load(): Promise<GameState | null>
  save(state: GameState): Promise<void>
  /** Writes any batched save right away. */
  flush?(): Promise<void>
}

const KEY = 'polypet-paradise-v2'
const OLD_KEY = 'polypet-paradise-v1'

/** Upgrades a save from the single-file version (v1) of the game. */
export function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Record<string, any>
  if (d.version === 2) {
    // Saves from before per-world levels: credit earlier answers to the world they were played in.
    if (!d.zoneProgress) return { ...(d as GameState), zoneProgress: { [d.zoneId ?? 'g6u1-polygons']: d.correct ?? 0 } }
    return d as GameState
  }
  if (!Array.isArray(d.pets) || !d.pets.length) return null
  const base = freshState()
  const pets: PetInstance[] = d.pets.map((p: any): PetInstance => ({
    id: String(p.id), species: String(p.species), stage: p.stage ?? 0, prog: p.prog ?? 0, need: p.need ?? 0,
    look: { paint: 'natural', hat: 'none', neck: 'bib' },
  }))
  return { ...base, zoneId: 'g6u1-polygons', zoneProgress: { 'g6u1-polygons': d.correct ?? 0 }, coins: d.coins ?? base.coins, correct: d.correct ?? 0, streak: d.streak ?? 0, best: d.best ?? 0, pets, activeId: d.active ?? pets[0].id }
}

export const localStorageBackend: GameStorage = {
  async load() {
    try {
      const cur = localStorage.getItem(KEY)
      if (cur) return migrate(JSON.parse(cur))
      const old = localStorage.getItem(OLD_KEY)
      return old ? migrate(JSON.parse(old)) : null
    } catch {
      return null
    }
  },
  async save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage blocked: play continues in memory */ }
  },
}
