import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { LEVEL_EVERY, zoneCorrect } from '../game/rules'
import { ZONES_BY_ID } from '../math/units'
import { CoinIcon } from './CoinIcon'
import { FamilyPill } from './Account'
import { MusicToggle } from './MusicToggle'

export function Hud({ onMap, onAccount }: { onMap: () => void; onAccount: () => void }) {
  const { state, level } = useGame()
  const zone = ZONES_BY_ID[state.zoneId]
  return (
    <header className="hud">
      <div className="logo">Polypet Paradise<small>Grade 6 math pets</small></div>
      <motion.button className="pill world-pill" onClick={onMap} whileTap={{ scale: 0.95 }} title="Change world">
        <svg className="ico" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <polygon points="3,6 9,3 17,6 23,3 23,20 17,23 9,20 3,23" fill="#9FE0FF" stroke="#1E2A4A" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 3V20M17 6V23" stroke="#1E2A4A" strokeWidth="2" /><circle cx="13" cy="12" r="2.5" fill="#FF5FA8" />
        </svg>
        <span className="wp-text"><span className="wp-u">Unit {zone.unit}</span>{zone.short}</span>
      </motion.button>
      <motion.div className="pill" id="coin-target" title="Coins" key={state.coins}
        initial={{ scale: 1 }} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.45, delay: 0.7 }}>
        <CoinIcon /><span>{state.coins}</span>
      </motion.div>
      <div className="pill" title={`Level ${level} in ${zone.short}. Every ${LEVEL_EVERY} correct answers is a new level.`}>
        <span className="pill-k">LVL</span><span>{level}</span>
        <span className="lvl-bar"><motion.i animate={{ width: `${((zoneCorrect(state) % LEVEL_EVERY) / LEVEL_EVERY) * 100}%` }} /></span>
      </div>
      <div className="pill" title="Correct on the first try in a row">
        <span className="pill-k">STREAK</span><span>{state.streak}</span>
      </div>
      <FamilyPill onOpen={onAccount} />
      <MusicToggle />
    </header>
  )
}
