import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAccount } from '../account/AccountProvider'
import type { Player } from '../account/players'
import { SPECIES_BY_ID } from '../game/catalog'
import { useGame } from '../game/GameProvider'
import type { PetInstance } from '../game/types'
import { useFx } from '../fx/Fx'
import * as api from './api'
import { hasApplied, MAX_OPEN_OFFERS, offerProblem, type ShowcasePlayer, type Trade } from './model'
import { useSocial } from './SocialProvider'

export interface TradePartner {
  uid: string
  familyName: string
  sibling: boolean
  player: ShowcasePlayer
}

export interface TradeApi {
  /** Offers other kids sent to this player. */
  incoming: Trade[]
  /** This player's offers that are waiting, or were turned down. */
  outgoing: Trade[]
  /** Pets waiting in this player's open offers: they stay home until the offer ends. */
  locked: ReadonlySet<string>
  partners: TradePartner[]
  hasFriends: boolean
  offer: (to: TradePartner, give: string[], get: string[]) => Promise<void>
  /** Null if the offer can be accepted, or a sentence explaining why not. */
  acceptProblem: (t: Trade) => string | null
  accept: (t: Trade) => Promise<void>
  decline: (t: Trade) => Promise<void>
  cancel: (t: Trade) => Promise<void>
  dismiss: (t: Trade) => Promise<void>
}

/** Exported for previews and tests; app code should use the hook. */
export const TradeContext = createContext<TradeApi | null>(null)
const Ctx = TradeContext

/** Player-level trading. Needs a signed-in family with a player chosen; otherwise useTrade() returns null. */
export function TradeProvider({ children }: { children: ReactNode }) {
  const acct = useAccount()
  const social = useSocial()
  return social && acct.active
    ? <TradeInner uid={social.uid} me={acct.active}>{children}</TradeInner>
    : <Ctx.Provider value={null}>{children}</Ctx.Provider>
}

const petName = (p: Pick<PetInstance, 'species'>) => SPECIES_BY_ID[p.species]?.name ?? 'a pet'
const listNames = (pets: Pick<PetInstance, 'species'>[]) => pets.map(petName).join(' and ')

function TradeInner({ uid, me, children }: { uid: string; me: Player; children: ReactNode }) {
  const game = useGame()
  const social = useSocial()!
  const fx = useFx()
  const [trades, setTrades] = useState<Trade[]>([])
  const busy = useRef(new Set<string>())

  useEffect(() => api.watchTrades(uid, setTrades), [uid])

  // Keep this kid's pets on show for friends and siblings (batched, a couple of seconds after changes).
  const petsKey = JSON.stringify(game.state.pets)
  useEffect(() => {
    const t = setTimeout(() => { void api.publishShowcase(uid, me, game.state.pets).catch(() => {}) }, 2000)
    return () => clearTimeout(t)
  }, [uid, me.id, me.name, me.species, petsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFromMe = (t: Trade) => t.from.uid === uid && t.from.playerId === me.id
  const isToMe = (t: Trade) => t.to.uid === uid && t.to.playerId === me.id

  // Finish trades in the background: the second half of accepted offers, and tidying up.
  useEffect(() => {
    for (const t of trades) {
      if (busy.current.has(t.id)) continue
      const run = (fn: () => Promise<unknown>) => {
        busy.current.add(t.id)
        fn().catch(() => {}).finally(() => busy.current.delete(t.id))
      }
      const applied = hasApplied(game.state, t.id)
      if (isFromMe(t) && t.status === 'accepted') {
        run(async () => {
          if (game.applyTrade(t.id, t.from.pets.map((p) => p.id), t.to.pets)) {
            fx.confetti()
            fx.toast('Trade complete!', `${t.to.name} traded you ${listNames(t.to.pets)}.`)
          }
          await game.persist()
          await api.setTradeStatus(t.id, 'done')
        })
      } else if (isToMe(t) && (t.status === 'accepted' || t.status === 'done') && !applied) {
        // Our side of an accepted offer didn't get saved last time (for example, the tab closed): finish it now.
        run(async () => { game.applyTrade(t.id, t.to.pets.map((p) => p.id), t.from.pets); await game.persist() })
      } else if (isToMe(t) && ((t.status === 'done' && applied) || t.status === 'cancelled')) {
        run(() => api.deleteTrade(t.id))
      }
    }
  }, [trades, game.state]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<TradeApi>(() => {
    const incoming = trades.filter((t) => isToMe(t) && t.status === 'offered')
    const outgoing = trades.filter((t) => isFromMe(t) && (t.status === 'offered' || t.status === 'declined'))
    const locked = new Set(trades.filter((t) => isFromMe(t) && t.status === 'offered').flatMap((t) => t.from.pets.map((p) => p.id)))

    const partners: TradePartner[] = []
    const own = social.showcases[uid]
    for (const p of own?.players ?? []) if (p.id !== me.id) partners.push({ uid, familyName: 'Your family', sibling: true, player: p })
    for (const f of social.friends) {
      for (const p of social.showcases[f.uid]?.players ?? []) partners.push({ uid: f.uid, familyName: f.familyName, sibling: false, player: p })
    }

    const acceptProblem = (t: Trade) => {
      const mine = new Map(game.state.pets.map((p) => [p.id, p]))
      const gone = t.to.pets.filter((p) => !mine.has(p.id))
      if (gone.length) return `You don’t have ${listNames(gone)} any more.`
      if (t.to.pets.some((p) => locked.has(p.id))) return 'One of those pets is in one of your own offers. Cancel that offer first.'
      return null
    }

    return {
      incoming, outgoing, locked, partners,
      hasFriends: social.friends.length > 0,
      async offer(to, give, get) {
        const s = game.state
        const problem = offerProblem(s, give, get, locked)
        if (problem) throw new Error(problem)
        if (outgoing.filter((t) => t.status === 'offered').length >= MAX_OPEN_OFFERS) throw new Error(`You can have ${MAX_OPEN_OFFERS} offers waiting at once. Cancel one first.`)
        const myPets = s.pets.filter((p) => give.includes(p.id))
        const theirPets = to.player.pets.filter((p) => get.includes(p.id))
        await api.sendOffer(
          { uid, playerId: me.id, name: me.name, species: me.species, pets: myPets },
          { uid: to.uid, playerId: to.player.id, name: to.player.name, species: to.player.species, pets: theirPets },
        )
        // Pets in an offer wait at home, so bring another pet to the yard.
        if (give.includes(s.activeId)) {
          const next = s.pets.find((p) => !give.includes(p.id) && !locked.has(p.id))
          if (next) game.setActive(next.id)
        }
      },
      acceptProblem,
      async accept(t) {
        const problem = acceptProblem(t)
        if (problem) throw new Error(problem)
        const current = t.to.pets.map((p) => game.state.pets.find((q) => q.id === p.id)!)
        busy.current.add(t.id)
        try {
          await api.acceptOffer(t.id, current)
          game.applyTrade(t.id, current.map((p) => p.id), t.from.pets)
          await game.persist()
        } finally {
          busy.current.delete(t.id)
        }
      },
      decline: (t) => api.setTradeStatus(t.id, 'declined'),
      async cancel(t) {
        await api.setTradeStatus(t.id, 'cancelled')
        await api.deleteTrade(t.id).catch(() => {})
      },
      dismiss: (t) => api.deleteTrade(t.id),
    }
  }, [trades, social, game, uid, me]) // eslint-disable-line react-hooks/exhaustive-deps

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTrade = () => useContext(Ctx)
