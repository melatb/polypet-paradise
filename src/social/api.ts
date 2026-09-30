/** Firestore reads and writes for friends and trading. Firebase itself is loaded lazily through getFirebase(). */
import { getFirebase, type FirebaseClient } from '../firebase/client'
import type { PetInstance } from '../game/types'
import {
  makeFriendCode, normalizeCode, pairId, sanitizePets,
  type Friendship, type Showcase, type ShowcasePlayer, type Trade, type TradeSide, type TradeStatus,
} from './model'

export type SocialErrorCode = 'code-not-found' | 'own-code' | 'bad-code' | 'already-friends' | 'offer-gone' | 'need-name'
export class SocialError extends Error {
  code: SocialErrorCode
  constructor(code: SocialErrorCode) { super(code); this.code = code }
}

/** Starts a Firestore listener once Firebase has loaded; the returned function stops it. */
function watch(start: (f: FirebaseClient) => () => void): () => void {
  let stop = () => {}
  let dead = false
  getFirebase().then((f) => { if (!dead) stop = start(f) }).catch(() => {})
  return () => { dead = true; stop() }
}

/** Copies only the fields a pet has, so nothing else about a save leaves the family. */
const petOnly = (p: PetInstance): PetInstance => ({ id: p.id, species: p.species, stage: p.stage, prog: p.prog, need: p.need, look: { ...p.look } })

/* ---------- family settings ---------- */
export interface FamilySettings { familyName: string; friendCode: string | null }

export function watchFamily(uid: string, cb: (f: FamilySettings) => void) {
  return watch(({ db, fs }) => fs.onSnapshot(fs.doc(db, 'families', uid), (snap) => {
    cb({ familyName: snap.get('familyName') ?? '', friendCode: snap.get('friendCode') ?? null })
  }, () => {}))
}

export async function saveFamilyName(uid: string, familyName: string) {
  const { db, fs } = await getFirebase()
  await fs.setDoc(fs.doc(db, 'families', uid), { familyName, updatedAt: fs.serverTimestamp() }, { merge: true })
  await fs.setDoc(fs.doc(db, 'showcase', uid), { familyName, updatedAt: fs.serverTimestamp() }, { merge: true })
}

/** Makes a new friend code and retires the old one. Families who already used the old one stay friends. */
export async function newFriendCode(uid: string, old: string | null): Promise<string> {
  const { db, fs } = await getFirebase()
  for (let tries = 0; ; tries++) {
    const code = makeFriendCode()
    try {
      await fs.setDoc(fs.doc(db, 'friendCodes', code), { uid, createdAt: fs.serverTimestamp() })
    } catch (e) {
      if (tries < 3) continue // taken by someone else (astronomically unlikely): try another
      throw e
    }
    await fs.setDoc(fs.doc(db, 'families', uid), { friendCode: code, updatedAt: fs.serverTimestamp() }, { merge: true })
    if (old) await fs.deleteDoc(fs.doc(db, 'friendCodes', old)).catch(() => {})
    return code
  }
}

/* ---------- friendships ---------- */
export function watchFriendships(uid: string, cb: (list: Friendship[]) => void) {
  return watch(({ db, fs }) => fs.onSnapshot(
    fs.query(fs.collection(db, 'friendships'), fs.where('members', 'array-contains', uid)),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Friendship, 'id'>) }))),
    () => cb([]),
  ))
}

/** Sends a friend request using the other family's code (or accepts theirs, if they already sent one). */
export async function addFriendByCode(uid: string, myName: string, rawCode: string): Promise<'sent' | 'accepted'> {
  if (!myName) throw new SocialError('need-name')
  const code = normalizeCode(rawCode)
  if (!code) throw new SocialError('bad-code')
  const { db, fs } = await getFirebase()
  const codeSnap = await fs.getDoc(fs.doc(db, 'friendCodes', code))
  if (!codeSnap.exists()) throw new SocialError('code-not-found')
  const other = codeSnap.get('uid') as string
  if (other === uid) throw new SocialError('own-code')
  const id = pairId(uid, other)
  const ref = fs.doc(db, 'friendships', id)
  const existing = await fs.getDoc(ref)
  if (existing.exists()) {
    if (existing.get('status') === 'pending' && existing.get('requestedBy') !== uid) {
      await acceptFriend(uid, myName, id)
      return 'accepted'
    }
    throw new SocialError('already-friends')
  }
  await fs.setDoc(ref, {
    members: [uid, other].sort(), requestedBy: uid, status: 'pending', names: { [uid]: myName }, code, createdAt: fs.serverTimestamp(),
  })
  return 'sent'
}

export async function acceptFriend(uid: string, myName: string, id: string) {
  if (!myName) throw new SocialError('need-name')
  const { db, fs } = await getFirebase()
  await fs.updateDoc(fs.doc(db, 'friendships', id), { status: 'accepted', [`names.${uid}`]: myName })
}

export async function removeFriendship(id: string) {
  const { db, fs } = await getFirebase()
  await fs.deleteDoc(fs.doc(db, 'friendships', id))
}

/* ---------- showcase: which pets each kid has, for friends to see ---------- */
export function watchShowcase(uid: string, cb: (s: Showcase | null) => void) {
  return watch(({ db, fs }) => fs.onSnapshot(fs.doc(db, 'showcase', uid), (snap) => {
    if (!snap.exists()) return cb({ uid, familyName: '', players: [] })
    const raw = (snap.get('players') ?? {}) as Record<string, { name?: string; species?: string; pets?: unknown }>
    const players: ShowcasePlayer[] = Object.entries(raw)
      .map(([id, p]) => ({ id, name: String(p?.name ?? '').slice(0, 20), species: String(p?.species ?? 'tripup'), pets: sanitizePets(p?.pets) }))
      .filter((p) => p.name && p.pets.length)
      .sort((a, b) => a.name.localeCompare(b.name))
    cb({ uid, familyName: String(snap.get('familyName') ?? '').slice(0, 30), players })
  }, () => cb(null)))
}

export async function publishShowcase(uid: string, player: { id: string; name: string; species: string }, pets: PetInstance[]) {
  const { db, fs } = await getFirebase()
  await fs.setDoc(fs.doc(db, 'showcase', uid), {
    players: { [player.id]: { name: player.name, species: player.species, pets: pets.map(petOnly) } },
    updatedAt: fs.serverTimestamp(),
  }, { merge: true })
}

export async function unpublishPlayer(uid: string, playerId: string) {
  const { db, fs } = await getFirebase()
  await fs.updateDoc(fs.doc(db, 'showcase', uid), { [`players.${playerId}`]: fs.deleteField() }).catch(() => {})
}

/* ---------- trades ---------- */
function readSide(raw: any): TradeSide {
  return { uid: String(raw?.uid ?? ''), playerId: String(raw?.playerId ?? ''), name: String(raw?.name ?? '').slice(0, 20), species: String(raw?.species ?? 'tripup'), pets: sanitizePets(raw?.pets) }
}

export function watchTrades(uid: string, cb: (list: Trade[]) => void) {
  return watch(({ db, fs }) => fs.onSnapshot(
    fs.query(fs.collection(db, 'trades'), fs.where('members', 'array-contains', uid)),
    (snap) => cb(snap.docs.map((d) => {
      const x = d.data()
      return { id: d.id, members: x.members, from: readSide(x.from), to: readSide(x.to), status: x.status as TradeStatus }
    })),
    () => {},
  ))
}

export async function sendOffer(from: TradeSide, to: TradeSide) {
  const { db, fs } = await getFirebase()
  const side = (s: TradeSide) => ({ ...s, pets: s.pets.map(petOnly) })
  await fs.addDoc(fs.collection(db, 'trades'), {
    members: [from.uid, to.uid], from: side(from), to: side(to), status: 'offered',
    createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp(),
  })
}

/** Accepts an offer. `myPets` are the current versions of the requested pets, so the other kid gets them as they are now. */
export async function acceptOffer(id: string, myPets: PetInstance[]) {
  const { db, fs } = await getFirebase()
  const ref = fs.doc(db, 'trades', id)
  await fs.runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists() || snap.get('status') !== 'offered') throw new SocialError('offer-gone')
    tx.update(ref, { status: 'accepted', 'to.pets': myPets.map(petOnly), updatedAt: fs.serverTimestamp() })
  })
}

export async function setTradeStatus(id: string, status: Extract<TradeStatus, 'declined' | 'cancelled' | 'done'>) {
  const { db, fs } = await getFirebase()
  await fs.updateDoc(fs.doc(db, 'trades', id), { status, updatedAt: fs.serverTimestamp() })
}

export async function deleteTrade(id: string) {
  const { db, fs } = await getFirebase()
  await fs.deleteDoc(fs.doc(db, 'trades', id))
}
