import { useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useKey } from '../../hooks/index.js'

const empty = () => Array.from({ length: 4 }, () => Array(4).fill(0))
const addTile = (b) => {
  const free = []
  b.forEach((r, y) => r.forEach((v, x) => !v && free.push([x, y])))
  if (!free.length) return b
  const [x, y] = free[Math.floor(Math.random() * free.length)]
  const n = b.map((r) => [...r])
  n[y][x] = Math.random() < 0.9 ? 2 : 4
  return n
}
const slide = (row) => {
  const a = row.filter(Boolean)
  let gain = 0
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] === a[i + 1]) {
      a[i] *= 2
      gain += a[i]
      a.splice(i + 1, 1)
    }
  }
  while (a.length < 4) a.push(0)
  return [a, gain]
}
const rot = (b) => b[0].map((_, x) => b.map((r) => r[x]).reverse()) // clockwise
const rotN = (b, n) => { for (let i = 0; i < n; i++) b = rot(b); return b }
// dir: 0 left, 1 up, 2 right, 3 down
const move = (b, dir) => {
  const k = [0, 3, 2, 1][dir]
  let gain = 0
  const rows = rotN(b, k).map((r) => { const [a, g] = slide(r); gain += g; return a })
  return { board: rotN(rows, (4 - k) % 4), gain }
}
const KEYS = { ArrowLeft: 0, a: 0, ArrowUp: 1, w: 1, ArrowRight: 2, d: 2, ArrowDown: 3, s: 3 }
const fresh = () => addTile(addTile(empty()))

export default function Game2048() {
  const [board, setBoard] = useState(fresh)
  const [score, setScore] = useState(0)
  const [keepGoing, setKeepGoing] = useState(false)
  const [best, submit] = useBestScore('game-2048')
  const touch = useRef(null)

  const has2048 = board.some((r) => r.includes(2048))
  const stuck = [0, 1, 2, 3].every((d) => JSON.stringify(move(board, d).board) === JSON.stringify(board))

  const go = (d) => {
    if (stuck) return
    const { board: nb, gain } = move(board, d)
    if (JSON.stringify(nb) === JSON.stringify(board)) return
    setBoard(addTile(nb))
    setScore((s) => { submit(s + gain); return s + gain })
  }
  useKey((e) => {
    const d = KEYS[e.key]
    if (d != null) {
      e.preventDefault()
      go(d)
    }
  }, [board, stuck])
  const reset = () => { setBoard(fresh()); setScore(0); setKeepGoing(false) }

  const onEnd = (e) => {
    const t = e.changedTouches[0]
    const s = touch.current
    if (!s) return
    const dx = t.clientX - s.x, dy = t.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 0) : dy > 0 ? 3 : 1)
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 grid grid-cols-3 items-stretch gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Best" value={best ?? '—'} />
        <button className="btn" onClick={reset}>New game</button>
      </div>
      <div className="relative">
        <div
          className="grid touch-none grid-cols-4 gap-2 rounded-2xl border-2 border-ink bg-soft p-2"
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={onEnd}
        >
          {board.flat().map((v, i) => (
            <div key={i} className="grid aspect-square place-items-center rounded-xl font-display text-2xl font-extrabold sm:text-3xl"
              style={{ background: v ? `hsl(${(Math.log2(v) * 38 + 20) % 360} 75% ${v < 8 ? 86 : 62}%)` : 'var(--card)', color: v ? '#1b1530' : 'transparent' }}>
              {v || ''}
            </div>
          ))}
        </div>
        {(stuck || (has2048 && !keepGoing)) && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-bg/75 text-center">
            <div>
              <p className="font-display text-3xl font-extrabold">{stuck ? 'No moves left' : 'You made 2048!'}</p>
              <div className="mt-4 flex justify-center gap-2">
                {!stuck && <button className="btn" onClick={() => setKeepGoing(true)}>Keep going</button>}
                <button className="btn btn-primary" onClick={reset}>New game</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">Arrow keys / WASD, or swipe. Matching tiles merge.</p>
    </div>
  )
}
