import { RARITY } from '../game/catalog'
import type { Rarity } from '../game/types'
import { RarityIcon } from './RarityIcon'

export function CoinIcon({ size = 30 }: { size?: number }) {
  return (
    <svg className="ico" width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="12" fill="#FFC21A" stroke="#1E2A4A" strokeWidth="2.5" />
      <polygon points="15,7 22,19 8,19" fill="#FFE680" stroke="#B37A00" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function RarityChip({ rarity, extra }: { rarity: Rarity; extra?: string }) {
  const r = RARITY[rarity]
  return (
    <span className="chip rar" style={{ background: r.color }} title={`${r.label} (${r.dim})`}>
      <RarityIcon rarity={rarity} />{r.label}{extra ? ` · ${extra}` : ''}
    </span>
  )
}
