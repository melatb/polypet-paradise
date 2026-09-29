import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { music } from '../audio/music'

const KEY = 'polypet-music'
const readPref = () => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } }
const writePref = (on: boolean) => { try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode */ } }

/** Music on/off. Browsers only allow sound after a tap, so music starts on the first tap anywhere. */
export function MusicToggle() {
  const [on, setOn] = useState(readPref)

  useEffect(() => {
    if (!on) return
    const kick = () => { music.start(); cleanup() }
    const cleanup = () => { window.removeEventListener('pointerdown', kick); window.removeEventListener('keydown', kick) }
    window.addEventListener('pointerdown', kick)
    window.addEventListener('keydown', kick)
    return cleanup
  }, [on])

  useEffect(() => {
    const vis = () => (document.hidden ? music.suspend() : music.resume())
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !on
    setOn(next)
    writePref(next)
    if (next) music.start()
    else music.stop()
  }

  return (
    <motion.button className="pill music-pill" onClick={toggle} whileTap={{ scale: 0.92 }}
      aria-pressed={on} aria-label={on ? 'Turn music off' : 'Turn music on'} title={on ? 'Music on' : 'Music off'}>
      <svg className="ico" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M9 18V6l11-2.5V16" fill="none" stroke="#1E2A4A" strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="6.5" cy="18.5" rx="3.3" ry="2.6" fill={on ? '#FF5FA8' : '#C9D3E3'} stroke="#1E2A4A" strokeWidth="2" />
        <ellipse cx="17.5" cy="16" rx="3.3" ry="2.6" fill={on ? '#FF5FA8' : '#C9D3E3'} stroke="#1E2A4A" strokeWidth="2" />
        {!on && <line x1="3" y1="23" x2="23" y2="3" stroke="#1E2A4A" strokeWidth="2.6" strokeLinecap="round" />}
      </svg>
    </motion.button>
  )
}
