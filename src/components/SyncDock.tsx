import { useEffect, useState, type FormEvent } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'
import { isValidSyncCode, normalizeSyncCode } from '../lib/schema'

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
    const onFocus = () => {
      if (isSyncConfigured()) void syncNow()
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onFocus)
    }
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
    try {
      await navigator.clipboard.writeText(id)
    } catch {
      // Fallback for older mobile browsers
      const ta = document.createElement('textarea')
      ta.value = id
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function onLink(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const normalized = normalizeSyncCode(linkInput)
    if (!isValidSyncCode(normalized)) {
      setMsg('Code must look like RTD-XXXX-XXXX-XXXX')
      setBusy(false)
      return
    }
    try {
      await linkSyncCode(normalized)
      setMsg('Devices linked. Progress will stay in sync.')
      setLinkInput('')
      await syncNow()
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
            Use the <strong>same</strong> code on phone and laptop. Copy from
            one device, paste + Link on the other.
          </p>

          {!isSyncConfigured() && (
            <p className="warn-box">
              This build has no cloud keys. Redeploy with Supabase secrets, then
              hard-refresh.
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
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
            />
            <button
              className="btn primary compact"
              type="submit"
              disabled={busy || !isSyncConfigured()}
            >
              {busy ? 'Linking…' : 'Link'}
            </button>
          </form>

          <div className="actions">
            <button
              type="button"
              className="btn ghost compact"
              onClick={() => void syncNow()}
              disabled={!isSyncConfigured() || busy}
            >
              Sync now
            </button>
          </div>

          {lastSyncedAt && (
            <p className="muted tiny">
              Last sync: {new Date(lastSyncedAt).toLocaleString()}
            </p>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
          {msg && (
            <p className={msg.toLowerCase().includes('linked') ? 'ok-text' : 'error-text'}>
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
