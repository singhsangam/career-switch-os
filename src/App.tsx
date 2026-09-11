import { format, parseISO } from 'date-fns'
import { CHAPTERS, getChapter, getProblem, PROBLEMS, TOPIC_LABEL } from './data/neetcode150'
import {
  daysUntilMilestone,
  journeyMessage,
  missionForMode,
  projectedEndDate,
  weekStats,
} from './engine/schedule'
import {
  currentMissionSlot,
  revisionsDueToday,
  useJourneyStore,
} from './store/journeyStore'
import type { DayMode, ProblemStatus } from './types'
import { MILESTONE_DATE } from './types'
import { useMemo, useState, useEffect } from 'react'
import { SyncDock } from './components/SyncDock'
import { AuthScreen } from './components/AuthScreen'

type Tab = 'today' | 'journey' | 'week' | 'modules'

const STATUS_LABEL: Record<ProblemStatus, string> = {
  not_started: 'Not started',
  attempting: 'Attempting',
  solved_independent: 'Solved independently',
  solved_with_hint: 'Solved with hint',
  understood_after_explanation: 'Understood after explanation',
  needs_revision: 'Needs revision',
  mastered: 'Mastered',
}

function formatRange(start: string, end: string, buffer: string) {
  const a = format(parseISO(start), 'MMM d')
  const b = format(parseISO(end), 'MMM d')
  const c = format(parseISO(buffer), 'MMM d')
  return start === end ? `${a} · buffer to ${c}` : `${a}–${b} · buffer to ${c}`
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rhTitle, setRhTitle] = useState('')
  const [skipAuth, setSkipAuth] = useState(false)

  const userId = useJourneyStore((s) => s.userId)
  const initAuth = useJourneyStore((s) => s.initAuth)
  const dayMode = useJourneyStore((s) => s.dayMode)
  const setDayMode = useJourneyStore((s) => s.setDayMode)
  const progress = useJourneyStore((s) => s.progress)
  const schedule = useJourneyStore((s) => s.schedule)
  const modules = useJourneyStore((s) => s.modules)
  const rabbitHoles = useJourneyStore((s) => s.rabbitHoles)
  const updateProblem = useJourneyStore((s) => s.updateProblem)
  const logMinutes = useJourneyStore((s) => s.logMinutes)
  const addRabbitHole = useJourneyStore((s) => s.addRabbitHole)
  const removeRabbitHole = useJourneyStore((s) => s.removeRabbitHole)
  const recalculateRoute = useJourneyStore((s) => s.recalculateRoute)
  const percent = useJourneyStore((s) => s.getWeightedPercent())

  const slot = useMemo(
    () => currentMissionSlot(schedule, progress),
    [schedule, progress],
  )
  const revisions = useMemo(() => revisionsDueToday(progress), [progress])
  const mission = useMemo(
    () => missionForMode(dayMode, slot, revisions),
    [dayMode, slot, revisions],
  )
  const missionProblem = mission.problemId
    ? getProblem(mission.problemId)
    : undefined
  const missionSlot = mission.problemId
    ? schedule.find((s) => s.problemId === mission.problemId)
    : undefined
  const chapter = missionProblem
    ? getChapter(missionProblem.chapterId)
    : undefined

  const week = weekStats(schedule, progress)
  const projected = projectedEndDate(schedule)
  const message = journeyMessage({
    percent,
    projectedEnd: projected,
    daysShifted: 0,
  })

  const phase1Done = PROBLEMS.filter(
    (p) =>
      p.phase === 1 &&
      ['solved_independent', 'solved_with_hint', 'understood_after_explanation', 'mastered'].includes(
        progress[p.id]?.status ?? '',
      ),
  ).length
  const phase1Total = PROBLEMS.filter((p) => p.phase === 1).length

  const openProblem = selectedId ? getProblem(selectedId) : missionProblem
  const openProgress = openProblem ? progress[openProblem.id] : undefined
  const openSlot = openProblem
    ? schedule.find((s) => s.problemId === openProblem.id)
    : undefined

  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [initAuth])

  if (!userId && !skipAuth) {
    return <AuthScreen onSkip={() => setSkipAuth(true)} />
  }

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden />
      {!userId && skipAuth && (
        <button
          type="button"
          className="connect-banner"
          onClick={() => setSkipAuth(false)}
        >
          Not syncing yet — tap to create / sign in with email so phone and laptop share progress
        </button>
      )}
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">Career Switch OS · V1</p>
          <h1 className="brand">Road to December</h1>
        </div>
        <div className="topbar-right">
          <SyncDock />
          <div className="countdown">
            <span className="countdown-num">{daysUntilMilestone()}</span>
            <span className="countdown-label">days to DSA milestone</span>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Primary">
        {(
          [
            ['today', 'Today'],
            ['journey', 'Journey'],
            ['week', 'This week'],
            ['modules', 'Modules'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => {
              setTab(id)
              setSelectedId(null)
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'today' && !selectedId && (
        <main className="panel today-panel">
          <section className="hero-mission">
            <div className="hero-meta">
              <p className="where">Where you are</p>
              <h2>
                {chapter?.subtitle ?? 'Foundation'}
                <span className="muted">
                  {' '}
                  · {percent}% weighted · Phase 1 {phase1Done}/{phase1Total}
                </span>
              </h2>
            </div>

            <div className="mode-row">
              <span className="mode-label">Energy today</span>
              {(
                [
                  ['normal', 'Normal', '45–75 min'],
                  ['busy', 'Busy', '20–30 min'],
                  ['low', 'Low', '10–15 min'],
                ] as const
              ).map(([id, label, hint]) => (
                <button
                  key={id}
                  className={dayMode === id ? 'mode active' : 'mode'}
                  onClick={() => setDayMode(id as DayMode)}
                >
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>

            <article className="mission-card">
              <p className="mission-kicker">{mission.title}</p>
              {missionProblem ? (
                <>
                  <h3>{missionProblem.title}</h3>
                  <div className="mission-tags">
                    <span>{missionProblem.difficulty}</span>
                    <span>{TOPIC_LABEL[missionProblem.topic]}</span>
                    <span>{missionProblem.pattern}</span>
                    <span>
                      ~{Math.round(missionProblem.effortDays * 60)} min effort
                    </span>
                  </div>
                  {missionSlot && (
                    <p className="window">
                      Window:{' '}
                      <strong>
                        {formatRange(
                          missionSlot.recommendedStart,
                          missionSlot.recommendedEnd,
                          missionSlot.bufferEnd,
                        )}
                      </strong>
                    </p>
                  )}
                  <p className="why">
                    <strong>Why this?</strong> {missionProblem.whyThis}
                  </p>
                  <p className="detail">{mission.detail}</p>
                  <ol className="goals">
                    <li>Understand the pattern</li>
                    <li>Attempt independently</li>
                    <li>Record difficulty & confidence</li>
                    <li>Write one takeaway</li>
                    <li>Trust the revision schedule</li>
                  </ol>
                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={() => setSelectedId(missionProblem.id)}
                    >
                      Open mission
                    </button>
                    <a
                      className="btn ghost"
                      href={missionProblem.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on LeetCode
                    </a>
                  </div>
                  <p className="enough">That's enough for today.</p>
                </>
              ) : (
                <p className="detail">{mission.detail}</p>
              )}
            </article>

            <p className="route-note">{message}</p>
            <div className="track-strip">
              <div>
                <span className="strip-label">On track for</span>
                <strong>
                  {format(parseISO(MILESTONE_DATE), 'MMM d, yyyy')}
                </strong>
              </div>
              <div>
                <span className="strip-label">Projected finish</span>
                <strong>
                  {projected
                    ? format(parseISO(projected), 'MMM d, yyyy')
                    : '—'}
                </strong>
              </div>
              <button className="btn ghost compact" onClick={() => recalculateRoute()}>
                Recalculate route
              </button>
            </div>
          </section>
        </main>
      )}

      {(tab === 'today' && selectedId && openProblem) ||
      (tab !== 'today' && selectedId && openProblem) ? (
        <main className="panel detail-panel">
          <button className="back" onClick={() => setSelectedId(null)}>
            ← Back
          </button>
          <h2>{openProblem.title}</h2>
          <div className="mission-tags">
            <span>{openProblem.difficulty}</span>
            <span>{TOPIC_LABEL[openProblem.topic]}</span>
            <span>{openProblem.pattern}</span>
          </div>
          {openSlot && (
            <p className="window">
              {formatRange(
                openSlot.recommendedStart,
                openSlot.recommendedEnd,
                openSlot.bufferEnd,
              )}
            </p>
          )}
          <p className="why">{openProblem.whyThis}</p>

          <label className="field">
            Status
            <select
              value={openProgress?.status ?? 'not_started'}
              onChange={(e) =>
                updateProblem(openProblem.id, {
                  status: e.target.value as ProblemStatus,
                })
              }
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Confidence (1–5)
            <input
              type="range"
              min={1}
              max={5}
              value={openProgress?.confidence ?? 1}
              onChange={(e) =>
                updateProblem(openProblem.id, {
                  confidence: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                })
              }
            />
            <span className="conf-val">{openProgress?.confidence ?? 1}</span>
          </label>

          <label className="field">
            Minutes spent (add)
            <div className="inline">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  className="btn ghost compact"
                  onClick={() => logMinutes(openProblem.id, m)}
                >
                  +{m}m
                </button>
              ))}
              <span className="muted">
                Total: {openProgress?.minutesSpent ?? 0}m
              </span>
            </div>
          </label>

          <label className="field">
            One takeaway
            <textarea
              rows={3}
              value={openProgress?.takeaway ?? ''}
              onChange={(e) =>
                updateProblem(openProblem.id, { takeaway: e.target.value })
              }
              placeholder="What will you remember next time?"
            />
          </label>

          <label className="field">
            Notes
            <textarea
              rows={4}
              value={openProgress?.notes ?? ''}
              onChange={(e) =>
                updateProblem(openProblem.id, { notes: e.target.value })
              }
            />
          </label>

          <div className="recall-box">
            <h4>Active recall</h4>
            <ul>
              {openProblem.recallPrompts.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          {openProgress?.nextRevisionAt && (
            <p className="window">
              Next revision: {format(parseISO(openProgress.nextRevisionAt), 'MMM d')}
            </p>
          )}

          <div className="actions">
            <a
              className="btn primary"
              href={openProblem.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Solve on LeetCode
            </a>
            <a
              className="btn ghost"
              href="https://neetcode.io/practice/practice/neetcode150"
              target="_blank"
              rel="noreferrer"
            >
              NeetCode 150 (primary resource)
            </a>
          </div>
        </main>
      ) : null}

      {tab === 'journey' && !selectedId && (
        <main className="panel journey-panel">
          <header className="section-head">
            <h2>The road</h2>
            <p>
              Phase 1 Foundation → Checkpoint → Phase 2 Deepening → December
              milestone. Progress is difficulty-weighted.
            </p>
          </header>
          <div className="progress-rail">
            <div className="rail-fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="muted center">{percent}% · weighted understanding</p>

          <div className="chapter-list">
            {CHAPTERS.filter((c) => c.kind !== 'checkpoint' && c.kind !== 'boss' || c.id === 'checkpoint-foundation' || c.id === 'boss-finale').map(
              (ch) => {
                const probs = PROBLEMS.filter((p) => p.chapterId === ch.id)
                const done = probs.filter((p) =>
                  [
                    'solved_independent',
                    'solved_with_hint',
                    'understood_after_explanation',
                    'mastered',
                  ].includes(progress[p.id]?.status ?? ''),
                ).length
                const isCheckpoint = ch.kind === 'checkpoint'
                return (
                  <section
                    key={ch.id}
                    className={`chapter-block ${ch.kind} ${ch.phase === 2 ? 'phase2' : ''}`}
                  >
                    <div className="chapter-head">
                      <div>
                        <p className="eyebrow">
                          {ch.kind === 'checkpoint'
                            ? 'Checkpoint'
                            : ch.kind === 'boss'
                              ? 'Boss'
                              : `Phase ${ch.phase}`}
                        </p>
                        <h3>{ch.title}</h3>
                        <p className="muted">{ch.subtitle}</p>
                      </div>
                      {!isCheckpoint && ch.id !== 'boss-finale' && (
                        <span className="count">
                          {done}/{probs.length}
                        </span>
                      )}
                    </div>
                    {isCheckpoint && (
                      <p className="checkpoint-copy">
                        Pause the advance. Pick 3–5 earlier problems at random.
                        Solve without notes. If confidence drops, mark Needs
                        revision — the route will absorb it.
                      </p>
                    )}
                    {ch.id === 'boss-finale' && (
                      <p className="checkpoint-copy">
                        Destination approach: mixed revisions, weak-spot
                        cleanup, and interview communication — not new volume.
                      </p>
                    )}
                    <ul className="problem-rows">
                      {probs.map((p) => {
                        const st = progress[p.id]?.status ?? 'not_started'
                        return (
                          <li key={p.id}>
                            <button
                              className={`problem-row status-${st}`}
                              onClick={() => setSelectedId(p.id)}
                            >
                              <span className="ord">{p.order}</span>
                              <span className="ptitle">{p.title}</span>
                              <span className="diff">{p.difficulty}</span>
                              <span className="st">{STATUS_LABEL[st]}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              },
            )}
          </div>
        </main>
      )}

      {tab === 'week' && !selectedId && (
        <main className="panel week-panel">
          <header className="section-head">
            <h2>This week</h2>
            <p>
              Completed {week.completed}/{Math.max(week.planned, 1)} missions in
              window · ~{week.bufferDays} buffer day
              {week.bufferDays === 1 ? '' : 's'} built in
            </p>
          </header>
          <p className="route-note">{message}</p>
          <h3 className="subhead">Upcoming</h3>
          <ul className="upcoming">
            {schedule
              .filter(
                (s) =>
                  !(
                    [
                      'solved_independent',
                      'solved_with_hint',
                      'understood_after_explanation',
                      'mastered',
                    ] as ProblemStatus[]
                  ).includes(progress[s.problemId]?.status),
              )
              .slice(0, 6)
              .map((s) => {
                const p = getProblem(s.problemId)!
                return (
                  <li key={s.problemId}>
                    <button onClick={() => setSelectedId(s.problemId)}>
                      <strong>{p.title}</strong>
                      <span>
                        {formatRange(
                          s.recommendedStart,
                          s.recommendedEnd,
                          s.bufferEnd,
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
          {revisions.length > 0 && (
            <>
              <h3 className="subhead">Revisions due</h3>
              <ul className="upcoming">
                {revisions.slice(0, 5).map((id) => {
                  const p = getProblem(id)!
                  return (
                    <li key={id}>
                      <button onClick={() => setSelectedId(id)}>
                        <strong>{p.title}</strong>
                        <span>Active recall</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          <h3 className="subhead">Optional rabbit hole</h3>
          <p className="muted">
            Curiosity is allowed. Rabbit holes never become mandatory missions.
          </p>
          <form
            className="rh-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (!rhTitle.trim()) return
              addRabbitHole(rhTitle.trim())
              setRhTitle('')
            }}
          >
            <input
              value={rhTitle}
              onChange={(e) => setRhTitle(e.target.value)}
              placeholder="e.g. Kafka replication"
            />
            <button className="btn primary compact" type="submit">
              Park it
            </button>
          </form>
          <ul className="rh-list">
            {rabbitHoles.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.title}</strong>
                  <span className="muted"> optional · {r.createdAt}</span>
                </div>
                <button
                  className="btn ghost compact"
                  onClick={() => removeRabbitHole(r.id)}
                >
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {tab === 'modules' && !selectedId && (
        <main className="panel modules-panel">
          <header className="section-head">
            <h2>Modular career arc</h2>
            <p>
              DSA is Module 1. Future modules plug in without destroying this
              schedule.
            </p>
          </header>
          <ul className="module-grid">
            {modules.map((m) => (
              <li key={m.id} className={`module ${m.status}`}>
                <p className="eyebrow">{m.status}</p>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
              </li>
            ))}
          </ul>
          <div className="profile-note">
            <h3>Your edge</h3>
            <p>
              You already ship production distributed storage (PowerScale /
              OneFS), networking, Linux/FreeBSD, Python & C/C++, and CI/CD.
              This OS treats that as an advantage — DSA builds interview
              fluency on top of real systems judgment, not instead of it.
            </p>
            <p className="muted">
              Primary resource for Module 1:{' '}
              <a
                href="https://neetcode.io/practice/practice/neetcode150"
                target="_blank"
                rel="noreferrer"
              >
                NeetCode 150
              </a>
              . Optional later: NeetCode videos only when stuck.
            </p>
          </div>
        </main>
      )}

      <footer className="foot">
        <span>Consistency &gt; intensity · Understanding &gt; completion</span>
        <span>Progress saves on this device</span>
      </footer>
    </div>
  )
}
