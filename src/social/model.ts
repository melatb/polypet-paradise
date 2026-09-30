/**
 * Pure rules for friends and trading. No Firebase here, so everything is easy to test.
 *
 * How a trade works (no server needed):
 * 1. A kid offers some of their pets for some of a friend's pets. Offered pets are locked.
 * 2. The friend accepts: their side of the swap happens right away on their device.
 * 3. The next time the first kid plays, their side happens too, and the trade is marked done.
 * Each save remembers which trades it has applied, so a trade can never happen twice.
 */
import { HATS, NECKS, NEEDS, NEEDS_PER_STAGE, PAINTS, SPECIES_BY_ID } from '../game/catalog'
import type { GameState, PetInstance, Rarity, Stage } from '../game/types'

export const MAX_PETS_PER_SIDE = 4
export const MAX_OPEN_OFFERS = 5
export const FAMILY_NAME_MAX = 30

export interface TradeSide {
  uid: string
  playerId: string
  /** The kid's first name, shown to the other family. */
  name: string
  /** The kid's avatar species. */
  species: string
  pets: PetInstance[]
}
export type TradeStatus = 'offered' | 'accepted' | 'declined' | 'cancelled' | 'done'
export interface Trade {
  id: string
  members: [string, string]
  from: TradeSide
  to: TradeSide
  status: TradeStatus
}

export interface Friendship {
  id: string
  members: [string, string]
  requestedBy: string
  status: 'pending' | 'accepted'
  names: Record<string, string>
}

export interface ShowcasePlayer { id: string; name: string; species: string; pets: PetInstance[] }
export interface Showcase { uid: string; familyName: string; players: ShowcasePlayer[] }

/** The same id for a pair of families, whichever one asks. Matches pairId() in firestore.rules. */
export const pairId = (a: string, b: string) => (a < b ? `${a}_${b}` : `${b}_${a}`)
export const otherMember = (members: readonly string[], me: string) => (members[0] === me ? members[1] : members[0])

/* ---------- friend codes ---------- */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O, 1/I/L
export function makeFriendCode(rand: () => number = Math.random): string {
  let s = ''
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)]
  return s
}
/** "abcd efgh", "ABCD-EFGH" → "ABCDEFGH"; null if it can't be a code. */
export function normalizeCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[\s-]/g, '')
  return /^[A-HJKMNP-Z2-9]{8}$/.test(s) ? s : null
}
export const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`

/* ---------- fairness ---------- */
/** Corners of each dimension's cube: a dot has 1, a line 2, a square 4, a cube 8, a tesseract 16. */
export const RARITY_POINTS: Record<Rarity, number> = { dot: 1, line: 2, plane: 4, solid: 8, tesseract: 16 }

/** Trade points: rarity corners × (stage + 1). A full-grown pet is worth 5 times a baby. */
export function petPoints(p: Pick<PetInstance, 'species' | 'stage'>): number {
  const sp = SPECIES_BY_ID[p.species]
  return sp ? RARITY_POINTS[sp.rarity] * (p.stage + 1) : 0
}
export const sidePoints = (pets: readonly Pick<PetInstance, 'species' | 'stage'>[]) => pets.reduce((a, p) => a + petPoints(p), 0)

export type Fairness = 'fair' | 'good' | 'great' | 'bad' | 'awful'
/**
 * How a trade looks to the kid who gives `give` and gets `get`.
 * `tilt` runs from -1 (terrible for you) to 1 (amazing for you), for the meter.
 */
export function fairness(give: number, get: number): { verdict: Fairness; tilt: number } {
  if (give <= 0 && get <= 0) return { verdict: 'fair', tilt: 0 }
  if (give <= 0) return { verdict: 'great', tilt: 1 }
  if (get <= 0) return { verdict: 'awful', tilt: -1 }
  const r = get / give
  const tilt = Math.max(-1, Math.min(1, Math.log2(r) / 2))
  const verdict: Fairness = r >= 2 ? 'great' : r > 1.25 ? 'good' : r >= 0.8 ? 'fair' : r > 0.5 ? 'bad' : 'awful'
  return { verdict, tilt }
}
export const FAIRNESS_LABEL: Record<Fairness, string> = {
  great: 'Way more for you', good: 'A bit more for you', fair: 'Fair trade', bad: 'A bit more for them', awful: 'Way more for them',
}

/* ---------- safety ---------- */
const clampInt = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : dflt
  return Math.max(lo, Math.min(hi, n))
}
/** Cleans a pet that came from another family, so a bad document can't break the game. Null if it isn't a real pet. */
export function sanitizePet(raw: unknown): PetInstance | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, any>
  if (typeof p.species !== 'string' || !SPECIES_BY_ID[p.species]) return null
  const stage = clampInt(p.stage, 0, 4, 0) as Stage
  const look = (p.look ?? {}) as Record<string, unknown>
  const okLook = <T extends string>(v: unknown, table: Record<T, { stage: Stage }>, dflt: T): T =>
    typeof v === 'string' && v in table && table[v as T].stage <= stage ? (v as T) : dflt
  return {
    id: typeof p.id === 'string' ? p.id.slice(0, 40) : '',
    species: p.species,
    stage,
    prog: stage === 4 ? 0 : clampInt(p.prog, 0, NEEDS_PER_STAGE - 1, 0),
    need: clampInt(p.need, 0, NEEDS.length - 1, 0),
    look: { paint: okLook(look.paint, PAINTS, 'natural'), hat: okLook(look.hat, HATS, 'none'), neck: okLook(look.neck, NECKS, 'none') },
  }
}
export const sanitizePets = (raw: unknown): PetInstance[] =>
  Array.isArray(raw) ? raw.map(sanitizePet).filter((p): p is PetInstance => p !== null) : []

/* ---------- applying a trade to one player's save ---------- */
export const hasApplied = (s: GameState, tradeId: string) => (s.appliedTrades ?? []).includes(tradeId)

/**
 * Gives away the pets with ids in `give` and adds the `receive` pets.
 * Does nothing if this save already applied the trade. Received pets get new ids made from the trade id.
 */
export function applyTrade(s: GameState, tradeId: string, give: readonly string[], receive: readonly unknown[]): GameState {
  if (hasApplied(s, tradeId)) return s
  const incoming = sanitizePets(receive as unknown[]).map((p, i) => ({ ...p, id: `t${tradeId}-${i}` }))
  const out = new Set(give)
  let pets = [...s.pets.filter((p) => !out.has(p.id)), ...incoming]
  if (!pets.length) pets = s.pets // never leave a player with no pets
  const activeId = pets.some((p) => p.id === s.activeId) ? s.activeId : (incoming[0]?.id ?? pets[0].id)
  return { ...s, pets, activeId, appliedTrades: [...(s.appliedTrades ?? []), tradeId].slice(-100) }
}

/**
 * Checks an offer before it is sent. `locked` holds pets already in other open offers.
 * Returns a sentence for the kid, or null when the offer is fine.
 */
export function offerProblem(s: GameState, give: readonly string[], get: readonly string[], locked: ReadonlySet<string>): string | null {
  if (!get.length) return 'Pick at least one pet you would like.'
  if (!give.length) return 'Pick at least one of your pets to offer.'
  if (give.length > MAX_PETS_PER_SIDE || get.length > MAX_PETS_PER_SIDE) return `You can trade up to ${MAX_PETS_PER_SIDE} pets each way.`
  if (give.some((id) => !s.pets.some((p) => p.id === id))) return 'One of those pets isn’t yours any more.'
  if (give.some((id) => locked.has(id))) return 'One of those pets is already in another offer.'
  const left = s.pets.filter((p) => !give.includes(p.id) && !locked.has(p.id))
  if (!left.length) return 'Keep at least one pet at home while you wait.'
  return null
}
