import { motion } from 'framer-motion'
import { useGame } from '../game/GameProvider'
import { LEVEL_EVERY } from '../game/rules'
import { CoinIcon } from './CoinIcon'

export function Hud() {
  const { state, level } = useGame()
  return (
    <header className="hud">
      <div className="logo">Polypet Paradise<small>Grade 6 · Area of triangles &amp; polygons</small></div>
      <motion.div className="pill" id="coin-target" title="Coins" key={state.coins}
        initial={{ scale: 1 }} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 0.45, delay: 0.7 }}>
        <CoinIcon /><span>{state.coins}</span>
      </motion.div>
      <div className="pill" title={`Level ${level}. Every ${LEVEL_EVERY} correct answers is a new level.`}>
        <span className="pill-k">LVL</span><span>{level}</span>
        <span className="lvl-bar"><motion.i animate={{ width: `${((state.correct % LEVEL_EVERY) / LEVEL_EVERY) * 100}%` }} /></span>
      </div>
      <div className="pill" title="Correct on the first try in a row">
        <span className="pill-k">STREAK</span><span>{state.streak}</span>
      </div>
    </header>
  )
}
