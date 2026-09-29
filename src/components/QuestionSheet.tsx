import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { NEEDS, SPECIES_BY_ID, STAGES } from '../game/catalog'
import { useGame } from '../game/GameProvider'
import { fmt, pick } from '../game/random'
import { parseAnswer, unlocksAtLevel } from '../game/rules'
import { useFx } from '../fx/Fx'
import { Figure, Mini, RatioTable } from '../math/Figure'
import type { Question } from '../math/types'
import { PetArt } from '../pets/PetArt'

interface Props {
  question: Question
  onClose: (helped: boolean) => void
}

export function QuestionSheet({ question: q, onClose }: Props) {
  const game = useGame()
  const fx = useFx()
  // Snapshot the pet as it was when the question opened; answering changes its need.
  const [pet] = useState(game.pet)
  const sp = SPECIES_BY_ID[pet.species]
  const need = NEEDS[pet.need]

  const [tries, setTries] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState<ReactNode>(null)
  const [dead, setDead] = useState<number[]>([])
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sheet = useAnimationControls()
  const help = tries > 0 || usedHint

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(done) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, onClose])

  const answerText = () => {
    if (q.choices) {
      const c = q.choices.find((c) => c.ok)
      return c?.label ?? 'the highlighted one'
    }
    return `${fmt(q.answer ?? 0)} ${q.unit ?? ''}`
  }

  const origin = () => {
    const r = document.querySelector('.sheet')?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + 80 } : { x: innerWidth / 2, y: innerHeight / 2 }
  }

  const grade = (correct: boolean, why?: string) => {
    if (done) return
    if (correct) {
      const firstTry = tries === 0
      const res = game.answer({ correct: true, firstTry, usedHint })
      setDone(true)
      fx.confetti()
      fx.coins(origin(), Math.ceil(res.coins / 3))
      const clean = firstTry && !usedHint
      setFeedback(<>
        <div className="fb-box fb-good">
          <b>{clean ? pick(['Nailed it!', 'Correct!', 'Awesome!', 'Perfect!']) : 'You got it!'} +{res.coins} coins</b>
          {q.solution}
          {res.grewTo !== undefined && <b className="grew">{sp.name} grew up to {STAGES[res.grewTo]}! New look unlocked.</b>}
        </div>
      </>)
      if (res.leveledUpTo) {
        const names = unlocksAtLevel(game.state, res.leveledUpTo)
        setTimeout(() => fx.toast(`Level ${res.leveledUpTo}!`, names.length ? `New: ${names.join(', ')}` : 'Bigger coin rewards'), 900)
      }
      return
    }
    const n = tries + 1
    setTries(n)
    void sheet.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } })
    if (n >= 2) {
      const res = game.answer({ correct: false, firstTry: false, usedHint })
      setDone(true)
      setFeedback(<>
        <div className="fb-box fb-bad"><b>The answer is {answerText()}.</b>{q.solution}</div>
        <div className="fb-box fb-hint">{sp.name} still appreciates the effort. +{res.coins} coins
          {res.grewTo !== undefined && <> · grew up to {STAGES[res.grewTo]}!</>}</div>
      </>)
    } else {
      setFeedback(<>
        <div className="fb-box fb-bad"><b>Not quite. Try again!</b>{why}</div>
        <div className="fb-box fb-hint"><b className="small">Hint</b>{q.hint}</div>
      </>)
      setValue('')
      inputRef.current?.focus()
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = parseAnswer(value)
    if (Number.isNaN(v)) {
      setFeedback(<div className="fb-box fb-hint">Type a number, like 12 or 7.5 (fractions like 15/2 work too).</div>)
      return
    }
    const ok = Math.abs(v - (q.answer ?? NaN)) < 1e-6
    grade(ok, !ok && q.commonSlip && Math.abs(v - q.commonSlip.value) < 1e-6 ? q.commonSlip.message : undefined)
  }

  const fig = q.figure?.(help)
  const pictureChoices = q.choices?.some((c) => c.shape)

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(done) }}>
      <motion.div className="sheet-wrap" animate={sheet}>
        <motion.div className="sheet" role="dialog" aria-modal="true" aria-labelledby="qTitle"
          initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
          <div className="sheet-head">
            <PetArt species={sp} stage={pet.stage} look={pet.look} />
            <div>
              <div className="tt" id="qTitle">{sp.name} {need.title} {need.emoji}</div>
              <div className="ts">Solve this to help. Level {game.level}</div>
            </div>
            <button className="x" onClick={() => onClose(done)} aria-label="Close">✕</button>
          </div>
          <span className="qtype">{q.name.toUpperCase()}</span>
          <p className="prompt">{q.prompt}</p>
          {fig && <div className="fig"><Figure spec={fig} /></div>}
          {q.table && <RatioTable spec={q.table} />}

          {!done && (q.choices ? (
            <div className={'mc' + (pictureChoices ? ' mc-svg' : '')}>
              {q.choices.map((c, i) => (
                <motion.button key={i} className="choice" disabled={dead.includes(i)} whileTap={{ scale: 0.95 }}
                  onClick={() => { if (c.ok) grade(true); else { setDead([...dead, i]); grade(false, c.why) } }}>
                  {c.shape ? <Mini shape={c.shape} /> : c.label}
                </motion.button>
              ))}
            </div>
          ) : (
            <form className="ansrow" onSubmit={submit}>
              <input ref={inputRef} id="answer" inputMode="decimal" autoComplete="off" placeholder="?" aria-label="Your answer"
                value={value} onChange={(e) => setValue(e.target.value)} />
              <span className="unit">{q.unit}</span>
              <motion.button className="btn" type="submit" whileTap={{ scale: 0.95 }}>Check</motion.button>
            </form>
          ))}

          {done && q.choices && (
            <div className={'mc' + (pictureChoices ? ' mc-svg' : '')}>
              {q.choices.map((c, i) => (
                <div key={i} className={'choice ' + (c.ok ? 'right' : 'faded')}>{c.shape ? <Mini shape={c.shape} /> : c.label}</div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div key={String(tries) + String(done)} className="fb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          {done ? (
            <motion.button className="btn big" onClick={() => onClose(true)} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              {need.emoji} {need.act}{tries >= 2 ? ' anyway' : ''}
            </motion.button>
          ) : (
            <div className="sheet-actions">
              <button className="btn sm white" disabled={help} onClick={() => {
                setUsedHint(true)
                setFeedback(<div className="fb-box fb-hint"><b className="small">Hint</b>{q.hint}</div>)
              }}>{help ? 'Hint shown' : 'Show a hint'}</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
