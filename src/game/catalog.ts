import type { HatId, NeckId, PaintId, Rarity, Species, Stage } from './types'

export const RARITY: Record<Rarity, { label: string; color: string; bonus: number }> = {
  common: { label: 'Common', color: '#8C9AB5', bonus: 0 },
  uncommon: { label: 'Uncommon', color: '#3FBF5F', bonus: 2 },
  rare: { label: 'Rare', color: '#3B8BFF', bonus: 4 },
  ultra: { label: 'Ultra-Rare', color: '#A64DFF', bonus: 7 },
  legendary: { label: 'Legendary', color: '#FFAA00', bonus: 12 },
}

export const SPECIES: Species[] = [
  { id: 'tripup', name: 'Tri-Pup', rarity: 'common', shape: 'tri', kind: 'pup', color: '#FFA54C', dark: '#C9711F', body: 'triangle (3 sides)' },
  { id: 'cubbycat', name: 'Cubby Cat', rarity: 'common', shape: 'square', kind: 'cat', color: '#8FB8FF', dark: '#4F7FD6', body: 'square (4 sides)' },
  { id: 'rhombun', name: 'Rhombo Bun', rarity: 'uncommon', shape: 'rhombus', kind: 'bunny', color: '#FFC2DD', dark: '#E07AA8', body: 'rhombus (4 sides)' },
  { id: 'parafox', name: 'Para-Fox', rarity: 'uncommon', shape: 'para', kind: 'fox', color: '#FF8A4C', dark: '#C44A1A', body: 'parallelogram (4 sides)' },
  { id: 'pentapeng', name: 'Penta Penguin', rarity: 'rare', shape: 5, kind: 'penguin', color: '#56679E', dark: '#2A3560', body: 'pentagon (5 sides)' },
  { id: 'traptur', name: 'Trapezoid Turtle', rarity: 'rare', shape: 'trap', kind: 'turtle', color: '#6CCB6A', dark: '#3B8F3A', body: 'trapezoid (4 sides)' },
  { id: 'hexowl', name: 'Hexa Owl', rarity: 'ultra', shape: 6, kind: 'owl', color: '#C49468', dark: '#7A5530', body: 'hexagon (6 sides)' },
  { id: 'heptacorn', name: 'Hepta Unicorn', rarity: 'ultra', shape: 7, kind: 'unicorn', color: '#F4F0FF', dark: '#B7A6E6', body: 'heptagon (7 sides)' },
  { id: 'octodragon', name: 'Octo Dragon', rarity: 'legendary', shape: 8, kind: 'dragon', color: '#7B5CFF', dark: '#4A2FC4', body: 'octagon (8 sides)' },
  { id: 'decaphoenix', name: 'Deca Phoenix', rarity: 'legendary', shape: 10, kind: 'phoenix', color: '#FF5A3C', dark: '#C22E14', body: 'decagon (10 sides)' },
]
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]))

export const STAGES = ['Baby', 'Kid', 'Teen', 'Young Adult', 'Full Grown'] as const
export const NEEDS_PER_STAGE = 3
export const STAGE_SCALE = [0.72, 0.8, 0.88, 0.95, 1] as const

export const NEEDS = [
  { emoji: '🍕', short: 'Hungry', title: 'is hungry!', act: 'Give a snack' },
  { emoji: '🧃', short: 'Thirsty', title: 'is thirsty!', act: 'Give a drink' },
  { emoji: '💤', short: 'Sleepy', title: 'is sleepy!', act: 'Tuck in for a nap' },
  { emoji: '🫧', short: 'Dirty', title: 'needs a bath!', act: 'Give a bath' },
  { emoji: '⚽', short: 'Bored', title: 'wants to play!', act: 'Play catch' },
  { emoji: '🌳', short: 'Walk', title: 'wants a walk!', act: 'Go for a walk' },
] as const

export type EggId = 'basic' | 'shape' | 'golden'
export const EGGS: Record<EggId, { name: string; cost: number; color: string; spot: string; spots: 'tri' | 'mixed' | 'star'; odds: Partial<Record<Rarity, number>> }> = {
  basic: { name: 'Basic Egg', cost: 60, color: '#BFE8FF', spot: '#FFFFFF', spots: 'tri', odds: { common: 60, uncommon: 30, rare: 10 } },
  shape: { name: 'Shape Egg', cost: 180, color: '#FF9CCB', spot: '#FFE45C', spots: 'mixed', odds: { common: 25, uncommon: 35, rare: 25, ultra: 13, legendary: 2 } },
  golden: { name: 'Golden Egg', cost: 450, color: '#FFD23F', spot: '#FFF6C2', spots: 'star', odds: { uncommon: 10, rare: 35, ultra: 40, legendary: 15 } },
}

/* ---------- Wardrobe: each growth stage unlocks a color and an outfit piece ---------- */
export const PAINTS: Record<PaintId, { name: string; stage: Stage }> = {
  natural: { name: 'Natural', stage: 0 },
  pastel: { name: 'Cotton Candy', stage: 1 },
  ocean: { name: 'Ocean', stage: 2 },
  sunset: { name: 'Sunset', stage: 3 },
  neon: { name: 'Neon', stage: 4 },
}
export const HATS: Record<HatId, { name: string; stage: Stage }> = {
  none: { name: 'No hat', stage: 0 },
  cap: { name: 'Ball cap', stage: 1 },
  headphones: { name: 'Headphones', stage: 2 },
  crown: { name: 'Crown', stage: 4 },
}
export const NECKS: Record<NeckId, { name: string; stage: Stage }> = {
  none: { name: 'Nothing', stage: 0 },
  bib: { name: 'Baby bib', stage: 0 },
  bowtie: { name: 'Bow tie', stage: 3 },
}

/** What a pet unlocks (and auto-equips) on reaching a stage. */
export const STAGE_UNLOCKS: Record<Stage, { paint: PaintId; hat?: HatId; neck?: NeckId }> = {
  0: { paint: 'natural', neck: 'bib' },
  1: { paint: 'pastel', hat: 'cap' },
  2: { paint: 'ocean', hat: 'headphones' },
  3: { paint: 'sunset', neck: 'bowtie' },
  4: { paint: 'neon', hat: 'crown' },
}
