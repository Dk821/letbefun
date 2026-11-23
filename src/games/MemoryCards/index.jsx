import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useGameData, useSound, useStopwatch } from '../../hooks/index.js'

const EMOJI = ['🦊', '🐙', '🌵', '🍄', '🚀', '🎸', '🍩', '🧊', '🦉', '🪐', '🍋', '🎲']
const SIZES = { small: { label: '4 × 3', pairs: 6, cols: 4 }, medium: { label: '4 × 4', pairs: 8, cols: 4 }, large: { label: '6 × 4', pairs: 12, cols: 6 } }

const deal = (pairs) => {
  const cards = EMOJI.slice(0, pairs).flatMap((e, i) => [{ id: i * 2, e }, { id: i * 2 + 1, e }])
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

export default function MemoryCards() {
  const [size, setSize] = useState('medium')
  const [cards, setCards] = useState(() => deal(SIZES.medium.pairs))
  const [open, setOpen] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [moves, setMoves] = useState(0)
  const [paused, setPaused] = useState(false)
  const [bests, setBests] = useGameData('memory-cards', 'bests', {}, (v) => v && typeof v === 'object')
  const sw = useStopwatch(250)
  const play = useSound()
  const lock = useRef(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const done = matched.size === cards.length
  useEffect(() => {
    if (!done) return
    sw.pause()
    play('win')
    const t = Math.round(sw.elapsed / 1000)
    setBests((b) => (b[size] == null || t < b[size].time ? { ...b, [size]: { time: t, moves } } : b))
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  function reset(s = size) {
    clearTimeout(timer.current)
    lock.current = false
    setSize(s)
    setCards(deal(SIZES[s].pairs))
    setOpen([])
    setMatched(new Set())
    setMoves(0)
    setPaused(false)
    sw.reset()
  }

  function flip(i) {
    if (lock.current || paused || done || open.includes(i) || matched.has(cards[i].id)) return
    if (!sw.running) sw.start()
    play('pop')
    const next = [...open, i]
    setOpen(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next
      if (cards[a].e === cards[b].e) {
        setMatched((m) => new Set([...m, cards[a].id, cards[b].id]))
        setOpen([])
        play('good')
      } else {
        lock.current = true
        timer.current = setTimeout(() => {
          setOpen([])
          lock.current = false
        }, 800)
      }
    }
  }

  function togglePause() {
    if (paused) {
      sw.start()
      setPaused(false)
    } else {
      sw.pause()
      setPaused(true)
    }
  }

  const secs = Math.round(sw.elapsed / 1000)
  const best = bests[size]
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {Object.entries(SIZES).map(([k, s]) => (
          <button key={k} className="chip" aria-pressed={size === k} onClick={() => reset(k)}>{s.label}</button>
        ))}
        <button className="btn btn-sm ml-auto" onClick={togglePause} disabled={!sw.running && !paused}>
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />} {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Moves" value={moves} />
        <Stat label="Time" value={`${secs}s`} />
        <Stat label="Best" value={best ? `${best.time}s · ${best.moves}` : '—'} />
      </div>
      <div className="mt-4 grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${SIZES[size].cols}, minmax(0, 1fr))` }} role="group" aria-label="Memory cards">
        {cards.map((c, i) => {
          const shown = open.includes(i) || matched.has(c.id)
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              aria-label={shown ? c.e : 'Hidden card'}
              aria-pressed={shown}
              className="aspect-square rounded-2xl border-2 text-3xl transition-transform duration-300 sm:text-4xl"
              style={{
                transform: shown ? 'rotateY(0)' : 'rotateY(180deg)',
                background: shown ? 'var(--card)' : 'var(--game)',
                borderColor: matched.has(c.id) ? '#22c55e' : 'var(--ink)',
                opacity: paused ? 0.3 : 1,
              }}
            >
              <span style={{ opacity: shown ? 1 : 0 }}>{c.e}</span>
            </button>
          )
        })}
      </div>
      <div aria-live="polite" className="mt-4 min-h-10">
        {done && (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="font-display text-xl font-bold">🎉 Cleared in {moves} moves, {secs}s</p>
            <button className="btn btn-primary btn-sm" onClick={() => reset()}>Play again</button>
          </div>
        )}
      </div>
    </div>
  )
}
