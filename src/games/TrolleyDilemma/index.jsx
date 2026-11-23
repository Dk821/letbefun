import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameData } from '../../hooks/index.js'
import { SCENARIOS } from './scenarios.js'

export default function TrolleyDilemma() {
  const [log, setLog] = useGameData('trolley-dilemma', 'choices', {}, (v) => v && typeof v === 'object')
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([])
  const done = i >= SCENARIOS.length
  const s = SCENARIOS[Math.min(i, SCENARIOS.length - 1)]

  function choose(opt) {
    if (picked != null) return
    setPicked(opt)
    setAnswers((a) => [...a, opt])
    setLog((l) => ({ ...l, [s.id]: { ...(l[s.id] || { a: 0, b: 0 }), [opt]: ((l[s.id] || { a: 0, b: 0 })[opt] || 0) + 1 } }))
  }

  function restart() {
    setI(0)
    setPicked(null)
    setAnswers([])
  }

  if (done) {
    const act = answers.filter((a, idx) => SCENARIOS[idx][a].act).length
    const util = answers.filter((a, idx) => SCENARIOS[idx][a].more).length
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl" aria-hidden>🧭</p>
        <h2 className="mt-2 text-3xl font-bold">Your moral compass</h2>
        <ul className="mt-5 space-y-2 text-left">
          <li className="rounded-xl bg-soft p-3">You chose the option that <b>saves more lives</b> in {util} of {SCENARIOS.length} dilemmas.</li>
          <li className="rounded-xl bg-soft p-3">You were willing to <b>actively intervene</b> in {act} of {SCENARIOS.length}.</li>
        </ul>
        <p className="mt-4 text-sm text-muted">Totals for each scenario across all your plays on this device are saved locally — nothing is uploaded.</p>
        <button className="btn btn-primary mt-5" onClick={restart}>Go again</button>
      </div>
    )
  }

  const stat = log[s.id] || { a: 0, b: 0 }
  const total = stat.a + stat.b
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-muted">Scenario {i + 1} of {SCENARIOS.length}</p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft" aria-hidden>
        <div className="h-full bg-game transition-all" style={{ width: `${(i / SCENARIOS.length) * 100}%` }} />
      </div>
      <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mt-4 p-6">
        <TrackArt kind={s.art} />
        <h2 className="mt-4 text-2xl font-bold">{s.title}</h2>
        <p className="mt-2 text-muted">{s.text}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {['a', 'b'].map((k) => {
            const pct = total ? Math.round(((stat[k] || 0) / total) * 100) : 0
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                disabled={picked != null && picked !== k}
                className="rounded-2xl border-2 p-4 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: picked === k ? 'var(--game)' : 'var(--line)', background: picked === k ? 'color-mix(in srgb, var(--game) 14%, transparent)' : undefined }}
              >
                <span className="font-semibold">{s[k].label}</span>
                {picked != null && <span className="mt-2 block text-xs text-muted">{pct}% of your past picks</span>}
              </button>
            )
          })}
        </div>
        {picked != null && (
          <div className="mt-4 flex items-center justify-between gap-3" aria-live="polite">
            <p className="text-sm text-muted">{s.note}</p>
            <button className="btn btn-primary shrink-0" autoFocus onClick={() => { setI(i + 1); setPicked(null) }}>{i + 1 === SCENARIOS.length ? 'See results' : 'Next'}</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function TrackArt({ kind }) {
  const people = kind === 'many' ? [0, 1, 2, 3, 4] : kind === 'bridge' ? [0] : [0]
  return (
    <svg viewBox="0 0 400 90" className="w-full" role="img" aria-label="Illustration of a trolley on a track">
      <line x1="0" y1="60" x2="400" y2="60" stroke="var(--ink)" strokeWidth="3" />
      <path d="M200 60 Q 260 60 300 30 L 400 30" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <rect x="30" y="34" width="60" height="26" rx="6" fill="var(--game)" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="44" cy="62" r="5" fill="var(--ink)" /><circle cx="76" cy="62" r="5" fill="var(--ink)" />
      {people.map((p) => <text key={p} x={290 + p * 18} y="56" fontSize="16">🧍</text>)}
      <text x="340" y="26" fontSize="16">🧍</text>
      {kind === 'bridge' && <text x="170" y="30" fontSize="18">🌉</text>}
    </svg>
  )
}
