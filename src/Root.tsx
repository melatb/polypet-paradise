import { AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import App from './App'
import { useAccount } from './account/AccountProvider'
import { cloudStorage } from './account/players'
import { AccountSheet, ManageFamily, PlayerPicker } from './components/Account'
import { GameProvider } from './game/GameProvider'
import { localStorageBackend } from './game/storage'
import { SocialProvider } from './social/SocialProvider'
import { TradeProvider } from './social/TradeProvider'

/**
 * Picks where the game is saved: the cloud for a signed-in family's chosen player,
 * or this device for everyone else. Switching player remounts the game with that player's save.
 */
export function Root() {
  const acct = useAccount()
  const [sheet, setSheet] = useState<'account' | 'manage' | null>(null)
  const cloud = acct.status === 'ready' && acct.active && acct.uid ? { uid: acct.uid, pid: acct.active.id } : null
  const key = cloud ? `${cloud.uid}/${cloud.pid}` : 'local'
  const storage = useMemo(() => (cloud ? cloudStorage(cloud.uid, cloud.pid) : localStorageBackend), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if ('dispose' in storage) (storage as { dispose(): void }).dispose() }, [storage])

  const sheets = (
    <AnimatePresence>
      {sheet === 'account' && <AccountSheet key="acct" onClose={() => setSheet(null)} onManage={() => setSheet('manage')} />}
      {sheet === 'manage' && <ManageFamily key="manage" onClose={() => setSheet(null)} />}
    </AnimatePresence>
  )

  if (acct.status === 'loading') return <div className="loading">Loading…</div>
  return (
    <SocialProvider>
      {acct.status === 'ready' && !acct.active
        ? <PlayerPicker onManage={() => setSheet('manage')} />
        : <GameProvider key={key} storage={storage}>
            <TradeProvider>
              <App onAccount={() => setSheet('account')} />
            </TradeProvider>
          </GameProvider>}
      {sheets}
    </SocialProvider>
  )
}
