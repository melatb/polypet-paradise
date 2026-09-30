/** Firestore reads and writes for a family's players. All Firebase code is loaded lazily. */
import { getFirebase } from '../firebase/client'
import { migrate, type GameStorage } from '../game/storage'
import type { GameState } from '../game/types'

export interface Player {
  id: string
  name: string
  /** Pet species shown as the player's picture. */
  species: string
  /** SHA-256 of "<playerId>:<pin>", or null for no PIN. A sibling lock, not real security. */
  pinHash: string | null
}

const playersPath = (uid: string) => `families/${uid}/players`

export async function hashPin(playerId: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${playerId}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function listPlayers(uid: string): Promise<Player[]> {
  const { db, fs } = await getFirebase()
  const snap = await fs.getDocs(fs.query(fs.collection(db, playersPath(uid)), fs.orderBy('createdAt')))
  return snap.docs.map((d) => ({ id: d.id, name: d.get('name'), species: d.get('species'), pinHash: d.get('pinHash') ?? null }))
}

export async function createPlayer(uid: string, input: { name: string; species: string; pin: string | null; state: GameState | null }): Promise<Player> {
  const { db, fs } = await getFirebase()
  const ref = fs.doc(fs.collection(db, playersPath(uid)))
  const pinHash = input.pin ? await hashPin(ref.id, input.pin) : null
  await fs.setDoc(ref, {
    name: input.name, species: input.species, pinHash,
    state: input.state, createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp(),
  })
  return { id: ref.id, name: input.name, species: input.species, pinHash }
}

export async function setPlayerPin(uid: string, playerId: string, pin: string | null) {
  const { db, fs } = await getFirebase()
  await fs.updateDoc(fs.doc(db, playersPath(uid), playerId), { pinHash: pin ? await hashPin(playerId, pin) : null, updatedAt: fs.serverTimestamp() })
}

export async function deletePlayer(uid: string, playerId: string) {
  const { db, fs } = await getFirebase()
  await fs.deleteDoc(fs.doc(db, playersPath(uid), playerId))
}

/**
 * A GameStorage that saves one player's game to Firestore.
 * Saves are batched (at most one write every ~1.5 s) and flushed when the page is hidden.
 * Firestore's offline cache keeps saves working without internet.
 */
export function cloudStorage(uid: string, playerId: string): GameStorage & { flush(): Promise<void>; dispose(): void } {
  let pending: GameState | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  const flush = async () => {
    if (timer) { clearTimeout(timer); timer = null }
    if (!pending) return
    const state = pending
    pending = null
    const { db, fs } = await getFirebase()
    await fs.updateDoc(fs.doc(db, playersPath(uid), playerId), { state, updatedAt: fs.serverTimestamp() })
  }
  const onHide = () => { if (document.visibilityState === 'hidden') void flush() }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', onHide)
  return {
    async load() {
      const { db, fs } = await getFirebase()
      const snap = await fs.getDoc(fs.doc(db, playersPath(uid), playerId))
      return snap.exists() ? migrate(snap.get('state')) : null
    },
    async save(state) {
      pending = state
      if (!timer) timer = setTimeout(() => void flush(), 1500)
    },
    flush,
    dispose() {
      void flush()
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    },
  }
}
