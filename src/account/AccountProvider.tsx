import type { User } from 'firebase/auth'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getFirebase } from '../firebase/client'
import { ACCOUNTS_ENABLED } from '../firebase/config'
import type { GameState } from '../game/types'
import { createPlayer, deletePlayer, listPlayers, setPlayerPin, type Player } from './players'

/**
 * off        – accounts are disabled in this build (Claude preview): local play only
 * loading    – checking whether a parent is signed in
 * guest      – nobody signed in: local play on this device
 * unverified – a parent signed in but hasn't clicked the email link yet
 * notInvited – signed in, but this email isn't on the family invite list
 * ready      – signed in and invited: kids pick a profile
 */
export type AccountStatus = 'off' | 'loading' | 'guest' | 'unverified' | 'notInvited' | 'ready'

export interface AccountApi {
  status: AccountStatus
  email: string | null
  uid: string | null
  players: Player[]
  active: Player | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  recheck: () => Promise<void>
  signOut: () => Promise<void>
  /** Confirms the parent's password before grown-up actions (the "grown-up gate"). */
  confirmPassword: (password: string) => Promise<void>
  addPlayer: (input: { name: string; species: string; pin: string | null; state: GameState | null }) => Promise<Player>
  choosePlayer: (id: string | null) => void
  removePlayer: (id: string) => Promise<void>
  changePin: (id: string, pin: string | null) => Promise<void>
}

/** Exported for previews and tests; app code should use useAccount(). */
export const AccountContext = createContext<AccountApi | null>(null)
const Ctx = AccountContext
const activeKey = (uid: string) => `polypet-active-player:${uid}`
const readActive = (uid: string) => { try { return localStorage.getItem(activeKey(uid)) } catch { return null } }
const writeActive = (uid: string, id: string | null) => {
  try { if (id) localStorage.setItem(activeKey(uid), id); else localStorage.removeItem(activeKey(uid)) } catch { /* private mode */ }
}

/** Turns Firebase error codes into sentences a parent can act on. */
export function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address doesn’t look right.',
    'auth/missing-password': 'Enter a password.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/email-already-in-use': 'There’s already an account with that email. Try signing in instead.',
    'auth/invalid-credential': 'That email and password don’t match. Check them, or reset your password.',
    'auth/wrong-password': 'That password isn’t right.',
    'auth/user-not-found': 'No account uses that email yet.',
    'auth/too-many-requests': 'Too many tries. Wait a few minutes, then try again.',
    'auth/network-request-failed': 'Couldn’t reach the internet. Check your connection and try again.',
    'permission-denied': 'This account doesn’t have access yet.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>(ACCOUNTS_ENABLED ? 'loading' : 'off')
  const [user, setUser] = useState<User | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  /** Works out the status for a signed-in parent: verified? invited? then loads the players. */
  const evaluate = useCallback(async (u: User | null) => {
    setUser(u)
    if (!u) { setStatus('guest'); setPlayers([]); setActiveId(null); return }
    if (!u.emailVerified) { setStatus('unverified'); return }
    const { db, fs } = await getFirebase()
    try {
      // Refresh the token so the security rules see email_verified = true right after verifying.
      await u.getIdToken(true)
      const invite = await fs.getDoc(fs.doc(db, 'invites', (u.email ?? '').toLowerCase()))
      if (!invite.exists()) { setStatus('notInvited'); return }
      const list = await listPlayers(u.uid)
      setPlayers(list)
      const saved = readActive(u.uid)
      setActiveId(list.some((p) => p.id === saved) ? saved : null)
      setStatus('ready')
    } catch {
      setStatus('notInvited')
    }
  }, [])

  useEffect(() => {
    if (!ACCOUNTS_ENABLED) return
    let unsub = () => {}
    getFirebase().then(({ auth, au }) => {
      unsub = au.onAuthStateChanged(auth, (u) => void evaluate(u))
    }).catch(() => setStatus('guest'))
    return () => unsub()
  }, [evaluate])

  const api = useMemo<AccountApi>(() => ({
    status,
    email: user?.email ?? null,
    uid: user?.uid ?? null,
    players,
    active: players.find((p) => p.id === activeId) ?? null,
    async signUp(email, password) {
      const { auth, au } = await getFirebase()
      const cred = await au.createUserWithEmailAndPassword(auth, email.trim(), password)
      await au.sendEmailVerification(cred.user)
    },
    async signIn(email, password) {
      const { auth, au } = await getFirebase()
      await au.signInWithEmailAndPassword(auth, email.trim(), password)
    },
    async resetPassword(email) {
      const { auth, au } = await getFirebase()
      await au.sendPasswordResetEmail(auth, email.trim())
    },
    async resendVerification() {
      const { auth, au } = await getFirebase()
      if (auth.currentUser) await au.sendEmailVerification(auth.currentUser)
    },
    async recheck() {
      const { auth } = await getFirebase()
      await auth.currentUser?.reload()
      await evaluate(auth.currentUser)
    },
    async signOut() {
      const { auth, au } = await getFirebase()
      await au.signOut(auth)
    },
    async confirmPassword(password) {
      const { auth, au } = await getFirebase()
      const u = auth.currentUser
      if (!u?.email) throw new Error('Not signed in')
      await au.reauthenticateWithCredential(u, au.EmailAuthProvider.credential(u.email, password))
    },
    async addPlayer(input) {
      if (!user) throw new Error('Not signed in')
      const p = await createPlayer(user.uid, input)
      setPlayers((ps) => [...ps, p])
      return p
    },
    choosePlayer(id) {
      if (user) writeActive(user.uid, id)
      setActiveId(id)
    },
    async removePlayer(id) {
      if (!user) return
      await deletePlayer(user.uid, id)
      setPlayers((ps) => ps.filter((p) => p.id !== id))
      if (activeId === id) { writeActive(user.uid, null); setActiveId(null) }
    },
    async changePin(id, pin) {
      if (!user) return
      await setPlayerPin(user.uid, id, pin)
      setPlayers(await listPlayers(user.uid))
    },
  }), [status, user, players, activeId, evaluate])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useAccount() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAccount must be used inside <AccountProvider>')
  return v
}
