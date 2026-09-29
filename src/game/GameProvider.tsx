import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { EggId } from './catalog'
import * as rules from './rules'
import { localStorageBackend, type GameStorage } from './storage'
import type { GameState, PetInstance } from './types'

interface GameApi {
  state: GameState
  level: number
  pet: PetInstance
  nextQuestion: () => ReturnType<typeof rules.nextQuestion>['question']
  answer: (a: rules.AnswerInput) => rules.AnswerResult
  hatch: (egg: EggId) => ReturnType<typeof rules.hatchEgg>
  claimLesson: (id: string) => void
  setActive: (id: string) => void
  updatePet: (id: string, change: Partial<PetInstance>) => void
  setZone: (zoneId: string) => void
}

const Ctx = createContext<GameApi | null>(null)

export function GameProvider({ children, storage = localStorageBackend }: { children: ReactNode; storage?: GameStorage }) {
  const [state, setState] = useState<GameState | null>(null)
  const ref = useRef<GameState | null>(null)

  useEffect(() => {
    storage.load().then((s) => {
      const init = s ?? rules.freshState()
      ref.current = init
      setState(init)
    })
  }, [storage])

  const commit = useCallback((next: GameState) => {
    ref.current = next
    setState(next)
    void storage.save(next)
  }, [storage])

  const api = useMemo<GameApi | null>(() => {
    if (!state) return null
    const cur = () => ref.current as GameState
    return {
      state,
      level: rules.level(state),
      pet: rules.activePet(state),
      nextQuestion: () => {
        const { state: s, question } = rules.nextQuestion(cur())
        commit(s)
        return question
      },
      answer: (a) => {
        const { state: s, result } = rules.applyAnswer(cur(), a)
        commit(s)
        return result
      },
      hatch: (egg) => {
        const r = rules.hatchEgg(cur(), egg)
        if (r) commit(r.state)
        return r
      },
      claimLesson: (id) => commit(rules.claimLesson(cur(), id)),
      setActive: (id) => commit({ ...cur(), activeId: id }),
      updatePet: (id, change) => commit(rules.updatePet(cur(), id, change)),
      setZone: (zoneId) => commit(rules.setZone(cur(), zoneId)),
    }
  }, [state, commit])

  if (!api) return <div className="loading">Loading your pets…</div>
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useGame() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGame must be used inside <GameProvider>')
  return v
}
