import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { EGGS, RARITY, SPECIES_BY_ID, type EggId } from '../game/catalog'
import type { PetInstance } from '../game/types'
import { useFx } from '../fx/Fx'
import { EggShape, PetArt } from '../pets/PetArt'
import { RarityChip } from './CoinIcon'

interface Props {
  egg: EggId
  pet: PetInstance
  isNew: boolean
  onDone: (makeActive: boolean) => void
}

type Phase = 'wobble' | 'crack' | 'burst' | 'reveal'

// Zig-zag crack across the egg at y≈112.
const ZIG: [number, number][] = [[20, 112], [42, 100], [60, 120], [80, 98], [100, 122], [120, 100], [140, 120], [160, 100], [180, 114]]
const TOP_CLIP = [[0, -20], [220, -20], ...[...ZIG].reverse()].map((p) => p.join(',')).join(' ')
const BOTTOM_CLIP = [...ZIG, [220, 240], [-20, 240]].map((p) => p.join(',')).join(' ')

export function HatchModal({ egg, pet, isNew, onDone }: Props) {
  const reduce = useReducedMotion()
  const fx = useFx()
  const sp = SPECIES_BY_ID[pet.species]
  const rar = RARITY[sp.rarity]
  const [phase, setPhase] = useState<Phase>(reduce ? 'reveal' : 'wobble')

  useEffect(() => {
    if (reduce) return
    const t1 = setTimeout(() => setPhase('crack'), 1700)
    const t2 = setTimeout(() => setPhase('burst'), 2300)
    const t3 = setTimeout(() => { setPhase('reveal'); fx.confetti() }, 2750)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [reduce, fx])

  const skip = () => { if (phase !== 'reveal') setPhase('reveal') }

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="hatch" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={skip}>
        {phase === 'reveal' && (
          <motion.div className="rays" initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 0.4, rotate: 360 }}
            transition={{ opacity: { duration: 0.4 }, rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
            style={{ background: `repeating-conic-gradient(from 0deg, ${rar.color} 0 10deg, transparent 10deg 24deg)` }} />
        )}
        <div className="big rel">{phase === 'reveal' ? (isNew ? 'New pet!' : 'You hatched') : 'Hatching…'}</div>
        <div className="art rel">
          {phase !== 'reveal' ? (
            <motion.svg viewBox="0 -20 200 240" style={{ overflow: 'visible' }}
              animate={phase === 'wobble' ? { rotate: [0, -6, 6, -10, 10, -14, 14, -8, 0] } : phase === 'crack' ? { rotate: [0, -3, 3, -3, 3, 0] } : {}}
              transition={phase === 'wobble' ? { duration: 1.7, ease: 'easeInOut' } : { duration: 0.5, repeat: Infinity }}>
              <defs>
                <clipPath id="egg-top"><polygon points={TOP_CLIP} /></clipPath>
                <clipPath id="egg-bottom"><polygon points={BOTTOM_CLIP} /></clipPath>
              </defs>
              <motion.g clipPath="url(#egg-top)"
                animate={phase === 'burst' ? { x: -40, y: -90, rotate: -40, opacity: 0 } : {}} transition={{ duration: 0.45, ease: 'easeOut' }}>
                <EggShape egg={egg} />
              </motion.g>
              <motion.g clipPath="url(#egg-bottom)"
                animate={phase === 'burst' ? { y: 60, rotate: 12, opacity: 0 } : {}} transition={{ duration: 0.45, ease: 'easeIn' }}>
                <EggShape egg={egg} />
              </motion.g>
              {(phase === 'crack' || phase === 'burst') && (
                <motion.polyline points={ZIG.map((p) => p.join(',')).join(' ')} fill="none" stroke="#1E2A4A" strokeWidth={4} strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: phase === 'burst' ? 0 : 1 }} transition={{ duration: 0.45 }} />
              )}
              {phase === 'burst' && (
                <motion.circle cx={100} cy={112} r={40} fill="#fff" initial={{ scale: 0, opacity: 1 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.45 }} />
              )}
            </motion.svg>
          ) : (
            <motion.div initial={{ scale: 0.1, y: 40, rotate: -15 }} animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 11 }} style={{ width: '100%', height: '100%' }}>
              <PetArt species={sp} stage={0} look={pet.look} animated />
            </motion.div>
          )}
        </div>
        {phase === 'reveal' ? (
          <motion.div className="rel reveal-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="big">{sp.name}</div>
            <RarityChip rarity={sp.rarity} />
            <p className="sub">Its body is a {sp.body}.</p>
            <div className="sheet-actions center">
              <button className="btn green" onClick={() => onDone(true)}>Take to yard</button>
              <button className="btn white" onClick={() => onDone(false)}>Keep exploring</button>
            </div>
          </motion.div>
        ) : (
          <div className="sub rel">{EGGS[egg].name} · tap to skip</div>
        )}
      </motion.div>
    </motion.div>
  )
}
