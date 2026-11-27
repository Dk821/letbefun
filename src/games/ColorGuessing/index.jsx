import { useMemo, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const ROUNDS = 10
const hex = (c) => '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()
const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`
const rnd = () => Math.floor(Math.random() * 256)
const clamp = (n) => Math.max(0, Math.min(255, n))
const DIFF = { easy: 90, medium: 50, hard: 22, expert: 10 }
const CHOICES = [4, 6, 8]
const CHOICE_COLS = { 4: 'sm:grid-cols-2', 6: 'sm:grid-cols-3', 8: 'sm:grid-cols-4' }

function makeRound(spread, count) {
  const c = [rnd(), rnd(), rnd()]
  const options = [c]
  let tries = 0
  while (options.length < count && tries < 400) {
    const d = c.map((x) => clamp(x + Math.round((Math.random() * 2 - 1) * spread)))
    if (hex(d) !== hex(c) && !options.some((o) => hex(o) === hex(d))) options.push(d)
    tries++
  }
  while (options.length < count) {
    const d = [rnd(), rnd(), rnd()]
    if (!options.some((o) => hex(o) === hex(d))) options.push(d)
  }
  return { answer: c, options: options.sort(() => Math.random() - 0.5) }
}

export default function ColorGuessing() {
  const [mode, setMode] = useState('code') // code: see color, pick code; color: see code, pick color
  const [diff, setDiff] = useState('medium')
  const [choiceCount, setChoiceCount] = useState(6)
  const [fmt, setFmt] = useState('hex')
  const [state, setState] = useState(null) // { i, score, streak, picked }
  const [round, setRound] = useState(null)
  const [best, submitBest] = useBestScore('color-guess', 'best', 'high')
  const play = useSound()

  const fmtFn = fmt === 'hex' ? hex : rgb
  const start = () => {
    setRound(makeRound(DIFF[diff], choiceCount))
    setState({ i: 0, score: 0, streak: 0, picked: null })
  }

  function pick(opt) {
    if (state.picked) return
    const ok = hex(opt) === hex(round.answer)
    play(ok ? 'good' : 'bad')
    setState((s) => ({ ...s, picked: opt, score: s.score + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0 }))
  }

  function next() {
    if (state.i + 1 >= ROUNDS) {
      submitBest(state.score)
      return setState((s) => ({ ...s, i: ROUNDS }))
    }
    setRound(makeRound(DIFF[diff], choiceCount))
    setState((s) => ({ ...s, i: s.i + 1, picked: null }))
  }

  const finished = state && state.i >= ROUNDS
  const options = useMemo(() => round?.options ?? [], [round])

  if (!state)
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <fieldset>
          <legend className="mb-2 font-semibold">Mode</legend>
          <div className="flex flex-wrap gap-2">
            <button className="chip" aria-pressed={mode === 'code'} onClick={() => setMode('code')}>See color → pick code</button>
            <button className="chip" aria-pressed={mode === 'color'} onClick={() => setMode('color')}>See code → pick color</button>
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold">Code format</legend>
          <div className="flex gap-2">
            {['hex', 'rgb'].map((f) => <button key={f} className="chip uppercase" aria-pressed={fmt === f} onClick={() => setFmt(f)}>{f}</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold">Choices per round</legend>
          <div className="flex flex-wrap gap-2">
            {CHOICES.map((n) => <button key={n} className="chip" aria-pressed={choiceCount === n} onClick={() => setChoiceCount(n)}>{n} options</button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold">Difficulty</legend>
          <div className="flex flex-wrap gap-2">
            {Object.keys(DIFF).map((d) => <button key={d} className="chip capitalize" aria-pressed={diff === d} onClick={() => setDiff(d)}>{d}</button>)}
          </div>
        </fieldset>
        <button className="btn btn-primary" onClick={start}>Start {ROUNDS} rounds</button>
        <p className="text-sm text-muted">Best score: {best ?? '—'} / {ROUNDS}</p>
      </div>
    )

  if (finished)
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="text-5xl" aria-hidden>{state.score >= 8 ? '🏆' : state.score >= 5 ? '👍' : '🎨'}</p>
        <h2 id="color-guess-score" className="mt-2 text-3xl font-bold">{state.score} / {ROUNDS}</h2>
        <p className="text-muted">Best: {best} / {ROUNDS}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={start}>Play again</button>
          <button className="btn" onClick={() => setState(null)}>Settings</button>
        </div>
      </div>
    )

  const a = round.answer
  return (
    <div className="mx-auto max-w-xl">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Round" value={`${state.i + 1}/${ROUNDS}`} />
        <Stat label="Score" value={state.score} />
        <Stat label="Streak" value={state.streak} />
      </div>
      <div
        className="mt-4 grid h-48 place-items-center rounded-3xl border-2 border-ink"
        style={{ background: mode === 'code' ? hex(a) : 'var(--soft)' }}
        role="img"
        aria-label={mode === 'code' ? 'A color swatch. Pick its code.' : `Code ${fmtFn(a)}`}
      >
        {mode === 'color' && <span className="font-mono text-3xl font-medium">{fmtFn(a)}</span>}
      </div>
      <div className={`mt-4 grid grid-cols-2 gap-3 ${CHOICE_COLS[choiceCount]}`}>
        {options.map((o) => {
          const right = hex(o) === hex(a)
          const chosen = state.picked && hex(state.picked) === hex(o)
          const border = state.picked ? (right ? '#22c55e' : chosen ? '#ef4444' : 'var(--line)') : undefined
          return (
            <button
              key={hex(o)}
              onClick={() => pick(o)}
              disabled={!!state.picked && !right && !chosen}
              className={mode === 'code' ? 'btn !rounded-2xl !py-4 font-mono !text-base' : 'h-24 rounded-2xl border-4'}
              style={mode === 'code' ? { borderColor: border } : { background: hex(o), borderColor: border ?? 'var(--ink)' }}
              aria-label={mode === 'code' ? fmtFn(o) : `Color option ${fmtFn(o)}`}
            >
              {mode === 'code' ? fmtFn(o) : null}
            </button>
          )
        })}
      </div>
      <div aria-live="polite" className="mt-4 min-h-10">
        {state.picked && (
          <div className="flex items-center gap-3">
            <p className="font-semibold">{hex(state.picked) === hex(a) ? 'Correct!' : `Nope — it was ${fmtFn(a)}`}</p>
            <button className="btn btn-primary btn-sm" onClick={next} autoFocus>{state.i + 1 >= ROUNDS ? 'See result' : 'Next'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
