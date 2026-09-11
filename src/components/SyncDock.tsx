import { useEffect, useState } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'

/** Compact status pill once signed in; opens account details. */
export function SyncDock() {
  const userEmail = useJourneyStore((s) => s.userEmail)
  const userId = useJourneyStore((s) => s.userId)
  const syncStatus = useJourneyStore((s) => s.syncStatus)
  const syncError = useJourneyStore((s) => s.syncError)
  const lastSyncedAt = useJourneyStore((s) => s.lastSyncedAt)
  const syncNow = useJourneyStore((s) => s.syncNow)
  const initAuth = useJourneyStore((s) => s.initAuth)
  const signOutUser = useJourneyStore((s) => s.signOutUser)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [initAuth])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && isSyncConfigured() && userId) {
        void syncNow()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
    }
  }, [syncNow, userId])

  if (!userId) {
    return (
      <div className="sync-dock">
        <span className="sync-pill status-unconfigured">
          <span className="dot" />
          Not signed in
        </span>
      </div>
    )
  }

  const statusLabel =
    syncStatus === 'synced'
      ? 'Synced'
      : syncStatus === 'syncing'
        ? 'Syncing…'
        : syncStatus === 'error'
          ? 'Sync issue'
          : 'Signed in'

  return (
    <div className="sync-dock">
      <button
        type="button"
        className={`sync-pill status-${syncStatus}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dot" />
        {statusLabel}
      </button>

      {open && (
        <div className="sync-panel">
          <h3>Account</h3>
          <p className="muted">
            Signed in as <strong>{userEmail}</strong>. Use this same email on
            your other device.
          </p>
          <div className="actions">
            <button type="button" className="btn primary compact" onClick={() => void syncNow()}>
              Sync now
            </button>
            <button type="button" className="btn ghost compact" onClick={() => void signOutUser()}>
              Sign out
            </button>
          </div>
          {lastSyncedAt && (
            <p className="muted tiny">
              Last sync: {new Date(lastSyncedAt).toLocaleString()}
            </p>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
        </div>
      )}
    </div>
  )
}
