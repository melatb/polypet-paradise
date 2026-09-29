import { PAINTS, STAGE_UNLOCKS } from './catalog'
import { freshState } from './rules'
import type { GameState, PetInstance } from './types'

/**
 * Where a player's save lives. Today it is the browser (localStorage).
 * Phase 2 swaps in a Firebase-backed implementation with the same shape.
 */
export interface GameStorage {
  load(): Promise<GameState | null>
  save(state: GameState): Promise<void>
}

const KEY = 'polypet-paradise-v2'
const OLD_KEY = 'polypet-paradise-v1'

/** Upgrades a save from the single-file version (v1) of the game. */
function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Record<string, any>
  if (d.version === 2) {
    // Colors were renamed (Natural/Neon/... became Pi/Golden Ratio/...): give old looks the color for their stage.
    const s = d as GameState
    return { ...s, pets: s.pets.map((p) => (p.look.paint in PAINTS ? p : { ...p, look: { ...p.look, paint: STAGE_UNLOCKS[p.stage].paint } })) }
  }
  if (!Array.isArray(d.pets) || !d.pets.length) return null
  const base = freshState()
  const pets: PetInstance[] = d.pets.map((p: any): PetInstance => ({
    id: String(p.id), species: String(p.species), stage: p.stage ?? 0, prog: p.prog ?? 0, need: p.need ?? 0,
    look: { paint: 'pi', hat: 'none', neck: 'bib' },
  }))
  return { ...base, coins: d.coins ?? base.coins, correct: d.correct ?? 0, streak: d.streak ?? 0, best: d.best ?? 0, pets, activeId: d.active ?? pets[0].id }
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
