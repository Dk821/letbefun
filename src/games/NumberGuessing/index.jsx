import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Trophy } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useGameData, useSound } from '../../hooks/index.js'

const LEVELS = {
  easy: { label: 'Easy', max: 50, tries: 10 },
  medium: { label: 'Medium', max: 100, tries: 7 },
  hard: { label: 'Hard', max: 1000, tries: 10 },
}
const rand = (max) => Math.floor(Math.random() * max) + 1

export default function NumberGuessing() {
  const [level, setLevel] = useState(null)
  const [target, setTarget] = useState(0)
  const [guesses, setGuesses] = useState([])
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [bests, setBests] = useGameData('number-guess', 'bests', {}, (v) => v && typeof v === 'object')
  const play = useSound()
  const input = useRef(null)

  const cfg = level && LEVELS[level]
  const won = guesses.at(-1)?.n === target
  const lost = !won && cfg && guesses.length >= cfg.tries
  const over = won || lost

  function start(l) {
    setLevel(l)
    setTarget(rand(LEVELS[l].max))
    setGuesses([])
    setValue('')
    setError('')
    setTimeout(() => input.current?.focus(), 0)
  }

  function submit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!/^-?\d+$/.test(trimmed)) return setError('Enter a whole number.')
    const n = Number(trimmed)
    if (n < 1 || n > cfg.max) return setError(`Pick a number between 1 and ${cfg.max}.`)
    if (guesses.some((g) => g.n === n)) return setError('You already tried that one.')
    setError('')
    setValue('')
    const next = [...guesses, { n, hint: n === target ? 'correct' : n < target ? 'higher' : 'lower' }]
    setGuesses(next)
    if (n === target) {
      play('win')
      setBests((b) => (b[level] == null || next.length < b[level] ? { ...b, [level]: next.length } : b))
    } else play('pop')
    input.current?.focus()
  }

  if (!level) {
    return (
      <div className="mx-auto max-w-xl">
        <h2 id="number-guess-difficulty" className="text-xl font-bold">Choose a difficulty</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Object.entries(LEVELS).map(([k, l]) => (
            <button key={k} className="card p-5 text-left transition hover:-translate-y-1 hover:border-game" onClick={() => start(k)}>
              <div className="font-display text-2xl font-bold">{l.label}</div>
              <div className="text-sm text-muted">1 – {l.max} · {l.tries} tries</div>
              <div className="mt-2 text-xs text-muted">{bests[k] ? `Best: ${bests[k]} guesses` : 'No record yet'}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const last = guesses.at(-1)
  return (
    <div className="mx-auto max-w-xl">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Range" value={`1–${cfg.max}`} />
        <Stat label="Tries left" value={Math.max(0, cfg.tries - guesses.length)} />
        <Stat label="Best" value={bests[level] ?? '—'} />
      </div>
      <div className="card mt-4 p-6 text-center" aria-live="polite">
        {over ? (
          <>
            <Trophy className="mx-auto text-game" aria-hidden />
            <p className="mt-2 font-display text-3xl font-bold">{won ? `Found it in ${guesses.length}!` : 'Out of tries'}</p>
            <p className="text-muted">The number was <b className="font-mono">{target}</b>.</p>
          </>
        ) : last ? (
          <p className="flex items-center justify-center gap-2 font-display text-3xl font-bold">
            {last.hint === 'higher' ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />} Go {last.hint}
          </p>
        ) : (
          <p className="font-display text-3xl font-bold">I’m thinking of a number…</p>
        )}
      </div>
      {!over && (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Your guess</span>
            <input ref={input} className="field font-mono text-lg" inputMode="numeric" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Your guess" aria-invalid={!!error} aria-describedby="ng-err" />
          </label>
          <button className="btn btn-primary" type="submit">Guess</button>
        </form>
      )}
      <p id="ng-err" role="alert" className="mt-2 min-h-5 text-sm text-accent">{error}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {guesses.map((g) => (
          <li key={g.n} className="chip font-mono">{g.n} {g.hint === 'higher' ? '↑' : g.hint === 'lower' ? '↓' : '✓'}</li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2">
        <button className="btn" onClick={() => start(level)}>{over ? 'Play again' : 'New number'}</button>
        <button className="btn btn-ghost" onClick={() => setLevel(null)}>Change difficulty</button>
      </div>
    </div>
  )
}
