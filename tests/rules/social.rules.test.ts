/**
 * Security rules tests for friends and trading. Run with: npm run test:rules (GitHub Actions runs them on every push).
 * Families: "ana" and "ben" are invited; "cy" is invited but not their friend; "zed" was never invited.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment
const pet = { id: 'p1', species: 'tripup', stage: 0, prog: 0, need: 0, look: { paint: 'natural', hat: 'none', neck: 'bib' } }
const side = (uid: string, extra: Record<string, unknown> = {}) => ({ uid, playerId: `${uid}-kid`, name: 'Kid', species: 'tripup', pets: [pet], ...extra })
const offer = (from: string, to: string, extra: Record<string, unknown> = {}) => ({ members: [from, to], from: side(from), to: side(to), status: 'offered', createdAt: 1, updatedAt: 1, ...extra })

const who = (uid: string) => env.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: true }).firestore()

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'polypet-rules-test', firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
})
afterAll(async () => { await env.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const u of ['ana', 'ben', 'cy']) await setDoc(doc(db, `invites/${u}@example.com`), { invitedAt: 1 })
    await setDoc(doc(db, 'friendCodes/BENCODE2'), { uid: 'ben', createdAt: 1 })
    await setDoc(doc(db, 'showcase/ben'), { familyName: 'Ben family', players: {} })
  })
})

async function makeFriends() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'friendships/ana_ben'), { members: ['ana', 'ben'], requestedBy: 'ana', status: 'accepted', names: { ana: 'Ana family', ben: 'Ben family' }, code: 'BENCODE2', createdAt: 1 })
  })
}
async function seedTrade(status: string, from = 'ana', to = 'ben') {
  await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), 'trades/t1'), offer(from, to, { status })) })
}

describe('family settings and friend codes', () => {
  it('a family can save its own name and code, but not another family’s', async () => {
    await assertSucceeds(setDoc(doc(who('ana'), 'families/ana'), { familyName: 'Ana family', friendCode: 'ANACODE2', updatedAt: 1 }))
    await assertFails(setDoc(doc(who('ana'), 'families/ana'), { familyName: 'x'.repeat(31) }))
    await assertFails(setDoc(doc(who('ana'), 'families/ana'), { familyName: 'Ana', email: 'a@b.c' }))
    await assertFails(setDoc(doc(who('ana'), 'families/ben'), { familyName: 'Hacked' }))
    await assertFails(getDoc(doc(who('ana'), 'families/ben')))
  })
  it('codes can be created for yourself, looked up one at a time, never listed', async () => {
    await assertSucceeds(setDoc(doc(who('ana'), 'friendCodes/ANACODE2'), { uid: 'ana', createdAt: 1 }))
    await assertFails(setDoc(doc(who('ana'), 'friendCodes/ANACODE3'), { uid: 'ben', createdAt: 1 }))
    await assertFails(setDoc(doc(who('ana'), 'friendCodes/bad'), { uid: 'ana', createdAt: 1 }))
    await assertSucceeds(getDoc(doc(who('ana'), 'friendCodes/BENCODE2')))
    await assertFails(getDocs(collection(who('ana'), 'friendCodes')))
    await assertFails(deleteDoc(doc(who('ana'), 'friendCodes/BENCODE2')))
    await assertSucceeds(deleteDoc(doc(who('ben'), 'friendCodes/BENCODE2')))
  })
  it('people who were not invited cannot look up codes', async () => {
    const zed = env.authenticatedContext('zed', { email: 'zed@example.com', email_verified: true }).firestore()
    await assertFails(getDoc(doc(zed, 'friendCodes/BENCODE2')))
  })
})

describe('friend requests', () => {
  const request = (extra: Record<string, unknown> = {}) => ({ members: ['ana', 'ben'], requestedBy: 'ana', status: 'pending', names: { ana: 'Ana family' }, code: 'BENCODE2', createdAt: 1, ...extra })
  it('needs the other family’s real friend code', async () => {
    await assertSucceeds(setDoc(doc(who('ana'), 'friendships/ana_ben'), request()))
  })
  it('rejects wrong codes, wrong ids, pre-accepted or impersonated requests', async () => {
    const db = who('ana')
    await assertFails(setDoc(doc(db, 'friendships/ana_ben'), request({ code: 'WRONGCD2' })))
    await assertFails(setDoc(doc(db, 'friendships/ben_ana'), request({ members: ['ben', 'ana'] })))
    await assertFails(setDoc(doc(db, 'friendships/ana_ben'), request({ status: 'accepted' })))
    await assertFails(setDoc(doc(db, 'friendships/ana_ben'), request({ requestedBy: 'ben' })))
    await assertFails(setDoc(doc(db, 'friendships/ana_ben'), request({ names: { ana: 'Ana', ben: 'Fake' } })))
    await assertFails(setDoc(doc(who('cy'), 'friendships/ana_ben'), request()))
  })
  it('only the other family can accept, and only adds its own name', async () => {
    await assertSucceeds(setDoc(doc(who('ana'), 'friendships/ana_ben'), request()))
    await assertFails(updateDoc(doc(who('ana'), 'friendships/ana_ben'), { status: 'accepted' }))
    await assertFails(updateDoc(doc(who('ben'), 'friendships/ana_ben'), { status: 'accepted', 'names.ana': 'Renamed' }))
    await assertSucceeds(updateDoc(doc(who('ben'), 'friendships/ana_ben'), { status: 'accepted', 'names.ben': 'Ben family' }))
  })
  it('members can read, list and remove; others cannot', async () => {
    await makeFriends()
    await assertSucceeds(getDoc(doc(who('ben'), 'friendships/ana_ben')))
    await assertSucceeds(getDocs(query(collection(who('ana'), 'friendships'), where('members', 'array-contains', 'ana'))))
    await assertFails(getDoc(doc(who('cy'), 'friendships/ana_ben')))
    await assertFails(getDocs(collection(who('cy'), 'friendships')))
    await assertSucceeds(getDoc(doc(who('cy'), 'friendships/ana_cy'))) // not there yet: reveals nothing
    await assertFails(deleteDoc(doc(who('cy'), 'friendships/ana_ben')))
    await assertSucceeds(deleteDoc(doc(who('ben'), 'friendships/ana_ben')))
  })
})

describe('showcase', () => {
  it('only friends can see a family’s pets', async () => {
    await assertFails(getDoc(doc(who('ana'), 'showcase/ben')))
    await makeFriends()
    await assertSucceeds(getDoc(doc(who('ana'), 'showcase/ben')))
    await assertFails(getDoc(doc(who('cy'), 'showcase/ben')))
  })
  it('a family writes only its own showcase', async () => {
    await assertSucceeds(setDoc(doc(who('ana'), 'showcase/ana'), { familyName: 'Ana family', players: { k1: { name: 'Mia', species: 'tripup', pets: [pet] } }, updatedAt: 1 }))
    await assertFails(setDoc(doc(who('ana'), 'showcase/ana'), { players: {}, pinHash: 'x' }))
    await assertFails(setDoc(doc(who('ana'), 'showcase/ben'), { players: {} }))
  })
})

describe('trades', () => {
  it('friends and siblings can offer; strangers cannot', async () => {
    await assertFails(setDoc(doc(who('ana'), 'trades/t1'), offer('ana', 'ben')))
    await makeFriends()
    await assertSucceeds(setDoc(doc(who('ana'), 'trades/t1'), offer('ana', 'ben')))
    await assertSucceeds(setDoc(doc(who('ana'), 'trades/t2'), offer('ana', 'ana')))
    await assertFails(setDoc(doc(who('ana'), 'trades/t3'), offer('ana', 'cy')))
  })
  it('rejects offers sent in someone else’s name or already accepted', async () => {
    await makeFriends()
    const db = who('ana')
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ben', 'ana')))
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ana', 'ben', { status: 'accepted' })))
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ana', 'ben', { members: ['ana', 'cy'] })))
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ana', 'ben', { note: 'hi' })))
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ana', 'ben', { to: side('ben', { pets: [] }) })))
    await assertFails(setDoc(doc(db, 'trades/t1'), offer('ana', 'ben', { from: side('ana', { pets: [pet, pet, pet, pet, pet] }) })))
  })
  it('only the other kid’s family accepts or declines; only the sender cancels', async () => {
    await makeFriends()
    await seedTrade('offered')
    await assertFails(updateDoc(doc(who('ana'), 'trades/t1'), { status: 'accepted' }))
    await assertFails(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'cancelled' }))
    await assertFails(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'accepted', 'from.pets': [pet, pet] }))
    await assertSucceeds(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'accepted', 'to.pets': [{ ...pet, stage: 2 }], updatedAt: 2 }))
    await assertFails(updateDoc(doc(who('ana'), 'trades/t1'), { status: 'cancelled' })) // too late
    await assertFails(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'done' }))
    await assertSucceeds(updateDoc(doc(who('ana'), 'trades/t1'), { status: 'done', updatedAt: 3 }))
  })
  it('decline and cancel only work on open offers', async () => {
    await makeFriends()
    await seedTrade('offered')
    await assertSucceeds(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'declined' }))
    await assertFails(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'accepted', 'to.pets': [pet] }))
    await seedTrade('offered')
    await assertSucceeds(updateDoc(doc(who('ana'), 'trades/t1'), { status: 'cancelled' }))
  })
  it('an offer can’t be accepted after the families stop being friends', async () => {
    await seedTrade('offered')
    await assertFails(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'accepted', 'to.pets': [pet] }))
    await assertSucceeds(updateDoc(doc(who('ben'), 'trades/t1'), { status: 'declined' }))
  })
  it('only the two families see a trade, and only finished trades can be deleted', async () => {
    await makeFriends()
    await seedTrade('offered')
    await assertSucceeds(getDoc(doc(who('ben'), 'trades/t1')))
    await assertSucceeds(getDocs(query(collection(who('ben'), 'trades'), where('members', 'array-contains', 'ben'))))
    await assertFails(getDoc(doc(who('cy'), 'trades/t1')))
    await assertFails(deleteDoc(doc(who('ana'), 'trades/t1')))
    await seedTrade('done')
    await assertFails(deleteDoc(doc(who('cy'), 'trades/t1')))
    await assertSucceeds(deleteDoc(doc(who('ben'), 'trades/t1')))
  })
})
