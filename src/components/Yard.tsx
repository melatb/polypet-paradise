import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { NEEDS, NEEDS_PER_STAGE, SPECIES_BY_ID, STAGES, STAGE_SCALE } from '../game/catalog'
import { useGame } from '../game/GameProvider'
import { uid } from '../game/random'
import { PetArt } from '../pets/PetArt'
import { RarityChip } from './CoinIcon'

interface Props {
  onSolve: () => void
  /** Increment to make the pet celebrate (after a need is met). */
  celebrate: number
}

export function Yard({ onSolve, celebrate }: Props) {
  const { pet } = useGame()
  const reduce = useReducedMotion()
  const sp = SPECIES_BY_ID[pet.species]
  const need = NEEDS[pet.need]
  const full = pet.stage >= 4

  const yardRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const [facing, setFacing] = useState(1)
  const [hopping, setHopping] = useState(false)
  const [hearts, setHearts] = useState<{ id: string; x: number; delay: number }[]>([])
  const xRef = useRef(0)

  // Wander around the yard.
  useEffect(() => {
    if (reduce) return
    let t: ReturnType<typeof setTimeout>
    const step = () => {
      const w = yardRef.current?.clientWidth ?? 400
      const range = Math.max(0, w / 2 - 115)
      if (Math.random() < 0.7 && range > 10) {
        const nx = Math.round((Math.random() * 2 - 1) * range)
        if (Math.abs(nx - xRef.current) > 20) setFacing(nx > xRef.current ? 1 : -1)
        xRef.current = nx
        setX(nx)
      }
      t = setTimeout(step, 2600 + Math.random() * 2800)
    }
    t = setTimeout(step, 1500)
    return () => clearTimeout(t)
  }, [reduce])

  const burstHearts = (n: number) => {
    const batch = Array.from({ length: n }, (_, i) => ({ id: uid(), x: (Math.random() - 0.5) * 120, delay: i * 0.1 }))
    setHearts((h) => [...h, ...batch])
    setTimeout(() => setHearts((h) => h.filter((v) => !batch.includes(v))), 1800)
  }
  const hop = () => {
    setHopping(true)
    setTimeout(() => setHopping(false), 900)
  }

  useEffect(() => {
    if (!celebrate) return
    hop()
    burstHearts(7)
  }, [celebrate])

  return (
    <section className="panel yard-card" aria-label="Your yard">
      <div className="yard" ref={yardRef}>
        <div className="cloud" style={{ top: 30, width: 90, left: 0 }} />
        <div className="cloud" style={{ top: 78, width: 64, left: -200, animationDuration: '55s' }} />
        <Scenery />
        <div className="ground" />
        <div className="nametag">
          <span className="nm">{sp.name}</span>
          <RarityChip rarity={sp.rarity} extra={STAGES[pet.stage]} />
        </div>

        <motion.div className="pet-walker" animate={{ x }} transition={{ duration: reduce ? 0 : 2.2, ease: 'easeInOut' }}>
          <AnimatePresence mode="popLayout">
            <motion.button key={pet.need + pet.id} className="need" onClick={onSolve} aria-label={`${sp.name} ${need.title} Solve a problem to help.`}
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.3 }}>
              <span className="e">{need.emoji}</span><span className="t">{need.short}</span>
            </motion.button>
          </AnimatePresence>
          <motion.div className="pet-flip" animate={{ scaleX: facing }} transition={{ duration: 0.25 }}>
            <motion.div className="pet-hop" style={{ scale: STAGE_SCALE[pet.stage] }}
              animate={hopping ? { y: [0, -46, 0, -22, 0], scaleY: [1, 1.08, 0.88, 1.04, 1] } : { y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              onClick={() => { hop(); burstHearts(3) }}>
              <motion.div key={pet.id + pet.stage} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="pet-breathe">
                <PetArt species={sp} stage={pet.stage} look={pet.look} animated />
              </motion.div>
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.span key={h.id} className="heart" initial={{ opacity: 1, y: 0, x: h.x, scale: 0.6 }}
                animate={{ opacity: 0, y: -140, scale: 1.2 }} transition={{ duration: 1.4, delay: h.delay, ease: 'easeOut' }}>♥</motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="yard-foot">
        <div className="grow">
          <span>{full ? 'Full Grown!' : `Growing: ${STAGES[pet.stage]}`}</span>
          {!full && <span className="pips">{Array.from({ length: NEEDS_PER_STAGE }, (_, i) => (
            <motion.i key={i} animate={{ backgroundColor: i < pet.prog ? '#4FD6A5' : '#CFE3F3' }} />
          ))}</span>}
          <span>{full ? 'Needs still earn coins' : `→ ${STAGES[pet.stage + 1]}, unlocks a new look`}</span>
        </div>
        <motion.button className="btn big" onClick={onSolve} whileTap={{ scale: 0.97 }}>
          {need.emoji}&nbsp; Solve to help {sp.name}
        </motion.button>
      </div>
    </section>
  )
}

function Scenery() {
  return (
    <svg className="scenery" viewBox="0 0 600 330" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <polygon className="sun" points="520,26 538,33 545,51 538,69 520,76 502,69 495,51 502,33" fill="#FFE066" stroke="#1E2A4A" strokeWidth="3" />
      <g transform="translate(22,150)">
        <rect x="0" y="60" width="120" height="84" fill="#FF9CCB" stroke="#1E2A4A" strokeWidth="3" />
        <polygon points="-10,62 60,6 130,62" fill="#FF5FA8" stroke="#1E2A4A" strokeWidth="3" strokeLinejoin="round" />
        <rect x="48" y="96" width="26" height="48" fill="#FFD23F" stroke="#1E2A4A" strokeWidth="3" />
        <rect x="12" y="78" width="24" height="22" fill="#D4F4FF" stroke="#1E2A4A" strokeWidth="3" />
        <rect x="86" y="78" width="24" height="22" fill="#D4F4FF" stroke="#1E2A4A" strokeWidth="3" />
      </g>
      <g transform="translate(500,160)" className="tree">
        <rect x="-8" y="50" width="16" height="50" fill="#B98A5E" stroke="#1E2A4A" strokeWidth="3" />
        <polygon points="0,-6 42,18 42,60 0,84 -42,60 -42,18" fill="#4FBF5A" stroke="#1E2A4A" strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
