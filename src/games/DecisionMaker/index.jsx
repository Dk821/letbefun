import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RotateCcw, X } from 'lucide-react'
import { useSound } from '../../hooks/index.js'
import { Stat } from '../../components/ui.jsx'

const DEFAULTS = ['Pizza', 'Tacos', 'Sushi', 'Ramen', 'Burgers', 'Curry', 'Pasta', 'Salad']
const MAX_OPTIONS = 50
const SEGMENT_COLORS = ['#84cc16', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#f97316', '#eab308', '#22c55e']
const SPIN_DURATION = 2600

export default function DecisionMaker() {
  const [options, setOptions] = useState(DEFAULTS)
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(-1)
  const [winner, setWinner] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [history, setHistory] = useState([])
  const [noRepeat, setNoRepeat] = useState(false)
  const [picked, setPicked] = useState([])
  const [counts, setCounts] = useState({})
  const timer = useRef(null)
  const play = useSound()
  useEffect(() => () => clearTimeout(timer.current), [])

  const gradient = useMemo(() => {
    if (!options.length) return 'var(--soft)'
    const step = 100 / options.length
    return `conic-gradient(from 0deg, ${options.map((_, i) => `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * step}% ${(i + 1) * step}%`).join(', ')})`
  }, [options])

  const available = noRepeat ? options.filter((o) => !picked.includes(o)) : options
  const canSpin = !spinning && options.length >= 2 && (!noRepeat || available.length > 0)
  const spinCount = Object.values(counts).reduce((sum, n) => sum + n, 0)

  const add = (e) => {
    e.preventDefault()
    const v = draft.trim().slice(0, 40)
    if (!v || options.length >= MAX_OPTIONS || options.some((o) => o.toLowerCase() === v.toLowerCase())) return
    setOptions([...options, v])
    setDraft('')
    setWinner(null)
    setActive(-1)
  }

  function spin() {
    if (!canSpin) return
    const choice = available[Math.floor(Math.random() * available.length)]
    const target = options.indexOf(choice)
    const segment = 360 / options.length
    const offset = (360 - ((target + 0.5) * segment + rotation) % 360) % 360
    const duration = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 300 : SPIN_DURATION
    setRotation(rotation + 360 * 5 + offset)
    setSpinning(true)
    setWinner(null)
    setActive(-1)
    const start = performance.now()
    const tick = () => {
      const elapsed = performance.now() - start
      if (elapsed >= duration) {
        setActive(target)
        setSpinning(false)
        setWinner(choice)
        setHistory((h) => [choice, ...h].slice(0, 6))
        setCounts((c) => ({ ...c, [choice]: (c[choice] || 0) + 1 }))
        if (noRepeat) setPicked((p) => [...p, choice])
        play('win')
        return
      }
      setActive(Math.floor(elapsed / 90) % options.length)
      play('tick')
      timer.current = setTimeout(tick, 70 + (elapsed / duration) * 180)
    }
    tick()
  }

  function removeOption(i) {
    const value = options[i]
    setOptions(options.filter((_, index) => index !== i))
    setPicked((p) => p.filter((o) => o !== value))
    setCounts((c) => {
      const next = { ...c }
      delete next[value]
      return next
    })
    setActive(-1)
    setWinner(null)
  }

  function resetPicks() {
    setPicked([])
    setWinner(null)
    setActive(-1)
  }

  function clearAll() {
    setOptions([])
    setWinner(null)
    setActive(-1)
    setRotation(0)
    setPicked([])
    setCounts({})
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
      <section className="card overflow-hidden p-5 sm:p-8" aria-label="Decision wheel">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Options" value={options.length} />
          <Stat label="Picks" value={spinCount} />
          <Stat label={noRepeat ? 'Left' : 'Recent'} value={noRepeat ? available.length : history.length} hint={noRepeat ? 'unpicked' : undefined} />
        </div>
        <div className="relative mx-auto mt-7 aspect-square w-full max-w-72">
          <span aria-hidden="true" className="absolute -inset-3 rounded-full border border-dashed border-line" />
          <span aria-hidden="true" className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-[var(--ink)]" />
          <div
            className="h-full w-full rounded-full shadow-[0_24px_60px_-28px_color-mix(in_srgb,var(--game)_75%,transparent)]"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.72, 0.12, 1)`,
            }}
          />
          <div className="absolute inset-[22%] grid place-items-center rounded-full border border-line bg-card text-center shadow-lg">
            <div className="px-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                {spinning ? 'Choosing' : winner ? 'Picked' : options.length ? 'Ready' : 'Empty'}
              </p>
              <p className="mt-1 line-clamp-2 font-display text-xl font-extrabold break-words sm:text-2xl" aria-live="polite">
                {spinning ? '…' : winner ?? '?'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button className="btn btn-primary !px-8 !py-3 !text-base" onClick={spin} disabled={!canSpin}>
            {spinning ? 'Spinning…' : 'Spin the wheel'}
          </button>
          <button className="btn btn-ghost" onClick={clearAll} disabled={spinning || options.length === 0}>
            <RotateCcw size={14} aria-hidden /> Clear all
          </button>
        </div>
        {options.length < 2 && <p className="mt-3 text-center text-sm text-accent">Add at least two options to spin.</p>}
        {noRepeat && options.length >= 2 && available.length === 0 && (
          <p className="mt-3 text-center text-sm text-accent">Every option has been picked. Reset picks to go again.</p>
        )}
        {winner && (
          <div
            className="mt-5 rounded-2xl border p-4 text-center"
            style={{ borderColor: 'var(--game)', background: 'color-mix(in srgb, var(--game) 10%, var(--card))' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Your pick</p>
            <p className="mt-1 font-display text-2xl font-extrabold break-words">{winner}</p>
          </div>
        )}
        {history.length > 0 && (
          <p className="mt-5 text-center text-xs text-muted">Recent picks: {history.join(' · ')}</p>
        )}
      </section>

      <section className="card h-fit p-4" aria-label="Options">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">Your options</h2>
          <span className="text-xs text-muted">{options.length}/{MAX_OPTIONS}</span>
        </div>
        <form onSubmit={add} className="mt-3 flex gap-2">
          <label className="flex-1">
            <span className="sr-only">New option</span>
            <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an option…" maxLength={40} />
          </label>
          <button className="btn" type="submit" disabled={!draft.trim() || options.length >= MAX_OPTIONS}>
            <Plus size={16} aria-hidden /> Add
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-soft/60 p-1 text-sm" role="group" aria-label="Repeat mode">
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${noRepeat ? 'text-muted hover:text-ink' : 'bg-card text-ink shadow-sm'}`}
              aria-pressed={!noRepeat}
              disabled={spinning}
              onClick={() => { setNoRepeat(false); setPicked([]) }}
            >
              Repeat
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${noRepeat ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
              aria-pressed={noRepeat}
              disabled={spinning}
              onClick={() => { setNoRepeat(true); setPicked([]) }}
            >
              No-repeat
            </button>
          </div>
          {noRepeat && picked.length > 0 && (
            <button type="button" className="btn btn-sm" onClick={resetPicks} disabled={spinning}>Reset picks</button>
          )}
          <span className="text-xs text-muted">
            {noRepeat ? `${available.length} of ${options.length} left` : 'Repeats allowed'}
          </span>
        </div>
        {options.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">Nothing here yet. Add a few choices above.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Options list">
            {options.map((o, i) => (
              <li
                key={`${o}-${i}`}
                className={`inline-flex max-w-full items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 text-sm font-medium transition-colors ${active === i ? 'shadow-sm' : 'border-line bg-soft/60 text-muted'} ${noRepeat && picked.includes(o) ? 'opacity-45' : ''}`}
                style={active === i ? { borderColor: 'var(--game)', background: 'color-mix(in srgb, var(--game) 22%, var(--card))', color: 'var(--ink)' } : undefined}
              >
                <span className="size-2 shrink-0 rounded-full" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} aria-hidden="true" />
                <span className="max-w-40 truncate">{o}</span>
                <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted" title={`Picked ${counts[o] || 0} times`} aria-label={`Picked ${counts[o] || 0} times`}>
                  {counts[o] || 0}
                </span>
                <button className="grid size-6 place-items-center rounded-full text-muted hover:bg-card hover:text-ink disabled:opacity-40" disabled={spinning} aria-label={`Remove ${o}`} onClick={() => removeOption(i)}>
                  <X size={13} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">The number on each chip is how many times it has been picked.</p>
      </section>
    </div>
  )
}
