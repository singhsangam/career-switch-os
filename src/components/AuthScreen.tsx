import { useEffect, useState, type FormEvent } from 'react'
import { useJourneyStore } from '../store/journeyStore'
import { isSyncConfigured } from '../lib/sync'

type Mode = 'signin' | 'signup' | 'otp'

/**
 * Full-page account gate — email+password is the reliable path for phone↔laptop.
 */
export function AuthScreen({ onSkip }: { onSkip: () => void }) {
  const userId = useJourneyStore((s) => s.userId)
  const initAuth = useJourneyStore((s) => s.initAuth)
  const signInPassword = useJourneyStore((s) => s.signInPassword)
  const signUpPassword = useJourneyStore((s) => s.signUpPassword)
  const sendOtp = useJourneyStore((s) => s.sendOtp)
  const verifyOtp = useJourneyStore((s) => s.verifyOtp)
  const signInGoogle = useJourneyStore((s) => s.signInGoogle)
  const syncNow = useJourneyStore((s) => s.syncNow)

  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
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
        setInfo('Account created and signed in. Your journey will sync to this email.')
      } else {
        await signInPassword(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  async function onSendOtp(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      await sendOtp(email)
      setOtpSent(true)
      setInfo('Code sent. Check your email inbox (and spam), then enter the 6–8 digit code here.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setBusy(false)
    }
  }

  async function onVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyOtp(email, otp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
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
          Use the <strong>same email + password</strong> on phone and laptop.
          That is what keeps progress in sync — not Chrome profiles alone.
        </p>

        {!isSyncConfigured() && (
          <p className="warn-box">Cloud keys missing in this build. Sync cannot work yet.</p>
        )}

        <div className="auth-tabs">
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
          <button
            type="button"
            className={mode === 'otp' ? 'active' : ''}
            onClick={() => {
              setMode('otp')
              setError(null)
              setInfo(null)
              setOtpSent(false)
            }}
          >
            Email code
          </button>
        </div>

        {(mode === 'signup' || mode === 'signin') && (
          <form className="auth-form" onSubmit={onPassword}>
            <label>
              Email
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
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
            <button className="btn primary" type="submit" disabled={busy || !isSyncConfigured()}>
              {busy
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create account & sync'
                  : 'Sign in & sync'}
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <div className="auth-form">
            {!otpSent ? (
              <form onSubmit={onSendOtp}>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                  />
                </label>
                <button className="btn primary" type="submit" disabled={busy || !isSyncConfigured()}>
                  {busy ? 'Sending…' : 'Send login code'}
                </button>
              </form>
            ) : (
              <form onSubmit={onVerifyOtp}>
                <label>
                  Code from email
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                </label>
                <button className="btn primary" type="submit" disabled={busy}>
                  {busy ? 'Verifying…' : 'Verify & sync'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                  }}
                >
                  Resend / change email
                </button>
              </form>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn ghost"
          style={{ width: '100%', marginTop: '0.75rem' }}
          disabled={busy || !isSyncConfigured()}
          onClick={() => void signInGoogle().catch((err) => setError(err.message))}
        >
          Continue with Google
        </button>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="ok-text">{info}</p>}

        <button type="button" className="skip-link" onClick={onSkip}>
          Continue without sync (this device only)
        </button>
      </div>
    </div>
  )
}
