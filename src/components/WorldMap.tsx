import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useGame } from '../game/GameProvider'
import { level } from '../game/rules'
import { GRADE6_UNITS, ZONES } from '../math/units'

export function WorldMap({ onClose }: { onClose: () => void }) {
  const game = useGame()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div className="sheet map" role="dialog" aria-modal="true" aria-labelledby="mapTitle"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
        <div className="sheet-head">
          <div>
            <div className="tt" id="mapTitle">World map</div>
            <div className="ts">Pick where to practice. Your pets and coins come with you, and each world has its own level.</div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {GRADE6_UNITS.map((u) => {
          const zones = ZONES.filter((z) => z.grade === 6 && z.unit === u.unit)
          return (
            <section key={u.unit} className={'map-unit' + (zones.length ? ' open' : '')}>
              <div className="map-unit-head">
                <span className="wn">{u.unit}</span>
                <span className="wt">{u.title}</span>
                {!zones.length && <span className="ws">Coming soon</span>}
              </div>
              {zones.length > 0 && (
                <div className="map-zones">
                  {zones.map((z) => {
                    const here = z.id === game.state.zoneId
                    return (
                      <motion.button key={z.id} className={'map-zone' + (here ? ' here' : '')} whileTap={{ scale: 0.96 }}
                        aria-current={here ? 'true' : undefined}
                        onClick={() => { game.setZone(z.id); onClose() }}>
                        <span className="mz-t">{z.title}</span>
                        <span className="mz-b">{z.blurb}</span>
                        <span className="mz-l">{here ? 'You are here · ' : ''}Level {level(game.state, z.id)}</span>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
