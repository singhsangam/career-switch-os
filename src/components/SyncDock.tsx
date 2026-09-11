import { useEffect, useState, type FormEvent } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'
import { isValidSyncCode, normalizeSyncCode } from '../lib/schema'

export function SyncDock() {
  const syncId = useJourneyStore((s) => s.syncId)
  const userEmail = useJourneyStore((s) => s.userEmail)
  const userId = useJourneyStore((s) => s.userId)
  const syncStatus = useJourneyStore((s) => s.syncStatus)
  const syncError = useJourneyStore((s) => s.syncError)
  const lastSyncedAt = useJourneyStore((s) => s.lastSyncedAt)
  const ensureSyncId = useJourneyStore((s) => s.ensureSyncId)
  const linkSyncCode = useJourneyStore((s) => s.linkSyncCode)
  const syncNow = useJourneyStore((s) => s.syncNow)
  const initAuth = useJourneyStore((s) => s.initAuth)
  const signInEmail = useJourneyStore((s) => s.signInEmail)
  const signInGoogle = useJourneyStore((s) => s.signInGoogle)
  const signOutUser = useJourneyStore((s) => s.signOutUser)

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const unsub = initAuth()
    ensureSyncId()
    return unsub
  }, [initAuth, ensureSyncId])

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

  const statusLabel = userId
    ? syncStatus === 'synced'
      ? 'Signed in · Synced'
      : syncStatus === 'syncing'
        ? 'Syncing…'
        : syncStatus === 'error'
          ? 'Sync issue'
          : 'Signed in'
    : syncStatus === 'unconfigured'
      ? 'Cloud not linked'
      : 'Sign in to sync'

  async function onEmail(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await signInEmail(email)
      setMsg('Check your email for the login link — open it on this device.')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not send login email')
    } finally {
      setBusy(false)
    }
  }

  async function onGoogle() {
    setBusy(true)
    setMsg(null)
    try {
      await signInGoogle()
    } catch (err) {
      setMsg(
        err instanceof Error
          ? err.message
          : 'Google sign-in failed. Enable Google provider in Supabase Auth.',
      )
      setBusy(false)
    }
  }

  async function copyCode() {
    const id = ensureSyncId()
    try {
      await navigator.clipboard.writeText(id)
    } catch {
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
      setMsg('Devices linked via sync code.')
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
        className={`sync-pill status-${userId ? syncStatus : 'unconfigured'}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dot" />
        {statusLabel}
      </button>

      {open && (
        <div className="sync-panel">
          <h3>Account sync</h3>
          <p className="muted">
            Chrome having the same Google profile does <strong>not</strong> sync
            this app by itself. Sign in here with the <strong>same email</strong>{' '}
            on phone and laptop — then progress stays shared automatically.
          </p>

          {!isSyncConfigured() && (
            <p className="warn-box">
              This build has no cloud keys. Redeploy with Supabase secrets.
            </p>
          )}

          {userId ? (
            <div className="auth-signed-in">
              <p>
                Signed in as <strong>{userEmail ?? 'account'}</strong>
              </p>
              <div className="actions">
                <button
                  type="button"
                  className="btn primary compact"
                  onClick={() => void syncNow()}
                  disabled={busy}
                >
                  Sync now
                </button>
                <button
                  type="button"
                  className="btn ghost compact"
                  onClick={() => void signOutUser()}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <form className="rh-form" onSubmit={onEmail}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                />
                <button
                  className="btn primary compact"
                  type="submit"
                  disabled={busy || !isSyncConfigured()}
                >
                  {busy ? 'Sending…' : 'Email link'}
                </button>
              </form>
              <button
                type="button"
                className="btn ghost"
                style={{ width: '100%', marginTop: '0.45rem' }}
                onClick={() => void onGoogle()}
                disabled={busy || !isSyncConfigured()}
              >
                Continue with Google
              </button>
            </>
          )}

          <button
            type="button"
            className="code-toggle"
            onClick={() => setShowCode((v) => !v)}
          >
            {showCode ? 'Hide' : 'Advanced'}: sync code fallback
          </button>

          {showCode && (
            <>
              <label className="field">
                Sync code
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
                  spellCheck={false}
                />
                <button className="btn ghost compact" type="submit" disabled={busy}>
                  Link
                </button>
              </form>
            </>
          )}

          {lastSyncedAt && (
            <p className="muted tiny">
              Last sync: {new Date(lastSyncedAt).toLocaleString()}
            </p>
          )}
          {syncError && <p className="error-text">{syncError}</p>}
          {msg && (
            <p
              className={
                msg.toLowerCase().includes('check your email') ||
                msg.toLowerCase().includes('linked')
                  ? 'ok-text'
                  : 'error-text'
              }
            >
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
