/**
 * Firebase web config. These values are public by design (they ship in every Firebase web app);
 * access is controlled by the Firestore security rules in /firestore.rules.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyAWhB6OXUKJxYAv5lfg65sTPnt5O2cusoc',
  authDomain: 'polypet-paradise.firebaseapp.com',
  projectId: 'polypet-paradise',
  storageBucket: 'polypet-paradise.firebasestorage.app',
  messagingSenderId: '67842299721',
  appId: '1:67842299721:web:00b80214b51a3dfca62c98',
}

/** Accounts are off in the single-file Claude preview, which can't reach Firebase. */
export const ACCOUNTS_ENABLED = import.meta.env.MODE !== 'single'
