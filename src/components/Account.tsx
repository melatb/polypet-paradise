import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { friendlyError, useAccount } from '../account/AccountProvider'
import { hashPin, type Player } from '../account/players'
import { SPECIES, SPECIES_BY_ID } from '../game/catalog'
import { localStorageBackend } from '../game/storage'
import type { GameState } from '../game/types'
import { PetArt } from '../pets/PetArt'

const PLAIN = { paint: 'natural', hat: 'none', neck: 'none' } as const
const IMPORTED_KEY = 'polypet-local-imported'

function Avatar({ species, size = 72 }: { species: string; size?: number }) {
  const sp = SPECIES_BY_ID[species] ?? SPECIES[0]
  return <span className="avatar" style={{ width: size, height: size }}><PetArt species={sp} stage={0} look={PLAIN} /></span>
}

function Sheet({ title, sub, onClose, children, wide }: { title: string; sub?: string; onClose?: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!onClose) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => { if (onClose && e.target === e.currentTarget) onClose() }}>
      <motion.div className={'sheet' + (wide ? ' map' : '')} role="dialog" aria-modal="true" aria-label={title}
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
        <div className="sheet-head">
          <div><div className="tt">{title}</div>{sub && <div className="ts">{sub}</div>}</div>
          {onClose && <button className="x" onClick={onClose} aria-label="Close">✕</button>}
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function useBusy() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const run = async (fn: () => Promise<unknown>, okNote = '') => {
    setBusy(true); setError(''); setNote('')
    try { await fn(); if (okNote) setNote(okNote) } catch (e) { setError(friendlyError(e)) } finally { setBusy(false) }
  }
  return { busy, error, note, run, setError }
}

/* ---------- Grown-up sign in / sign up ---------- */
function SignInForm() {
  const acct = useAccount()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const b = useBusy()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void b.run(() => (mode === 'in' ? acct.signIn(email, pw) : acct.signUp(email, pw)))
  }
  return (
    <>
      <p className="acct-p">For grown-ups. A family account saves each kid's pets and progress to the cloud, so they can play on any device. It's invitation-only.</p>
      <div className="seg">
        <button className={mode === 'in' ? 'on' : ''} onClick={() => setMode('in')} type="button">Sign in</button>
        <button className={mode === 'up' ? 'on' : ''} onClick={() => setMode('up')} type="button">Create account</button>
      </div>
      <form className="acct-form" onSubmit={submit}>
        <label className="field"><span>Email</span><input id="acct-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="field"><span>Password{mode === 'up' ? ' (at least 6 characters)' : ''}</span>
          <input id="acct-pw" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {b.error && <div className="fb-box fb-bad">{b.error}</div>}
        {b.note && <div className="fb-box fb-good">{b.note}</div>}
        <button className="btn big" type="submit" disabled={b.busy}>{b.busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
        {mode === 'in' && (
          <button type="button" className="linkish" disabled={b.busy} onClick={() => {
            if (!email) { b.setError('Type your email above first, then tap “Forgot password?”.'); return }
            void b.run(() => acct.resetPassword(email), `We sent a password reset link to ${email}.`)
          }}>Forgot password?</button>
        )}
      </form>
    </>
  )
}

/** The account sheet opened from the top bar. What it shows depends on the account status. */
export function AccountSheet({ onClose, onManage }: { onClose: () => void; onManage: () => void }) {
  const acct = useAccount()
  const b = useBusy()
  if (acct.status === 'guest') return <Sheet title="Family sign-in" onClose={onClose}><SignInForm /></Sheet>
  if (acct.status === 'unverified') return (
    <Sheet title="Check your email" onClose={onClose}>
      <p className="acct-p">We sent a link to <b>{acct.email}</b>. Open it to confirm your email, then come back and tap the button below.</p>
      {b.error && <div className="fb-box fb-bad">{b.error}</div>}
      {b.note && <div className="fb-box fb-good">{b.note}</div>}
      <button className="btn big" disabled={b.busy} onClick={() => void b.run(acct.recheck)}>I’ve confirmed my email</button>
      <div className="sheet-actions">
        <button className="btn sm white" disabled={b.busy} onClick={() => void b.run(acct.resendVerification, 'Sent again. Check your spam folder too.')}>Send the link again</button>
        <button className="btn sm white" onClick={() => void acct.signOut()}>Sign out</button>
      </div>
    </Sheet>
  )
  if (acct.status === 'notInvited') return (
    <Sheet title="Not on the family list yet" onClose={onClose}>
      <p className="acct-p">Polypet Paradise is invitation-only. <b>{acct.email}</b> hasn’t been added yet. Ask the person who runs your family’s game to add this email, then tap “Check again”.</p>
      <p className="acct-p small">You can keep playing on this device in the meantime.</p>
      <button className="btn big" disabled={b.busy} onClick={() => void b.run(acct.recheck)}>Check again</button>
      <div className="sheet-actions"><button className="btn sm white" onClick={() => void acct.signOut()}>Sign out</button></div>
    </Sheet>
  )
  return (
    <Sheet title={acct.active ? `Playing as ${acct.active.name}` : 'Family'} sub={`Signed in as ${acct.email}`} onClose={onClose}>
      <button className="btn big" onClick={() => { acct.choosePlayer(null); onClose() }}>Switch player</button>
      <div className="sheet-actions">
        <button className="btn sm white" onClick={onManage}>Manage family (grown-ups)</button>
        <button className="btn sm white" onClick={() => { void acct.signOut(); onClose() }}>Sign out</button>
      </div>
    </Sheet>
  )
}

/* ---------- PIN pad ---------- */
function PinPad({ title, onDone, onCancel, check }: { title: string; onDone: (pin: string) => void; onCancel: () => void; check?: (pin: string) => Promise<boolean> }) {
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)
  const press = async (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next); setWrong(false)
    if (next.length === 4) {
      if (!check || (await check(next))) onDone(next)
      else { setWrong(true); setTimeout(() => setPin(''), 400) }
    }
  }
  return (
    <Sheet title={title} onClose={onCancel}>
      <motion.div className="pin-dots" animate={wrong ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} aria-live="polite">
        {[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? 'on' : ''} />)}
        {wrong && <span className="sr">Wrong PIN</span>}
      </motion.div>
      {wrong && <p className="acct-p center">That PIN isn’t right. Try again.</p>}
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} className="pin-key" onClick={() => void press(d)}>{d}</button>)}
        <span />
        <button className="pin-key" onClick={() => void press('0')}>0</button>
        <button className="pin-key small" onClick={() => setPin(pin.slice(0, -1))} aria-label="Delete">⌫</button>
      </div>
    </Sheet>
  )
}

/* ---------- Add a player ---------- */
const AVATARS = ['tripup', 'cubbycat', 'rhombun', 'parafox', 'pentapeng', 'traptur']
function AddPlayer({ onClose }: { onClose: () => void }) {
  const acct = useAccount()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState(AVATARS[0])
  const [pin, setPin] = useState('')
  const [local, setLocal] = useState<GameState | null>(null)
  const [useLocal, setUseLocal] = useState(false)
  const b = useBusy()
  useEffect(() => {
    let imported = false
    try { imported = localStorage.getItem(IMPORTED_KEY) === '1' } catch { /* ignore */ }
    void localStorageBackend.load().then((s) => { if (s && (s.correct > 0 || s.pets.length > 1)) { setLocal(s); setUseLocal(!imported) } })
  }, [])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { b.setError('Type a name first.'); return }
    if (pin && !/^\d{4}$/.test(pin)) { b.setError('A PIN is exactly 4 numbers, or leave it empty.'); return }
    void b.run(async () => {
      const p = await acct.addPlayer({ name: name.trim().slice(0, 20), species, pin: pin || null, state: useLocal ? local : null })
      if (useLocal) { try { localStorage.setItem(IMPORTED_KEY, '1') } catch { /* ignore */ } }
      acct.choosePlayer(p.id)
      onClose()
    })
  }
  return (
    <Sheet title="Add a player" sub="Use a first name or nickname. Please don't use full names." onClose={onClose}>
      <form className="acct-form" onSubmit={submit}>
        <label className="field"><span>Name</span><input id="new-name" maxLength={20} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="field"><span>Picture</span>
          <div className="avatar-pick">
            {AVATARS.map((s) => (
              <button key={s} type="button" className={'avatar-opt' + (s === species ? ' on' : '')} onClick={() => setSpecies(s)} aria-pressed={s === species} aria-label={SPECIES_BY_ID[s].name}>
                <Avatar species={s} size={56} />
              </button>
            ))}
          </div>
        </div>
        <label className="field"><span>PIN (optional, 4 numbers)</span>
          <input id="new-pin" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></label>
        {local && (
          <label className="check"><input id="new-import" type="checkbox" checked={useLocal} onChange={(e) => setUseLocal(e.target.checked)} />
            <span>Start with the progress saved on this device ({local.pets.length} pet{local.pets.length === 1 ? '' : 's'}, {local.coins} coins)</span></label>
        )}
        {b.error && <div className="fb-box fb-bad">{b.error}</div>}
        <button className="btn big" type="submit" disabled={b.busy}>{b.busy ? 'Adding…' : 'Add player'}</button>
      </form>
    </Sheet>
  )
}

/* ---------- Who's playing? ---------- */
export function PlayerPicker({ onManage }: { onManage: () => void }) {
  const acct = useAccount()
  const [adding, setAdding] = useState(acct.players.length === 0)
  const [pinFor, setPinFor] = useState<Player | null>(null)
  return (
    <div className="picker">
      <h1 className="logo big-logo">Polypet Paradise</h1>
      <div className="panel picker-card">
        <h2 className="h3">Who’s playing?</h2>
        <div className="picker-grid">
          {acct.players.map((p) => (
            <motion.button key={p.id} className="picker-player" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}
              onClick={() => (p.pinHash ? setPinFor(p) : acct.choosePlayer(p.id))}>
              <Avatar species={p.species} size={96} />
              <span className="pp-name">{p.name}</span>
              {p.pinHash && <span className="pp-lock" aria-label="Has a PIN">🔒</span>}
            </motion.button>
          ))}
          <motion.button className="picker-player add" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} onClick={() => setAdding(true)}>
            <span className="pp-plus">+</span><span className="pp-name">Add player</span>
          </motion.button>
        </div>
        <div className="sheet-actions center">
          <button className="btn sm white" onClick={onManage}>Manage family (grown-ups)</button>
          <button className="btn sm white" onClick={() => void acct.signOut()}>Sign out</button>
        </div>
      </div>
      <AnimatePresence>
        {adding && <AddPlayer key="add" onClose={() => setAdding(false)} />}
        {pinFor && (
          <PinPad key="pin" title={`${pinFor.name}'s PIN`} onCancel={() => setPinFor(null)}
            check={async (pin) => (await hashPin(pinFor.id, pin)) === pinFor.pinHash}
            onDone={() => { acct.choosePlayer(pinFor.id); setPinFor(null) }} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Manage family (behind the parent's password) ---------- */
export function ManageFamily({ onClose }: { onClose: () => void }) {
  const acct = useAccount()
  const [unlocked, setUnlocked] = useState(false)
  const [pw, setPw] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [pinFor, setPinFor] = useState<Player | null>(null)
  const b = useBusy()
  if (!unlocked) return (
    <Sheet title="Grown-ups only" sub={`Enter the password for ${acct.email}`} onClose={onClose}>
      <form className="acct-form" onSubmit={(e) => { e.preventDefault(); void b.run(async () => { await acct.confirmPassword(pw); setUnlocked(true) }) }}>
        <label className="field"><span>Password</span><input id="gate-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {b.error && <div className="fb-box fb-bad">{b.error}</div>}
        <button className="btn big" type="submit" disabled={b.busy}>Continue</button>
      </form>
    </Sheet>
  )
  return (
    <>
      <Sheet title="Manage family" sub={`Signed in as ${acct.email}`} onClose={onClose}>
        {acct.players.length === 0 && <p className="acct-p">No players yet.</p>}
        <div className="manage-list">
          {acct.players.map((p) => (
            <div key={p.id} className="manage-row">
              <Avatar species={p.species} size={48} />
              <span className="pp-name">{p.name}</span>
              <div className="manage-actions">
                <button className="btn sm white" onClick={() => setPinFor(p)}>{p.pinHash ? 'Change PIN' : 'Add PIN'}</button>
                {p.pinHash && <button className="btn sm white" disabled={b.busy} onClick={() => void b.run(() => acct.changePin(p.id, null), `Removed ${p.name}'s PIN.`)}>Remove PIN</button>}
                {confirmDelete === p.id
                  ? <button className="btn sm danger" disabled={b.busy} onClick={() => void b.run(async () => { await acct.removePlayer(p.id); setConfirmDelete(null) }, `Deleted ${p.name}.`)}>Delete {p.name} and all their pets</button>
                  : <button className="btn sm white" onClick={() => setConfirmDelete(p.id)}>Delete…</button>}
              </div>
            </div>
          ))}
        </div>
        {b.error && <div className="fb-box fb-bad">{b.error}</div>}
        {b.note && <div className="fb-box fb-good">{b.note}</div>}
        <div className="sheet-actions"><button className="btn sm white" onClick={() => { void acct.signOut(); onClose() }}>Sign out of this device</button></div>
      </Sheet>
      <AnimatePresence>
        {pinFor && <PinPad key="setpin" title={`New PIN for ${pinFor.name}`} onCancel={() => setPinFor(null)}
          onDone={(pin) => { const p = pinFor; setPinFor(null); void b.run(() => acct.changePin(p.id, pin), `Saved ${p.name}'s new PIN.`) }} />}
      </AnimatePresence>
    </>
  )
}

/** Top-bar button: "Family sign-in" for guests, the current player's picture when signed in. */
export function FamilyPill({ onOpen }: { onOpen: () => void }) {
  const acct = useAccount()
  if (acct.status === 'off' || acct.status === 'loading') return null
  const p = acct.active
  return (
    <motion.button className="pill family-pill" onClick={onOpen} whileTap={{ scale: 0.95 }} title={p ? 'Switch player or sign out' : 'Family sign-in'}>
      {p ? <><Avatar species={p.species} size={30} /><span className="fp-name">{p.name}</span></>
        : <><svg className="ico" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#FFD23F" stroke="#1E2A4A" strokeWidth="2" /><circle cx="18" cy="10" r="3.2" fill="#FF8FC1" stroke="#1E2A4A" strokeWidth="2" /><path d="M2 22c0-5 4-8 7-8s7 3 7 8M13 21c0-4 2.5-6.5 5-6.5s5.5 2.5 5.5 6.5" fill="none" stroke="#1E2A4A" strokeWidth="2" strokeLinecap="round" /></svg>
          <span className="fp-name">{acct.status === 'guest' ? 'Family sign-in' : 'Account'}</span></>}
    </motion.button>
  )
}
