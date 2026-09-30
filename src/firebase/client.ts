import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { ACCOUNTS_ENABLED, firebaseConfig } from './config'

export interface FirebaseClient {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  /** The Firestore and Auth function modules, so callers never import Firebase themselves (keeps it out of the preview build). */
  fs: typeof import('firebase/firestore')
  au: typeof import('firebase/auth')
}

let client: Promise<FirebaseClient> | null = null

/** Loads Firebase on first use, so players who never sign in don't download it. */
export function getFirebase(): Promise<FirebaseClient> {
  // Compile-time off in the Claude preview build, so Firebase isn't bundled there at all.
  if (!ACCOUNTS_ENABLED) return Promise.reject(new Error('Accounts are off in this build'))
  client ??= (async () => {
    const [{ initializeApp }, au, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
    const app = initializeApp(firebaseConfig)
    let db: Firestore
    try {
      // Offline cache: saves keep working without internet and sync when back online.
      // ignoreUndefinedProperties: game state can hold optional fields that are undefined.
      db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) })
    } catch {
      db = fs.getFirestore(app)
    }
    return { app, auth: au.getAuth(app), db, fs, au }
  })()
  return client
}
