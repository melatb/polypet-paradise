import { useEffect, useState, type FormEvent } from 'react'
import { FAMILY_NAME_MAX, formatCode } from '../social/model'
import { useSocial } from '../social/SocialProvider'
import { tradeError } from './Trade'

/** Grown-ups only (inside Manage family): the family name, friend code and friend families. */
export function FriendsManager() {
  const social = useSocial()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')
  const savedName = social?.familyName ?? ''
  useEffect(() => setName(savedName), [savedName])
  if (!social) return null

  const run = async (fn: () => Promise<unknown>, ok = '') => {
    setBusy(true); setErr(''); setNote('')
    try { await fn(); if (ok) setNote(ok) } catch (e) { setErr(tradeError(e)) } finally { setBusy(false) }
  }
  const saveName = (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (n) void run(() => social.setFamilyName(n), 'Saved your family name.')
  }
  const sendCode = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => {
      const r = await social.addFriend(code)
      setCode('')
      setNote(r === 'accepted' ? 'You’re friends now! Your kids can trade.' : 'Request sent. It shows up for the other family’s grown-up in Manage family.')
    })
  }

  return (
    <div className="friends">
      <div>
        <h3 className="h3">Friends and trading</h3>
        <p className="acct-p small">Kids can trade pets with their brothers and sisters, and with friend families you add here. There’s no chat. Friend families see your kids’ first names and pets, and nothing else.</p>
      </div>

      <form className="friends-row" onSubmit={saveName}>
        <label className="field grow"><span>Family name (what friends see)</span>
          <input value={name} maxLength={FAMILY_NAME_MAX} placeholder="The Rivera family" onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="btn sm" type="submit" disabled={busy || !name.trim() || name.trim() === savedName}>Save</button>
      </form>

      <div className="friends-box">
        <h4 className="h4">Your friend code</h4>
        {!savedName
          ? <p className="acct-p small">Save a family name first.</p>
          : social.friendCode
            ? <>
                <div className="friends-row">
                  <span className="friend-code">{formatCode(social.friendCode)}</span>
                  <button className="btn sm white" type="button" onClick={() => void navigator.clipboard?.writeText(formatCode(social.friendCode!)).then(() => setNote('Copied the code.'), () => {})}>Copy</button>
                  <button className="btn sm white" type="button" disabled={busy} onClick={() => void run(() => social.makeCode(), 'Made a new code. The old one no longer works, but existing friends stay friends.')}>New code</button>
                </div>
                <p className="acct-p small">Give this code to a grown-up in a family you know, in person or by text. When they enter it, you’ll see their request here.</p>
              </>
            : <button className="btn sm" type="button" disabled={busy} onClick={() => void run(() => social.makeCode())}>Make a friend code</button>}
      </div>

      <form className="friends-box" onSubmit={sendCode}>
        <h4 className="h4">Add a friend family</h4>
        <div className="friends-row">
          <label className="field grow"><span>Their friend code</span>
            <input value={code} placeholder="ABCD-EFGH" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={9} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="btn sm" type="submit" disabled={busy || !code.trim() || !savedName}>Send request</button>
        </div>
      </form>

      {err && <div className="fb-box fb-bad">{err}</div>}
      {note && <div className="fb-box fb-good">{note}</div>}

      {social.incoming.length > 0 && (
        <div className="friends-box">
          <h4 className="h4">Friend requests</h4>
          {social.incoming.map((f) => (
            <div key={f.friendshipId} className="manage-row">
              <span className="pp-name">{f.familyName}</span>
              <div className="manage-actions">
                <button className="btn sm green" disabled={busy || !savedName} onClick={() => void run(() => social.accept(f.friendshipId), `You and ${f.familyName} are friends now.`)}>Accept</button>
                <button className="btn sm white" disabled={busy} onClick={() => void run(() => social.remove(f.friendshipId))}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(social.friends.length > 0 || social.outgoing.length > 0) && (
        <div className="friends-box">
          <h4 className="h4">Friend families</h4>
          {social.friends.map((f) => (
            <div key={f.friendshipId} className="manage-row">
              <span className="pp-name">{f.familyName}</span>
              <div className="manage-actions">
                {confirmRemove === f.friendshipId
                  ? <button className="btn sm danger" disabled={busy} onClick={() => void run(async () => { await social.remove(f.friendshipId); setConfirmRemove(null) }, `Removed ${f.familyName}.`)}>Stop trading with {f.familyName}</button>
                  : <button className="btn sm white" onClick={() => setConfirmRemove(f.friendshipId)}>Remove…</button>}
              </div>
            </div>
          ))}
          {social.outgoing.map((f) => (
            <div key={f.friendshipId} className="manage-row">
              <span className="pp-name">{f.familyName === 'A friend family' ? 'Request sent' : f.familyName}</span>
              <span className="sub">Waiting for them</span>
              <div className="manage-actions">
                <button className="btn sm white" disabled={busy} onClick={() => void run(() => social.remove(f.friendshipId))}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
