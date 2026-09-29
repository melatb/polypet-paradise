import type { ReactNode } from 'react'
import type { PaintId, Species } from '../game/types'

/**
 * Wardrobe colors, each drawn to look like the math idea it's named after.
 * Every paint returns SVG <defs> plus the fill to use for the pet's body.
 * Patterns use the pet drawing's own 0–200 coordinate space.
 */
export interface Paint {
  fill: string
  dark: string
  defs: ReactNode
}

const RAINBOW = ['#FF5A5A', '#FFB020', '#FFE45C', '#4FD6A5', '#3B8BFF', '#A64DFF']

/** Pi never ends, so its color never stops cycling. */
function pi(sp: Species, id: string): Paint {
  const cycle = [sp.color, ...RAINBOW, sp.color].join(';')
  return {
    fill: `url(#${id})`,
    dark: sp.dark,
    defs: (
      <linearGradient id={id} x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0" stopColor={sp.color}><animate attributeName="stop-color" values={cycle} dur="9s" repeatCount="indefinite" /></stop>
        <stop offset="1" stopColor={sp.color}><animate attributeName="stop-color" values={cycle} dur="9s" begin="-2.5s" repeatCount="indefinite" /></stop>
      </linearGradient>
    ),
  }
}

/** Golden rectangles nested inside each other, with the golden spiral. */
function golden(id: string): Paint {
  return {
    fill: `url(#${id})`,
    dark: '#B8860B',
    defs: (
      <pattern id={id} patternUnits="userSpaceOnUse" width="89" height="55" x="10" y="30">
        <rect width="89" height="55" fill="#FFD23F" />
        <g fill="none" stroke="#C99700" strokeWidth="2">
          <path d="M55 0V55M55 34H89M68 34V55M55 42H68M63 34V42" />
          <path d="M0 55A55 55 0 0 1 55 0A34 34 0 0 1 89 34A21 21 0 0 1 68 55A13 13 0 0 1 55 42" stroke="#fff" strokeOpacity=".8" strokeWidth="2.5" />
        </g>
      </pattern>
    ),
  }
}

/** Sunflower seeds: each one turns by the golden angle (137.5°), which makes Fibonacci spirals. */
function fibonacci(id: string): Paint {
  const seeds: ReactNode[] = []
  for (let i = 1; i < 190; i++) {
    const r = 5.4 * Math.sqrt(i)
    if (r > 92) break
    const a = (i * 137.508 * Math.PI) / 180
    seeds.push(<circle key={i} cx={(100 + r * Math.cos(a)).toFixed(1)} cy={(112 + r * Math.sin(a)).toFixed(1)} r={1.4 + r / 45} />)
  }
  return {
    fill: `url(#${id})`,
    dark: '#9A5412',
    defs: (
      <pattern id={id} patternUnits="userSpaceOnUse" width="240" height="260" x="-20" y="-40">
        <rect x="-20" y="-40" width="240" height="260" fill="#FFC93C" />
        <g fill="#9A5412" transform="translate(20 40)">{seeds}</g>
      </pattern>
    ),
  }
}

/** Sierpinski triangle: the same shape repeats inside itself. */
function fractal(id: string): Paint {
  const tris: string[] = []
  const sier = (x: number, y: number, s: number, depth: number) => {
    const h = (s * Math.sqrt(3)) / 2
    if (depth === 0) { tris.push(`M${x} ${y + h}L${x + s} ${y + h}L${x + s / 2} ${y}Z`); return }
    sier(x + s / 4, y, s / 2, depth - 1)
    sier(x, y + h / 2, s / 2, depth - 1)
    sier(x + s / 2, y + h / 2, s / 2, depth - 1)
  }
  sier(0, 0, 56, 3)
  return {
    fill: `url(#${id})`,
    dark: '#6A2FC4',
    defs: (
      <pattern id={id} patternUnits="userSpaceOnUse" width="56" height={(56 * Math.sqrt(3)) / 2} x="16">
        <rect width="56" height="49" fill="#E4D4FF" />
        <path d={tris.join('')} fill="#A64DFF" />
      </pattern>
    ),
  }
}

/** Möbius strip: a band with one twist, so its two sides join into one. */
function mobius(id: string): Paint {
  return {
    fill: `url(#${id})`,
    dark: '#2466C9',
    defs: (
      <pattern id={id} patternUnits="userSpaceOnUse" width="48" height="26" x="4" y="8">
        <rect width="48" height="26" fill="#62C6F5" />
        <path d="M24 13C31 3 44 3 44 13S31 23 24 13" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M24 13C17 23 4 23 4 13S17 3 24 13" fill="none" stroke="#2466C9" strokeWidth="3.5" strokeLinecap="round" />
      </pattern>
    ),
  }
}

export function resolvePaint(sp: Species, paint: PaintId, id: string): Paint {
  switch (paint) {
    case 'golden': return golden(id)
    case 'fibonacci': return fibonacci(id)
    case 'fractal': return fractal(id)
    case 'mobius': return mobius(id)
    default: return pi(sp, id)
  }
}
