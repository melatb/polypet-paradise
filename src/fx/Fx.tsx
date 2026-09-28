import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CoinIcon } from '../components/CoinIcon'
import { uid } from '../game/random'

interface FxApi {
  confetti: () => void
  /** Coins fly from a point on screen into the coin counter. */
  coins: (from: { x: number; y: number }, count: number) => void
  toast: (title: string, sub?: string) => void
}
const Ctx = createContext<FxApi | null>(null)
export const useFx = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFx outside <FxProvider>')
  return v
}

const COLORS = ['#FFD23F', '#FF5FA8', '#4FD6A5', '#3B8BFF', '#A64DFF']
const CLIPS = [
  'polygon(50% 0,100% 100%,0 100%)',
  'polygon(0 0,100% 0,100% 100%,0 100%)',
  'polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)',
  'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)',
]
interface Piece { id: string; left: number; color: string; clip: string; delay: number; dur: number; spin: number }
interface Flyer { id: string; from: { x: number; y: number }; to: { x: number; y: number }; delay: number }
interface Toast { id: string; title: string; sub?: string }

export function FxProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const [pieces, setPieces] = useState<Piece[]>([])
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const confetti = useCallback(() => {
    if (reduce) return
    const batch: Piece[] = Array.from({ length: 36 }, () => ({
      id: uid(), left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], clip: CLIPS[Math.floor(Math.random() * CLIPS.length)],
      delay: Math.random() * 0.35, dur: 1.2 + Math.random() * 0.8, spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
    }))
    setPieces((p) => [...p, ...batch])
    setTimeout(() => setPieces((p) => p.filter((x) => !batch.includes(x))), 2600)
  }, [reduce])

  const coins = useCallback((from: { x: number; y: number }, count: number) => {
    const el = document.getElementById('coin-target')
    if (!el || reduce) return
    const r = el.getBoundingClientRect()
    const to = { x: r.left + 18, y: r.top + r.height / 2 }
    const batch: Flyer[] = Array.from({ length: Math.min(count, 12) }, (_, i) => ({
      id: uid(), from: { x: from.x + (Math.random() - 0.5) * 60, y: from.y + (Math.random() - 0.5) * 30 }, to, delay: i * 0.05,
    }))
    setFlyers((f) => [...f, ...batch])
    setTimeout(() => setFlyers((f) => f.filter((x) => !batch.includes(x))), 1600)
  }, [reduce])

  const toast = useCallback((title: string, sub?: string) => {
    const t = { id: uid(), title, sub }
    setToasts((ts) => [...ts, t])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x !== t)), 3400)
  }, [])

  const api = useMemo(() => ({ confetti, coins, toast }), [confetti, coins, toast])

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fx-layer" aria-hidden="true">
        {pieces.map((p) => (
          <motion.div key={p.id} className="confetti" style={{ left: p.left + 'vw', background: p.color, clipPath: p.clip }}
            initial={{ y: -20, rotate: 0 }} animate={{ y: window.innerHeight + 40, rotate: p.spin }}
            transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }} />
        ))}
        {flyers.map((f) => (
          <motion.div key={f.id} className="coin-flyer"
            initial={{ x: f.from.x - 14, y: f.from.y - 14, scale: 0.6, opacity: 0 }}
            animate={{ x: [f.from.x - 14, (f.from.x + f.to.x) / 2 - 14, f.to.x - 14], y: [f.from.y - 14, Math.min(f.from.y, f.to.y) - 80, f.to.y - 14], scale: [0.6, 1.2, 0.7], opacity: [0, 1, 1] }}
            transition={{ duration: 0.8, delay: f.delay, ease: 'easeInOut' }}>
            <CoinIcon />
          </motion.div>
        ))}
      </div>
      <div className="toast-stack" role="status">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} className="toast" initial={{ y: -40, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              {t.title}{t.sub && <small>{t.sub}</small>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
