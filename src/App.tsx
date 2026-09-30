import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { HatchModal } from './components/HatchModal'
import { Hud } from './components/Hud'
import { EggShop, LearnPanel, PetsPanel, WardrobePanel } from './components/Panels'
import { TradePanel } from './components/Trade'
import { useAccount } from './account/AccountProvider'
import { useTrade } from './social/TradeProvider'
import { QuestionSheet } from './components/QuestionSheet'
import { WorldMap } from './components/WorldMap'
import { Yard } from './components/Yard'
import type { EggId } from './game/catalog'
import { useGame } from './game/GameProvider'
import type { PetInstance } from './game/types'
import type { Question } from './math/types'

const TABS = [
  { id: 'pets', label: 'Pets' },
  { id: 'wardrobe', label: 'Wardrobe' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'learn', label: 'Learn' },
  { id: 'trade', label: 'Trade' },
] as const
type Tab = (typeof TABS)[number]['id']

export default function App({ onAccount }: { onAccount: () => void }) {
  const game = useGame()
  const acct = useAccount()
  const trade = useTrade()
  const offers = trade?.incoming.length ?? 0
  // The Claude preview has no accounts, so no trading tab there.
  const tabs = acct.status === 'off' ? TABS.filter((t) => t.id !== 'trade') : TABS
  const [tab, setTab] = useState<Tab>('pets')
  const [question, setQuestion] = useState<Question | null>(null)
  const [celebrate, setCelebrate] = useState(0)
  const [map, setMap] = useState(false)
  const [hatch, setHatch] = useState<{ egg: EggId; pet: PetInstance; isNew: boolean } | null>(null)

  const openQuestion = () => setQuestion(game.nextQuestion())
  const buy = (egg: EggId) => {
    const r = game.hatch(egg)
    if (r) setHatch({ egg, pet: r.pet, isNew: r.isNew })
  }

  return (
    <div className="app">
      <Hud onMap={() => setMap(true)} onAccount={onAccount} />
      <div className="main">
        <Yard onSolve={openQuestion} celebrate={celebrate} />
        <section className="panel side">
          <div className={'tabs' + (tabs.length > 4 ? ' five' : '')} role="tablist">
            {tabs.map((t) => (
              <button key={t.id} className="tab" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === 'trade' && offers > 0 && <span className="tab-badge" aria-label={`${offers} new offers`}>{offers}</span>}
                {tab === t.id && <motion.span layoutId="tab-under" className="tab-under" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="tabpanel" role="tabpanel"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              {tab === 'pets' && <PetsPanel />}
              {tab === 'wardrobe' && <WardrobePanel />}
              {tab === 'eggs' && <EggShop onBuy={buy} />}
              {tab === 'learn' && <LearnPanel onMap={() => setMap(true)} />}
              {tab === 'trade' && <TradePanel />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {question && (
          <QuestionSheet key="q" question={question} onClose={(helped) => {
            setQuestion(null)
            if (helped) setCelebrate((c) => c + 1)
          }} />
        )}
      </AnimatePresence>
      <AnimatePresence>{map && <WorldMap key="m" onClose={() => setMap(false)} />}</AnimatePresence>
      <AnimatePresence>
        {hatch && (
          <HatchModal key="h" {...hatch} onDone={(makeActive) => {
            if (makeActive) { game.setActive(hatch.pet.id); setTab('pets') }
            setHatch(null)
          }} />
        )}
      </AnimatePresence>
    </div>
  )
}
