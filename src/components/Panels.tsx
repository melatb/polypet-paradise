import { motion } from 'framer-motion'
import { EGGS, HATS, NECKS, PAINTS, RARITY, SPECIES, SPECIES_BY_ID, STAGES, type EggId } from '../game/catalog'
import { useGame } from '../game/GameProvider'
import { LESSON_REWARD } from '../game/rules'
import type { HatId, Look, NeckId, PaintId, Rarity, Stage } from '../game/types'
import { useFx } from '../fx/Fx'
import { ZONES_BY_ID } from '../math/units'
import { EggArt, PetArt } from '../pets/PetArt'
import { CoinIcon, RarityChip } from './CoinIcon'
import { RarityIcon } from './RarityIcon'

/* ---------- Pets ---------- */
export function PetsPanel() {
  const { state, setActive } = useGame()
  const owned = new Set(state.pets.map((p) => p.species))
  return (
    <>
      <div><h3 className="h3">Your pets</h3><p className="sub">Tap a pet to bring it to the yard. Solve its needs to help it grow up.</p></div>
      <div className="petgrid">
        {state.pets.map((p) => {
          const sp = SPECIES_BY_ID[p.species]
          return (
            <motion.button key={p.id} layout className={'petcard' + (p.id === state.activeId ? ' active' : '')} onClick={() => setActive(p.id)}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
              <PetArt species={sp} stage={p.stage} look={p.look} />
              <span className="pn">{sp.name}</span>
              <RarityChip rarity={sp.rarity} />
              <span className="ps">{STAGES[p.stage]}</span>
            </motion.button>
          )
        })}
      </div>
      <div><h3 className="h3">Pet book · {owned.size}/{SPECIES.length}</h3><p className="sub">Every pet is shaped like a polygon. Hatch eggs to find them all.</p></div>
      <div className="book">
        {SPECIES.map((s) => (
          <div key={s.id} className={'slot' + (owned.has(s.id) ? '' : ' no')} title={owned.has(s.id) ? `${s.name} · body: ${s.body}` : 'Not found yet'}>
            <PetArt species={s} stage={0} look={{ paint: 'natural', hat: 'none', neck: 'none' }} />
            <span className="slot-rar" style={{ color: RARITY[s.rarity].color }} title={RARITY[s.rarity].label}><RarityIcon rarity={s.rarity} size={15} /></span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------- Wardrobe ---------- */
export function WardrobePanel() {
  const { pet, updatePet } = useGame()
  const sp = SPECIES_BY_ID[pet.species]
  const set = (change: Partial<Look>) => updatePet(pet.id, { look: { ...pet.look, ...change } })

  const row = <K extends string>(title: string, items: Record<K, { name: string; stage: Stage }>, slot: keyof Look) => (
      <div className="wr-row">
        <h4 className="h4">{title}</h4>
        <div className="wr-items">
          {(Object.entries(items) as [K, { name: string; stage: Stage }][]).map(([id, it]) => {
            const locked = pet.stage < it.stage
            const on = pet.look[slot] === id
            const preview: Look = { ...pet.look, [slot]: id }
            return (
              <motion.button key={id} className={'wr-item' + (on ? ' on' : '')} disabled={locked} whileTap={{ scale: 0.94 }}
                onClick={() => set({ [slot]: id } as Partial<Look>)} aria-pressed={on}
                title={locked ? `Unlocks when ${sp.name} is a ${STAGES[it.stage]}` : it.name}>
                <PetArt species={sp} stage={pet.stage} look={preview} />
                <span>{it.name}</span>
                {locked && <span className="lock">🔒 {STAGES[it.stage]}</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
  )

  return (
    <>
      <div className="wr-head">
        <div className="wr-preview"><PetArt species={sp} stage={pet.stage} look={pet.look} animated /></div>
        <div>
          <h3 className="h3">{sp.name}'s wardrobe</h3>
          <p className="sub">Every time {sp.name} grows up, it unlocks a new color and outfit and puts them on. You can switch back to any look it has unlocked.</p>
        </div>
      </div>
      {row<PaintId>('Colors', PAINTS, 'paint')}
      {row<HatId>('Hats', HATS, 'hat')}
      {row<NeckId>('Neck', NECKS, 'neck')}
    </>
  )
}

/* ---------- Egg shop ---------- */
export function EggShop({ onBuy }: { onBuy: (egg: EggId) => void }) {
  const { state } = useGame()
  return (
    <>
      <div><h3 className="h3">Egg shop</h3><p className="sub">Earn coins by solving your pets' needs. Rarer pets pay a bigger bonus when you help them.</p></div>
      <div className="eggs">
        {(Object.entries(EGGS) as [EggId, (typeof EGGS)[EggId]][]).map(([k, E]) => {
          const short = E.cost - state.coins
          return (
            <div key={k} className="egg">
              <motion.div className="egg-art" whileHover={{ rotate: [0, -6, 6, -3, 0] }} transition={{ duration: 0.5 }}><EggArt egg={k} /></motion.div>
              <div className="en">{E.name}</div>
              <div className="odds">
                {(Object.entries(E.odds) as [Rarity, number][]).map(([r, v]) => (
                  <span key={r} className="chip odds-chip" style={{ borderColor: RARITY[r].color }}>
                    <span style={{ color: RARITY[r].color, display: 'inline-flex' }}><RarityIcon rarity={r} size={12} /></span>{RARITY[r].label} {v}%
                  </span>
                ))}
              </div>
              <div className="price"><CoinIcon size={20} />{E.cost}</div>
              <motion.button className={'btn sm' + (short > 0 ? '' : ' green')} disabled={short > 0} onClick={() => onBuy(k)} whileTap={{ scale: 0.95 }}>
                {short > 0 ? `Need ${short} more` : 'Buy & hatch'}
              </motion.button>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ---------- Learn ---------- */
export function LearnPanel({ onMap }: { onMap: () => void }) {
  const { state, claimLesson } = useGame()
  const fx = useFx()
  const zone = ZONES_BY_ID[state.zoneId]
  return (
    <>
      <div className="learn-where">
        <div><span className="sub">You're in</span><h3 className="h3">Unit {zone.unit} · {zone.title}</h3></div>
        <button className="btn sm white" onClick={onMap}>Change world</button>
      </div>
      <div><h3 className="h3">Pet trainer's handbook</h3><p className="sub">Read a card, play with the picture, and collect {LESSON_REWARD} coins for each one.</p></div>
      {zone.lessons.map((l, i) => (
        <div key={l.id} className="lesson">
          <span className="tag">{i + 1} · {l.tag}</span>
          {l.body()}
          <div className="row">
            {state.lessons[l.id]
              ? <span className="chip done-chip">Collected +{LESSON_REWARD}</span>
              : <motion.button className="btn sm green" whileTap={{ scale: 0.95 }} onClick={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                claimLesson(l.id)
                fx.coins({ x: r.left + r.width / 2, y: r.top }, 7)
              }}>Got it! +{LESSON_REWARD} coins</motion.button>}
          </div>
        </div>
      ))}
      <p className="credit">{zone.credit}</p>
    </>
  )
}
