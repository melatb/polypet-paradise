/**
 * Pure game rules. No React, no storage: every function takes a state and returns a new one.
 * This keeps the logic easy to test and lets a server (e.g. Firebase Cloud Functions) reuse it later.
 */
import { ZONES_BY_ID } from '../math/units'
import type { Question } from '../math/types'
import { EGGS, NEEDS, NEEDS_PER_STAGE, RARITY, SPECIES, SPECIES_BY_ID, STAGE_UNLOCKS, type EggId } from './catalog'
import { pick, randInt, uid } from './random'
import type { GameState, PetInstance, Rarity, Stage } from './types'

export const LEVEL_EVERY = 5
export const level = (s: GameState) => 1 + Math.floor(s.correct / LEVEL_EVERY)
export const activePet = (s: GameState) => s.pets.find((p) => p.id === s.activeId) ?? s.pets[0]

export function newPet(species: string): PetInstance {
  return { id: uid(), species, stage: 0, prog: 0, need: randInt(0, NEEDS.length - 1), look: { paint: 'natural', hat: 'none', neck: 'bib' } }
}

export function freshState(): GameState {
  const starter = newPet('tripup')
  starter.need = 0
  return { version: 2, coins: 45, correct: 0, streak: 0, best: 0, pets: [starter], activeId: starter.id, lessons: {}, zoneId: 'g6u1-polygons' }
}

/* ---------- questions ---------- */
export function nextQuestion(s: GameState): { state: GameState; question: Question } {
  const zone = ZONES_BY_ID[s.zoneId] ?? Object.values(ZONES_BY_ID)[0]
  const lvl = level(s)
  const top = Math.min(lvl, Math.max(...zone.questionTypes.map((t) => t.unlockLevel)))
  const pool = zone.questionTypes.filter((t) => t.unlockLevel <= lvl && t.id !== s.lastQuestionType)
  const weights = pool.map((t) => (t.unlockLevel === top ? 2.5 : 1))
  let r = Math.random() * weights.reduce((a, b) => a + b, 0)
  let i = 0
  while (r > weights[i]) { r -= weights[i]; i++ }
  const type = pool[Math.min(i, pool.length - 1)]
  return { state: { ...s, lastQuestionType: type.id }, question: type.make({ level: lvl }) }
}

/** Names of question types that unlock exactly at `lvl` in the current zone. */
export function unlocksAtLevel(s: GameState, lvl: number): string[] {
  const zone = ZONES_BY_ID[s.zoneId]
  return zone ? zone.questionTypes.filter((t) => t.unlockLevel === lvl).map((t) => t.name) : []
}

/* ---------- answering a pet's need ---------- */
export interface AnswerInput {
  correct: boolean
  /** Correct on the very first try. */
  firstTry: boolean
  /** A hint was opened before answering. */
  usedHint: boolean
}
export interface AnswerResult {
  coins: number
  grewTo?: Stage
  leveledUpTo?: number
}

function feed(p: PetInstance): { pet: PetInstance; grewTo?: Stage } {
  let { stage, prog, look } = p
  let grewTo: Stage | undefined
  if (stage < 4) {
    prog++
    if (prog >= NEEDS_PER_STAGE) {
      stage = (stage + 1) as Stage
      prog = 0
      grewTo = stage
      const u = STAGE_UNLOCKS[stage]
      look = { paint: u.paint, hat: u.hat ?? look.hat, neck: u.neck ?? look.neck }
    }
  }
  let need = p.need
  while (need === p.need) need = randInt(0, NEEDS.length - 1)
  return { pet: { ...p, stage, prog, look, need }, grewTo }
}

export function applyAnswer(s: GameState, a: AnswerInput): { state: GameState; result: AnswerResult } {
  const pet = activePet(s)
  const bonus = RARITY[SPECIES_BY_ID[pet.species].rarity].bonus
  const lvl = level(s)
  let coins: number, correct = s.correct, streak = s.streak
  if (a.correct) {
    const clean = a.firstTry && !a.usedHint
    coins = clean ? 10 + 2 * lvl + bonus + Math.min(s.streak, 5) * 2 : 5 + bonus
    correct++
    streak = a.firstTry ? streak + 1 : 0
  } else {
    coins = 2
    streak = 0
  }
  const { pet: fed, grewTo } = feed(pet)
  const next: GameState = {
    ...s, coins: s.coins + coins, correct, streak, best: Math.max(s.best, streak),
    pets: s.pets.map((p) => (p.id === pet.id ? fed : p)),
  }
  const newLvl = level(next)
  return { state: next, result: { coins, grewTo, leveledUpTo: newLvl > lvl ? newLvl : undefined } }
}

/* ---------- eggs ---------- */
export function hatchEgg(s: GameState, egg: EggId): { state: GameState; pet: PetInstance; isNew: boolean } | null {
  const E = EGGS[egg]
  if (s.coins < E.cost) return null
  let r = Math.random() * 100
  let rarity: Rarity | undefined
  for (const [k, v] of Object.entries(E.odds) as [Rarity, number][]) {
    if (r < v) { rarity = k; break }
    r -= v
  }
  rarity ??= Object.keys(E.odds)[0] as Rarity
  const species = pick(SPECIES.filter((sp) => sp.rarity === rarity))
  const isNew = !s.pets.some((p) => p.species === species.id)
  const pet = newPet(species.id)
  return { state: { ...s, coins: s.coins - E.cost, pets: [...s.pets, pet] }, pet, isNew }
}

export const LESSON_REWARD = 20
export function claimLesson(s: GameState, id: string): GameState {
  if (s.lessons[id]) return s
  return { ...s, coins: s.coins + LESSON_REWARD, lessons: { ...s.lessons, [id]: true } }
}

export function updatePet(s: GameState, id: string, change: Partial<PetInstance>): GameState {
  return { ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, ...change } : p)) }
}

/** Accepts "7.5", "7 1/2", "15/2", "7½", "12 sq units". Returns NaN if unreadable. */
export function parseAnswer(raw: string): number {
  const s = raw.trim().replace(/½/g, ' 1/2').replace(/,/g, '.').replace(/[a-z²].*$/i, '').replace(/\s+/g, ' ').trim()
  let m = s.match(/^(\d+) (\d+)\/(\d+)$/)
  if (m) return +m[1] + +m[2] / +m[3]
  m = s.match(/^(\d*\.?\d+)\/(\d*\.?\d+)$/)
  if (m) return +m[1] / +m[2]
  return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN
}
