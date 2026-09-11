import { useEffect, useState, type FormEvent } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'

export function SyncDock() {
  const syncId = useJourneyStore((s) => s.syncId)
  const syncStatus = useJourneyStore((s) => s.syncStatus)
  const syncError = useJourneyStore((s) => s.syncError)
  const lastSyncedAt = useJourneyStore((s) => s.lastSyncedAt)
  const ensureSyncId = useJourneyStore((s) => s.ensureSyncId)
  const linkSyncCode = useJourneyStore((s) => s.linkSyncCode)
  const syncNow = useJourneyStore((s) => s.syncNow)

  const [open, setOpen] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    ensureSyncId()
    if (isSyncConfigured()) {
      void syncNow()
    }
  }, [ensureSyncId, syncNow])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && isSyncConfigured()) {
        void syncNow()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [syncNow])

  const statusLabel =
    syncStatus === 'synced'
      ? 'Synced'
      : syncStatus === 'syncing'
        ? 'Syncing…'
        : syncStatus === 'offline'
          ? 'Offline'
          : syncStatus === 'error'
            ? 'Sync issue'
            : syncStatus === 'unconfigured'
              ? 'Cloud not linked'
              : 'Ready'

  async function copyCode() {
    const id = ensureSyncId()
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function onLink(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await linkSyncCode(linkInput)
      setMsg('Devices linked. Progress will stay in sync.')
      setLinkInput('')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not link')
    } finally {
      setBusy(false)
    }
  }

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
          <h3>Cross-device sync</h3>
          <p className="muted">
            Same sync code on phone and laptop = same journey. App updates on
            refresh never wipe your progress — catalog/code updates separately
            from your status.
          </p>

          {!isSyncConfigured() && (
            <p className="warn-box">
              Hosting is ready after env keys are set. Until then, progress
              still saves on this browser. Add{' '}
              <code>VITE_SUPABASE_URL</code> +{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> (see README) to enable phone ↔
              laptop sync worldwide.
            </p>
          )}

          <label className="field">
            Your sync code
            <div className="inline">
              <code className="sync-code">{syncId ?? '—'}</code>
              <button type="button" className="btn ghost compact" onClick={copyCode}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </label>

          <form className="rh-form" onSubmit={onLink}>
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste code from other device"
              autoCapitalize="characters"
            />
            <button className="btn primary compact" type="submit" disabled={busy}>
              Link
            </button>
          </form>

          <div className="actions">
            <button
              type="button"
              className="btn ghost compact"
              onClick={() => void syncNow()}
              disabled={!isSyncConfigured()}
            >
              Sync now
            </button>
          </div>

          {lastSyncedAt && (
            <p className="muted tiny">Last sync: {new Date(lastSyncedAt).toLocaleString()}</p>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
          {msg && <p className="ok-text">{msg}</p>}
        </div>
      )}
    </div>
  )
}
