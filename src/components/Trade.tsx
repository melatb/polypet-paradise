import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { friendlyError, useAccount } from '../account/AccountProvider'
import { RARITY, SPECIES_BY_ID, STAGES } from '../game/catalog'
import { useGame } from '../game/GameProvider'
import type { PetInstance } from '../game/types'
import { useFx } from '../fx/Fx'
import { PetArt } from '../pets/PetArt'
import { SocialError } from '../social/api'
import { FAIRNESS_LABEL, fairness, MAX_PETS_PER_SIDE, offerProblem, petPoints, sidePoints, type Trade } from '../social/model'
import { useSocial } from '../social/SocialProvider'
import { useTrade, type TradePartner } from '../social/TradeProvider'
import { Avatar, Sheet } from './Account'
import { RarityIcon } from './RarityIcon'

/** Turns any trade error into a sentence for a kid. */
export function tradeError(e: unknown): string {
  if (e instanceof SocialError) {
    return {
      'offer-gone': 'That offer isn’t open any more.',
      'code-not-found': 'No family has that code. Check it and try again.',
      'own-code': 'That’s your own family’s code.',
      'bad-code': 'Friend codes have 8 letters and numbers, like ABCD-EFGH.',
      'already-friends': 'You’re already friends with that family, or a request is waiting.',
      'need-name': 'Save a family name first, so they know who you are.',
    }[e.code]
  }
  const code = (e as { code?: string })?.code
  if (code === 'permission-denied') return 'That didn’t go through. The families may not be friends any more.'
  if (code === 'unavailable') return 'Couldn’t reach the internet. Try again in a moment.'
  if (!code && e instanceof Error && e.message) return e.message
  return friendlyError(e)
}

/* ---------- small pieces ---------- */
function TPet({ pet, on, disabled, note, onClick }: { pet: PetInstance; on?: boolean; disabled?: boolean; note?: string; onClick?: () => void }) {
  const sp = SPECIES_BY_ID[pet.species]
  if (!sp) return null
  const inner = (
    <>
      <PetArt species={sp} stage={pet.stage} look={pet.look} />
      <span className="tp-n">{sp.name}</span>
      <span className="tp-m"><span style={{ color: RARITY[sp.rarity].color, display: 'inline-flex' }}><RarityIcon rarity={sp.rarity} size={13} /></span>{STAGES[pet.stage]}</span>
      <span className="tp-pts">{petPoints(pet)} {petPoints(pet) === 1 ? 'pt' : 'pts'}</span>
      {note && <span className="tp-note">{note}</span>}
    </>
  )
  if (!onClick) return <div className="tpet">{inner}</div>
  return (
    <motion.button className={'tpet pick' + (on ? ' on' : '')} disabled={disabled} aria-pressed={on} onClick={onClick} whileTap={{ scale: 0.94 }}>
      {inner}
    </motion.button>
  )
}

export function FairMeter({ give, get }: { give: PetInstance[]; get: PetInstance[] }) {
  const g = sidePoints(give), r = sidePoints(get)
  const { verdict, tilt } = fairness(g, r)
  return (
    <div className="fair">
      <div className="fair-nums"><span>You give <b>{g}</b> pts</span><span>You get <b>{r}</b> pts</span></div>
      <div className="fair-bar" role="img" aria-label={`Fair trade meter: you give ${g} points and get ${r} points. ${FAIRNESS_LABEL[verdict]}.`}>
        <motion.i initial={false} animate={{ left: `${(tilt + 1) * 50}%` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
      </div>
      <div className={'fair-verdict ' + verdict}>{FAIRNESS_LABEL[verdict]}</div>
      <details className="fair-how">
        <summary>How are points counted?</summary>
        Each dimension doubles the corners: a Dot has 1, a Line 2, a Plane (square) 4, a Solid (cube) 8 and a Tesseract 16.
        Multiply by the stage: Baby ×1, Kid ×2, Teen ×3, Young Adult ×4, Full Grown ×5.
      </details>
    </div>
  )
}

function Sides({ give, get }: { give: PetInstance[]; get: PetInstance[] }) {
  return (
    <div className="offer-sides">
      <div><h4 className="h4">You give</h4><div className="tpets">{give.map((p) => <TPet key={p.id} pet={p} />)}</div></div>
      <div className="offer-arrow" aria-hidden="true">⇄</div>
      <div><h4 className="h4">You get</h4><div className="tpets">{get.map((p) => <TPet key={p.id} pet={p} />)}</div></div>
    </div>
  )
}

/* ---------- offers ---------- */
function IncomingOffer({ t }: { t: Trade }) {
  const tr = useTrade()!
  const social = useSocial()
  const { state } = useGame()
  const fx = useFx()
  const [sure, setSure] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const family = t.from.uid === social?.uid ? 'your family' : (social?.friends.find((f) => f.uid === t.from.uid)?.familyName ?? 'a friend family')
  const mine = t.to.pets.map((p) => state.pets.find((q) => q.id === p.id) ?? p)
  const problem = tr.acceptProblem(t)
  const go = async (fn: () => Promise<void>) => {
    setBusy(true); setErr('')
    try { await fn() } catch (e) { setErr(tradeError(e)); setSure(false) } finally { setBusy(false) }
  }
  return (
    <motion.div layout className="offer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <div className="offer-head"><Avatar species={t.from.species} size={40} /><span><b>{t.from.name}</b> from {family} wants to trade!</span></div>
      <Sides give={mine} get={t.from.pets} />
      <FairMeter give={mine} get={t.from.pets} />
      {problem && <div className="fb-box fb-bad">{problem}</div>}
      {err && <div className="fb-box fb-bad">{err}</div>}
      <div className="sheet-actions">
        {sure
          ? <>
              <span className="offer-q">Trade for real? This can’t be undone.</span>
              <button className="btn sm green" disabled={busy} onClick={() => void go(async () => {
                await tr.accept(t)
                fx.confetti()
                fx.toast('Trade complete!', `You got ${t.from.pets.map((p) => SPECIES_BY_ID[p.species]?.name).join(' and ')}.`)
              })}>Yes, trade!</button>
              <button className="btn sm white" disabled={busy} onClick={() => setSure(false)}>Wait</button>
            </>
          : <>
              <button className="btn sm green" disabled={busy || !!problem} onClick={() => setSure(true)}>Trade!</button>
              <button className="btn sm white" disabled={busy} onClick={() => void go(() => tr.decline(t))}>No thanks</button>
            </>}
      </div>
    </motion.div>
  )
}

function OutgoingOffer({ t }: { t: Trade }) {
  const tr = useTrade()!
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const declined = t.status === 'declined'
  const go = async (fn: () => Promise<void>) => {
    setBusy(true); setErr('')
    try { await fn() } catch (e) { setErr(tradeError(e)) } finally { setBusy(false) }
  }
  return (
    <motion.div layout className={'offer' + (declined ? ' declined' : ' waiting')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
      <div className="offer-head"><Avatar species={t.to.species} size={40} />
        <span>{declined ? <><b>{t.to.name}</b> said no thanks this time.</> : <>Waiting for <b>{t.to.name}</b>…</>}</span>
      </div>
      <Sides give={t.from.pets} get={t.to.pets} />
      {err && <div className="fb-box fb-bad">{err}</div>}
      <div className="sheet-actions">
        {declined
          ? <button className="btn sm white" disabled={busy} onClick={() => void go(() => tr.dismiss(t))}>OK</button>
          : <button className="btn sm white" disabled={busy} onClick={() => void go(() => tr.cancel(t))}>Cancel offer</button>}
      </div>
    </motion.div>
  )
}

/* ---------- making an offer ---------- */
function TradeBuilder({ partner, onClose }: { partner: TradePartner; onClose: () => void }) {
  const tr = useTrade()!
  const { state } = useGame()
  const fx = useFx()
  const [get, setGet] = useState<string[]>([])
  const [give, setGive] = useState<string[]>([])
  const [sure, setSure] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toggle = (list: string[], set: (l: string[]) => void, id: string) => {
    setSure(false); setErr('')
    set(list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_PETS_PER_SIDE ? [...list, id] : list)
  }
  const givePets = state.pets.filter((p) => give.includes(p.id))
  const getPets = partner.player.pets.filter((p) => get.includes(p.id))
  const problem = offerProblem(state, give, get, tr.locked)
  const send = async () => {
    setBusy(true); setErr('')
    try {
      await tr.offer(partner, give, get)
      fx.toast('Offer sent!', `${partner.player.name} will see it next time they play.`)
      onClose()
    } catch (e) { setErr(tradeError(e)); setSure(false) } finally { setBusy(false) }
  }
  return (
    <Sheet title={`Trade with ${partner.player.name}`} sub={partner.familyName} onClose={onClose} wide>
      <h4 className="h4">1. Pick up to {MAX_PETS_PER_SIDE} pets you’d like</h4>
      <div className="tpets">
        {partner.player.pets.map((p) => <TPet key={p.id} pet={p} on={get.includes(p.id)} onClick={() => toggle(get, setGet, p.id)} />)}
      </div>
      <h4 className="h4">2. Pick up to {MAX_PETS_PER_SIDE} of your pets to offer</h4>
      <div className="tpets">
        {state.pets.map((p) => {
          const locked = tr.locked.has(p.id)
          return <TPet key={p.id} pet={p} on={give.includes(p.id)} disabled={locked} note={locked ? 'In an offer' : undefined} onClick={() => toggle(give, setGive, p.id)} />
        })}
      </div>
      <FairMeter give={givePets} get={getPets} />
      {err && <div className="fb-box fb-bad">{err}</div>}
      <div className="sheet-actions">
        {sure
          ? <>
              <span className="offer-q">Send this offer to {partner.player.name}? Your pets wait at home until they answer.</span>
              <button className="btn green" disabled={busy} onClick={() => void send()}>Yes, send it</button>
              <button className="btn white" disabled={busy} onClick={() => setSure(false)}>Wait</button>
            </>
          : <>
              <button className="btn green" disabled={!!problem} onClick={() => setSure(true)}>Send offer</button>
              {problem && <span className="offer-q muted">{problem}</span>}
            </>}
      </div>
    </Sheet>
  )
}

/* ---------- the tab ---------- */
export function TradePanel() {
  const acct = useAccount()
  const tr = useTrade()
  const [partner, setPartner] = useState<TradePartner | null>(null)

  if (!tr) return (
    <div className="trade-off">
      <h3 className="h3">Trading</h3>
      <p className="sub">Trade pets with your brothers, sisters and friends! A grown-up needs to sign in with the Family button at the top first.</p>
      {acct.status === 'guest' && <p className="sub">Then a grown-up adds friend families in Manage family. There’s no chat, just pets.</p>}
    </div>
  )

  const groups = new Map<string, TradePartner[]>()
  for (const p of tr.partners) groups.set(p.familyName, [...(groups.get(p.familyName) ?? []), p])

  return (
    <>
      {tr.incoming.length > 0 && (
        <section className="trade-sec">
          <h3 className="h3">Offers for you</h3>
          <AnimatePresence initial={false}>{tr.incoming.map((t) => <IncomingOffer key={t.id} t={t} />)}</AnimatePresence>
        </section>
      )}
      {tr.outgoing.length > 0 && (
        <section className="trade-sec">
          <h3 className="h3">Your offers</h3>
          <AnimatePresence initial={false}>{tr.outgoing.map((t) => <OutgoingOffer key={t.id} t={t} />)}</AnimatePresence>
        </section>
      )}
      <section className="trade-sec">
        <div><h3 className="h3">Start a trade</h3><p className="sub">Pick who to trade with. Both of you have to say yes before any pets move.</p></div>
        {tr.partners.length === 0
          ? <p className="sub trade-empty">{tr.hasFriends
            ? 'Your trade friends haven’t played yet. Their pets show up here after they play.'
            : 'No one to trade with yet. Ask a grown-up to add a friend family in Manage family, or add a brother or sister to your family.'}</p>
          : [...groups.entries()].map(([fam, list]) => (
            <div key={fam} className="partner-group">
              <h4 className="h4">{fam}</h4>
              <div className="partners">
                {list.map((p) => (
                  <motion.button key={`${p.uid}/${p.player.id}`} className="partner" onClick={() => setPartner(p)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                    <Avatar species={p.player.species} size={52} />
                    <span className="pp-name">{p.player.name}</span>
                    <span className="sub">{p.player.pets.length} {p.player.pets.length === 1 ? 'pet' : 'pets'}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
      </section>
      <AnimatePresence>{partner && <TradeBuilder key="tb" partner={partner} onClose={() => setPartner(null)} />}</AnimatePresence>
    </>
  )
}
