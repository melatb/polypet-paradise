import type { HatId, NeckId, PaintId, Rarity, Species, Stage } from './types'

/** Rarity tiers climb through dimensions: 0D dot → 4D tesseract. */
export const RARITY: Record<Rarity, { label: string; dim: string; color: string; bonus: number }> = {
  dot: { label: 'Dot', dim: '0D', color: '#8C9AB5', bonus: 0 },
  line: { label: 'Line', dim: '1D', color: '#3FBF5F', bonus: 2 },
  plane: { label: 'Plane', dim: '2D', color: '#3B8BFF', bonus: 4 },
  solid: { label: 'Solid', dim: '3D', color: '#A64DFF', bonus: 7 },
  tesseract: { label: 'Tesseract', dim: '4D', color: '#FFAA00', bonus: 12 },
}

export const SPECIES: Species[] = [
  { id: 'tripup', name: 'Tri-Pup', rarity: 'dot', shape: 'tri', kind: 'pup', color: '#FFA54C', dark: '#C9711F', body: 'triangle (3 sides)' },
  { id: 'cubbycat', name: 'Cubby Cat', rarity: 'dot', shape: 'square', kind: 'cat', color: '#8FB8FF', dark: '#4F7FD6', body: 'square (4 sides)' },
  { id: 'rhombun', name: 'Rhombo Bun', rarity: 'line', shape: 'rhombus', kind: 'bunny', color: '#FFC2DD', dark: '#E07AA8', body: 'rhombus (4 sides)' },
  { id: 'parafox', name: 'Para-Fox', rarity: 'line', shape: 'para', kind: 'fox', color: '#FF8A4C', dark: '#C44A1A', body: 'parallelogram (4 sides)' },
  { id: 'pentapeng', name: 'Penta Penguin', rarity: 'plane', shape: 5, kind: 'penguin', color: '#56679E', dark: '#2A3560', body: 'pentagon (5 sides)' },
  { id: 'traptur', name: 'Trapezoid Turtle', rarity: 'plane', shape: 'trap', kind: 'turtle', color: '#6CCB6A', dark: '#3B8F3A', body: 'trapezoid (4 sides)' },
  { id: 'hexowl', name: 'Hexa Owl', rarity: 'solid', shape: 6, kind: 'owl', color: '#C49468', dark: '#7A5530', body: 'hexagon (6 sides)' },
  { id: 'heptacorn', name: 'Hepta Unicorn', rarity: 'solid', shape: 7, kind: 'unicorn', color: '#F4F0FF', dark: '#B7A6E6', body: 'heptagon (7 sides)' },
  { id: 'octodragon', name: 'Octo Dragon', rarity: 'tesseract', shape: 8, kind: 'dragon', color: '#7B5CFF', dark: '#4A2FC4', body: 'octagon (8 sides)' },
  { id: 'decaphoenix', name: 'Deca Phoenix', rarity: 'tesseract', shape: 10, kind: 'phoenix', color: '#FF5A3C', dark: '#C22E14', body: 'decagon (10 sides)' },
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
  basic: { name: 'Basic Egg', cost: 60, color: '#BFE8FF', spot: '#FFFFFF', spots: 'tri', odds: { dot: 60, line: 30, plane: 10 } },
  shape: { name: 'Shape Egg', cost: 180, color: '#FF9CCB', spot: '#FFE45C', spots: 'mixed', odds: { dot: 25, line: 35, plane: 25, solid: 13, tesseract: 2 } },
  golden: { name: 'Golden Egg', cost: 450, color: '#FFD23F', spot: '#FFF6C2', spots: 'star', odds: { line: 10, plane: 35, solid: 40, tesseract: 15 } },
}

/* ---------- Wardrobe: each growth stage unlocks a color and an outfit piece ---------- */
export const PAINTS: Record<PaintId, { name: string; stage: Stage }> = {
  pi: { name: 'Pi', stage: 0 },
  golden: { name: 'Golden Ratio', stage: 1 },
  fibonacci: { name: 'Fibonacci', stage: 2 },
  fractal: { name: 'Fractal', stage: 3 },
  mobius: { name: 'Möbius', stage: 4 },
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
  0: { paint: 'pi', neck: 'bib' },
  1: { paint: 'golden', hat: 'cap' },
  2: { paint: 'fibonacci', hat: 'headphones' },
  3: { paint: 'fractal', neck: 'bowtie' },
  4: { paint: 'mobius', hat: 'crown' },
}
