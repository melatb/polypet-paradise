import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAccount } from '../account/AccountProvider'
import * as api from './api'
import { otherMember, type Friendship, type Showcase } from './model'

export interface FriendFamily {
  friendshipId: string
  uid: string
  familyName: string
}

export interface SocialApi {
  uid: string
  familyName: string
  friendCode: string | null
  friends: FriendFamily[]
  /** Requests other families sent us, waiting for a grown-up here. */
  incoming: FriendFamily[]
  /** Requests we sent, waiting for the other family. */
  outgoing: FriendFamily[]
  /** Pets on show: our own family (for siblings) and each friend family. */
  showcases: Record<string, Showcase>
  setFamilyName: (name: string) => Promise<void>
  makeCode: () => Promise<string>
  addFriend: (code: string) => Promise<'sent' | 'accepted'>
  accept: (friendshipId: string) => Promise<void>
  remove: (friendshipId: string) => Promise<void>
}

/** Exported for previews and tests; app code should use the hook. */
export const SocialContext = createContext<SocialApi | null>(null)
const Ctx = SocialContext

/** Family-level friends. Only active for a signed-in, invited family; otherwise useSocial() returns null. */
export function SocialProvider({ children }: { children: ReactNode }) {
  const acct = useAccount()
  const uid = acct.status === 'ready' ? acct.uid : null
  return uid ? <SocialInner uid={uid}>{children}</SocialInner> : <Ctx.Provider value={null}>{children}</Ctx.Provider>
}

function SocialInner({ uid, children }: { uid: string; children: ReactNode }) {
  const [family, setFamily] = useState<api.FamilySettings>({ familyName: '', friendCode: null })
  const [links, setLinks] = useState<Friendship[]>([])
  const [showcases, setShowcases] = useState<Record<string, Showcase>>({})

  useEffect(() => api.watchFamily(uid, setFamily), [uid])
  useEffect(() => api.watchFriendships(uid, setLinks), [uid])

  const friendUids = links.filter((l) => l.status === 'accepted').map((l) => otherMember(l.members, uid)).sort()
  const watchKey = [uid, ...friendUids].join(',')
  useEffect(() => {
    const stops = watchKey.split(',').map((u) => api.watchShowcase(u, (s) => setShowcases((all) => {
      const next = { ...all }
      if (s) next[u] = s; else delete next[u]
      return next
    })))
    return () => stops.forEach((stop) => stop())
  }, [watchKey])

  const value = useMemo<SocialApi>(() => {
    const view = (l: Friendship): FriendFamily => {
      const other = otherMember(l.members, uid)
      return { friendshipId: l.id, uid: other, familyName: showcases[other]?.familyName || l.names?.[other] || 'A friend family' }
    }
    const name = family.familyName
    return {
      uid,
      familyName: name,
      friendCode: family.friendCode,
      friends: links.filter((l) => l.status === 'accepted').map(view).sort((a, b) => a.familyName.localeCompare(b.familyName)),
      incoming: links.filter((l) => l.status === 'pending' && l.requestedBy !== uid).map(view),
      outgoing: links.filter((l) => l.status === 'pending' && l.requestedBy === uid).map(view),
      showcases,
      setFamilyName: (n) => api.saveFamilyName(uid, n),
      makeCode: () => api.newFriendCode(uid, family.friendCode),
      addFriend: (code) => api.addFriendByCode(uid, name, code),
      accept: (id) => api.acceptFriend(uid, name, id),
      remove: (id) => api.removeFriendship(id),
    }
  }, [uid, family, links, showcases])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useSocial = () => useContext(Ctx)
