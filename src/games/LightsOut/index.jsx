import { useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useGameData, useSound } from '../../hooks/index.js'

const N = 5
const press = (b, i) => {
  const n = [...b], x = i % N, y = Math.floor(i / N)
  for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const X = x + dx, Y = y + dy
    if (X >= 0 && Y >= 0 && X < N && Y < N) n[Y * N + X] = !n[Y * N + X]
  }
  return n
}
const make = () => {
  let b = Array(N * N).fill(false)
  const hits = new Set()
  while (hits.size < 8) hits.add(Math.floor(Math.random() * N * N))
  hits.forEach((i) => { b = press(b, i) })
  return b
}

export default function LightsOut() {
  const [board, setBoard] = useState(make)
  const [moves, setMoves] = useState(0)
  const [solvedCount, setSolved] = useGameData('lights-out', 'solved', 0, (v) => typeof v === 'number')
  const [best, submit] = useBestScore('lights-out', 'best', 'low')
  const play = useSound()
  const done = moves > 0 && board.every((v) => !v)

  const click = (i) => {
    if (done) return
    const b = press(board, i)
    setBoard(b)
    setMoves(moves + 1)
    if (b.every((v) => !v)) { setSolved(solvedCount + 1); submit(moves + 1); play('win') } else play('pop')
  }
  const next = () => { setBoard(make()); setMoves(0) }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Moves" value={moves} />
        <Stat label="Best" value={best ?? '—'} />
        <Stat label="Solved" value={solvedCount} />
      </div>
      <div className="grid grid-cols-5 gap-2 rounded-2xl border-2 border-ink bg-soft p-2">
        {board.map((on, i) => (
          <button key={i} onClick={() => click(i)} aria-label={`light ${i + 1} ${on ? 'on' : 'off'}`} aria-pressed={on}
            className="no-select aspect-square rounded-xl transition-all"
            style={{ background: on ? 'var(--game)' : 'var(--card)', boxShadow: on ? '0 0 22px var(--game)' : 'none' }} />
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">{done ? `💡 All dark in ${moves} moves!` : 'Turn every light off'}</p>
      <div className="mt-2 text-center"><button className={`btn ${done ? 'btn-primary' : ''}`} onClick={next}>New puzzle</button></div>
    </div>
  )
}
