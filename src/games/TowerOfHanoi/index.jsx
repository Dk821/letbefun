import { useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const init = (n) => [Array.from({ length: n }, (_, i) => n - i), [], []]

export default function TowerOfHanoi() {
  const [n, setN] = useState(4)
  const [pegs, setPegs] = useState(() => init(4))
  const [sel, setSel] = useState(null)
  const [moves, setMoves] = useState(0)
  const [best, submit] = useBestScore('tower-of-hanoi', `best${n}`, 'low')
  const play = useSound()
  const min = 2 ** n - 1
  const done = pegs[2].length === n

  const reset = (k = n) => { setN(k); setPegs(init(k)); setSel(null); setMoves(0) }
  const click = (p) => {
    if (done) return
    if (sel == null) {
      if (pegs[p].length) { setSel(p); play('tick') }
      return
    }
    if (sel === p) return setSel(null)
    const disc = pegs[sel][pegs[sel].length - 1]
    const top = pegs[p][pegs[p].length - 1]
    if (top && top < disc) { play('bad'); return setSel(null) }
    const next = pegs.map((x) => [...x])
    next[sel].pop()
    next[p].push(disc)
    setPegs(next)
    setSel(null)
    setMoves(moves + 1)
    if (next[2].length === n) { submit(moves + 1); play('win') } else play('pop')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Moves" value={moves} />
        <Stat label="Minimum" value={min} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {[3, 4, 5, 6, 7].map((k) => <button key={k} className="chip" aria-pressed={n === k} onClick={() => reset(k)}>{k} discs</button>)}
        <button className="btn btn-sm ml-auto" onClick={() => reset()}>Restart</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {pegs.map((discs, p) => (
          <button key={p} onClick={() => click(p)} aria-label={`Peg ${p + 1}, ${discs.length} discs`}
            className="relative flex h-72 flex-col-reverse items-center gap-1 rounded-2xl border-2 px-1 pb-2"
            style={{ borderColor: sel === p ? 'var(--game)' : 'var(--ink)', background: sel === p ? 'color-mix(in srgb, var(--game) 14%, var(--soft))' : 'var(--soft)' }}>
            <span className="absolute bottom-2 top-6 w-2 rounded-full bg-line" aria-hidden />
            {discs.map((d, i) => (
              <span key={d} className="relative z-10 h-8 rounded-lg"
                style={{ width: `${25 + (d / n) * 70}%`, background: `hsl(${d * 45 + 200} 75% 60%)`, outline: sel === p && i === discs.length - 1 ? '3px solid var(--ink)' : 'none' }} />
            ))}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">{done ? `🏆 Solved in ${moves} moves${moves === min ? ' — perfect!' : ''}` : 'Move the whole stack to the right peg'}</p>
    </div>
  )
}
