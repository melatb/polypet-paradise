/** Rarity tiers climb through dimensions, 0D to 4D. */
export type Rarity = 'dot' | 'line' | 'plane' | 'solid' | 'tesseract'
export type Stage = 0 | 1 | 2 | 3 | 4
export type BodyShape = 'tri' | 'square' | 'rhombus' | 'para' | 'trap' | 5 | 6 | 7 | 8 | 10
export type PetKind =
  | 'pup' | 'cat' | 'bunny' | 'fox' | 'penguin'
  | 'turtle' | 'owl' | 'unicorn' | 'dragon' | 'phoenix'

export interface Species {
  id: string
  name: string
  rarity: Rarity
  shape: BodyShape
  kind: PetKind
  color: string
  dark: string
  /** Plain-language description of the body polygon, shown to players. */
  body: string
}

export type PaintId = 'natural' | 'pastel' | 'ocean' | 'sunset' | 'galactic'
export type HatId = 'none' | 'cap' | 'headphones' | 'crown'
export type NeckId = 'none' | 'bib' | 'bowtie'

export interface Look {
  paint: PaintId
  hat: HatId
  neck: NeckId
}

export interface PetInstance {
  id: string
  species: string
  stage: Stage
  /** Needs met toward the next stage (0..NEEDS_PER_STAGE-1). */
  prog: number
  /** Index into NEEDS. */
  need: number
  look: Look
}

export interface GameState {
  version: 2
  coins: number
  /** Total correct answers; drives player level. */
  correct: number
  streak: number
  best: number
  pets: PetInstance[]
  activeId: string
  /** Lesson ids whose coin reward has been collected. */
  lessons: Record<string, boolean>
  lastQuestionType?: string
  /** Current unit/section zone, e.g. "g6u1-polygons". */
  zoneId: string
}
