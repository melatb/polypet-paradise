/**
 * Security rules tests. They need the Firestore emulator, so run them with:
 *   npm run test:rules
 * (GitHub Actions runs these on every push.)
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment
const PIN = 'a'.repeat(64)
const player = (extra: Record<string, unknown> = {}) => ({ name: 'Mia', species: 'tripup', pinHash: null, state: { coins: 5 }, createdAt: 1, updatedAt: 1, ...extra })

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'polypet-rules-test', firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
})
afterAll(async () => { await env.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'invites/parent@example.com'), { invitedAt: 1 })
    await setDoc(doc(ctx.firestore(), 'invites/other@example.com'), { invitedAt: 1 })
    await setDoc(doc(ctx.firestore(), 'families/other/players/p9'), player())
  })
})

const parent = () => env.authenticatedContext('parent', { email: 'Parent@Example.com', email_verified: true }).firestore()

describe('invited, verified parent', () => {
  it('can create, read, update and delete their own players', async () => {
    const db = parent()
    await assertSucceeds(setDoc(doc(db, 'families/parent/players/p1'), player()))
    await assertSucceeds(getDoc(doc(db, 'families/parent/players/p1')))
    await assertSucceeds(updateDoc(doc(db, 'families/parent/players/p1'), { state: { coins: 9 }, updatedAt: 2 }))
    await assertSucceeds(updateDoc(doc(db, 'families/parent/players/p1'), { pinHash: PIN }))
    await assertSucceeds(deleteDoc(doc(db, 'families/parent/players/p1')))
  })
  it("can't read or write another family", async () => {
    const db = parent()
    await assertFails(getDoc(doc(db, 'families/other/players/p9')))
    await assertFails(setDoc(doc(db, 'families/other/players/p2'), player()))
  })
  it('can read only their own invite, and never write invites', async () => {
    const db = parent()
    await assertSucceeds(getDoc(doc(db, 'invites/parent@example.com')))
    await assertFails(getDoc(doc(db, 'invites/other@example.com')))
    await assertFails(setDoc(doc(db, 'invites/friend@example.com'), { invitedAt: 1 }))
  })
  it('rejects bad player data', async () => {
    const db = parent()
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player({ email: 'kid@example.com' })))
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player({ name: 'x'.repeat(21) })))
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player({ name: '' })))
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player({ pinHash: '1234' })))
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player({ state: 'lots of coins' })))
  })
})

describe('everyone else', () => {
  it('parent who has not confirmed their email is blocked', async () => {
    const db = env.authenticatedContext('parent', { email: 'parent@example.com', email_verified: false }).firestore()
    await assertFails(setDoc(doc(db, 'families/parent/players/p1'), player()))
    await assertFails(getDoc(doc(db, 'families/parent/players/p1')))
  })
  it('signed-in stranger who was not invited is blocked, even in their own family', async () => {
    const db = env.authenticatedContext('stranger', { email: 'stranger@example.com', email_verified: true }).firestore()
    await assertFails(setDoc(doc(db, 'families/stranger/players/p1'), player()))
    await assertFails(getDoc(doc(db, 'families/other/players/p9')))
  })
  it('signed-out visitor is blocked', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'families/other/players/p9')))
    await assertFails(getDoc(doc(db, 'invites/parent@example.com')))
  })
  it('nothing outside families and invites is open', async () => {
    await assertFails(setDoc(doc(parent(), 'anything/else'), { a: 1 }))
  })
})
