import type { Rarity } from '../game/types'

/**
 * One small picture per rarity tier, climbing through dimensions:
 * a dot (0D), a segment (1D), a square (2D), a cube (3D), a tesseract (4D).
 * Drawn in `currentColor` so it matches whatever text it sits beside.
 */
export function RarityIcon({ rarity, size = 14 }: { rarity: Rarity; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  let body
  switch (rarity) {
    case 'dot':
      body = <circle cx={8} cy={8} r={3.2} fill="currentColor" />
      break
    case 'line':
      body = <>
        <line x1={2.5} y1={12.5} x2={13.5} y2={3.5} {...common} />
        <circle cx={2.5} cy={12.5} r={1.8} fill="currentColor" /><circle cx={13.5} cy={3.5} r={1.8} fill="currentColor" />
      </>
      break
    case 'plane':
      body = <rect x={2.5} y={2.5} width={11} height={11} {...common} fill="currentColor" fillOpacity={0.35} />
      break
    case 'solid':
      body = <g {...common}>
        <path d="M5.5 1.5h9v9h-9z" strokeOpacity={0.6} />
        <path d="M1.5 5.5h9v9h-9z" fill="currentColor" fillOpacity={0.3} />
        <path d="M1.5 5.5l4-4M10.5 5.5l4-4M10.5 14.5l4-4" />
      </g>
      break
    case 'tesseract':
      body = <g {...common}>
        <rect x={1.3} y={1.3} width={13.4} height={13.4} />
        <rect x={5.2} y={5.2} width={5.6} height={5.6} fill="currentColor" fillOpacity={0.35} />
        <path d="M1.3 1.3l3.9 3.9M14.7 1.3l-3.9 3.9M14.7 14.7l-3.9-3.9M1.3 14.7l3.9-3.9" />
      </g>
      break
  }
  return <svg className="rar-ico" width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">{body}</svg>
}
