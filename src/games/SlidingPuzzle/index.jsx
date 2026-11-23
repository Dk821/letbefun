import { useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const solved = (n) => [...Array(n * n - 1).keys()].map((i) => i + 1).concat(0)
const neighbors = (i, n) => {
  const x = i % n, y = Math.floor(i / n), out = []
  if (x > 0) out.push(i - 1)
  if (x < n - 1) out.push(i + 1)
  if (y > 0) out.push(i - n)
  if (y < n - 1) out.push(i + n)
  return out
}
const shuffled = (n) => {
  const t = solved(n)
  let blank = t.length - 1, prev = -1
  for (let k = 0; k < n * n * 25; k++) {
    const opts = neighbors(blank, n).filter((j) => j !== prev)
    const j = opts[Math.floor(Math.random() * opts.length)]
    ;[t[blank], t[j]] = [t[j], t[blank]]
    prev = blank
    blank = j
  }
  return t
}

export default function SlidingPuzzle() {
  const [size, setSize] = useState(3)
  const [tiles, setTiles] = useState(() => shuffled(3))
  const [moves, setMoves] = useState(0)
  const [best, submit] = useBestScore('sliding-puzzle', `best${size}`, 'low')
  const play = useSound()
  const done = tiles.every((v, i) => v === solved(size)[i]) && moves > 0

  const reset = (n = size) => { setSize(n); setTiles(shuffled(n)); setMoves(0) }
  const click = (i) => {
    if (done) return
    const b = tiles.indexOf(0)
    if (!neighbors(i, size).includes(b)) return
    const t = [...tiles]
    ;[t[i], t[b]] = [t[b], t[i]]
    setTiles(t)
    setMoves(moves + 1)
    if (t.every((v, k) => v === solved(size)[k])) { submit(moves + 1); play('win') } else play('pop')
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Stat label="Moves" value={moves} />
        <Stat label={`Best (${size}×${size})`} value={best ?? '—'} />
      </div>
      <div className="mb-3 flex gap-2">
        {[3, 4].map((n) => <button key={n} className="chip" aria-pressed={size === n} onClick={() => reset(n)}>{n}×{n}</button>)}
        <button className="btn btn-sm ml-auto" onClick={() => reset()}>Shuffle</button>
      </div>
      <div className="grid gap-2 rounded-2xl border-2 border-ink bg-soft p-2" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {tiles.map((v, i) => (
          <button key={i} onClick={() => click(i)} disabled={!v} aria-label={v ? `tile ${v}` : 'empty'}
            className="no-select aspect-square rounded-xl font-display text-3xl font-extrabold transition-transform"
            style={{ background: v ? `color-mix(in srgb, var(--game) ${25 + (v * 50) / (size * size)}%, var(--card))` : 'transparent', color: 'var(--ink)' }}>
            {v || ''}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">{done ? `🎉 Solved in ${moves} moves` : ''}</p>
    </div>
  )
}
