import type { ReactNode } from 'react'

export type Pt = [number, number]

/* ---------- Diagrams on a coordinate grid (math coords, y points up) ---------- */
export interface FigPoly { pts: Pt[]; fill?: string; stroke?: string; dash?: boolean; sw?: number }
export interface FigSeg { a: Pt; b: Pt; color?: string; solid?: boolean }
export interface FigMark { p: Pt; dx: Pt; dy: Pt; color?: string }
export interface FigLabel { x: number; y: number; t: string | number; color?: string; anchor?: 'start' | 'middle' | 'end'; small?: boolean }
export interface FigureSpec {
  x0: number; x1: number; y0: number; y1: number
  grid?: boolean
  polys?: FigPoly[]
  segs?: FigSeg[]
  marks?: FigMark[]
  labels?: FigLabel[]
  /** Points drawn on top of everything else (graphs). */
  dots?: { x: number; y: number; color?: string }[]
  alt: string
}

/* ---------- Small stand-alone shapes used as picture answer choices ---------- */
export type MiniShape =
  | { kind: 'polygon'; pts: Pt[] }
  | { kind: 'curve' | 'open' | 'bowtie' | 'circle' }

export interface Choice {
  label?: string
  shape?: MiniShape
  ok: boolean
  /** Shown when this wrong choice is picked. */
  why?: string
}

/** A two-column table of equivalent ratios. `ask` marks the cell with the missing value. */
export interface RatioTableSpec {
  cols: [string, string]
  rows: (string | number)[][]
  highlight?: number
}

export interface Question {
  /** Short badge, e.g. "Right triangle". */
  name: string
  prompt: string
  /** Numeric answer (typed). Omit when `choices` is used. */
  answer?: number
  unit?: string
  choices?: Choice[]
  /** Diagram; `help` = true draws the hint overlay (heights, cut lines). */
  figure?: (help: boolean) => FigureSpec
  /** A table shown under the prompt (ratio tables, conversion tables). */
  table?: RatioTableSpec
  hint: string
  solution: string
  /** The answer may be negative: show the full keyboard (phone number pads have no minus key). */
  allowNegative?: boolean
  /** Small note under the answer box, e.g. how to type fractions. */
  inputHint?: string
  /** Extra nudge when the typed answer equals this value (e.g. forgot the ½). */
  commonSlip?: { value: number; message: string }
}

export interface QuestionContext {
  /** Player level, 1+. */
  level: number
}

export interface QuestionType {
  id: string
  name: string
  /** Player level at which this type unlocks. */
  unlockLevel: number
  make: (ctx: QuestionContext) => Question
}

export interface Lesson {
  id: string
  tag: string
  body: () => ReactNode
}

/** A playable zone: one section of a curriculum unit. */
export interface Zone {
  id: string
  grade: number
  unit: number
  unitTitle: string
  title: string
  /** Short name for tight spaces, e.g. "Polygons". */
  short: string
  /** One line shown on the world map. */
  blurb: string
  questionTypes: QuestionType[]
  lessons: Lesson[]
  credit: string
}
