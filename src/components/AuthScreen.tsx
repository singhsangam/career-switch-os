import { useEffect, useState, type FormEvent } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'

type Mode = 'signup' | 'signin'

/**
 * Password auth does NOT need an email code.
 * Supabase free OTP mail often never arrives in Gmail — so we don't rely on it.
 */
export function AuthScreen({ onSkip }: { onSkip: () => void }) {
  const userId = useJourneyStore((s) => s.userId)
  const initAuth = useJourneyStore((s) => s.initAuth)
  const signInPassword = useJourneyStore((s) => s.signInPassword)
  const signUpPassword = useJourneyStore((s) => s.signUpPassword)
  const signInGoogle = useJourneyStore((s) => s.signInGoogle)
  const syncNow = useJourneyStore((s) => s.syncNow)

  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [initAuth])

  useEffect(() => {
    if (userId) void syncNow()
  }, [userId, syncNow])

  if (userId) return null

  async function onPassword(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signup') {
        await signUpPassword(email, password)
        setInfo('Signed in. Use this same email + password on your phone.')
      } else {
        await signInPassword(email, password)
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Authentication failed'
      if (/confirm|confirmation|verify/i.test(raw)) {
        setError(
          raw +
            ' Fix: In Supabase → Authentication → Providers → Email, turn Confirm email OFF, then try Create account again.',
        )
      } else if (/invalid login|invalid credentials/i.test(raw)) {
        setError(
          'Wrong email/password, or no account yet. Use Create account first (password), then Sign in on the other device.',
        )
      } else {
        setError(raw)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Road to December</p>
        <h1>Connect your account</h1>
        <p className="lead">
          <strong>Do not wait for an email code.</strong> Supabase free email
          often never reaches Gmail. Create a password here — sync works without
          OTP.
        </p>

        <div className="warn-box" style={{ marginBottom: '0.9rem' }}>
          How sync works: same <strong>email + password</strong> on laptop and
          phone. No OTP needed. No Chrome profile magic.
        </div>

        {!isSyncConfigured() && (
          <p className="warn-box">Cloud keys missing in this build. Sync cannot work yet.</p>
        )}

        <div className="auth-tabs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setError(null)
              setInfo(null)
            }}
          >
            Create account
          </button>
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => {
              setMode('signin')
              setError(null)
              setInfo(null)
            }}
          >
            Sign in
          </button>
        </div>

        <form className="auth-form" onSubmit={onPassword}>
          <label>
            Gmail / email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
          </label>
          <label>
            Password (you choose — min 6 chars)
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. road2026!"
            />
          </label>
          <button className="btn primary" type="submit" disabled={busy || !isSyncConfigured()}>
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account & start sync'
                : 'Sign in & sync'}
          </button>
        </form>

        <button
          type="button"
          className="btn ghost"
          style={{ width: '100%', marginTop: '0.75rem' }}
          disabled={busy || !isSyncConfigured()}
          onClick={() =>
            void signInGoogle().catch((err: Error) =>
              setError(
                err.message +
                  ' (Google provider may be disabled in Supabase. Password login still works.)',
              ),
            )
          }
        >
          Continue with Google (optional)
        </button>

        <p className="muted tiny" style={{ marginTop: '0.85rem' }}>
          Email OTP / magic link is disabled in this UI on purpose — those emails
          usually never arrive on free Supabase → Gmail.
        </p>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="ok-text">{info}</p>}

        <button type="button" className="skip-link" onClick={onSkip}>
          Continue without sync (this device only)
        </button>
      </div>
    </div>
  )
}
