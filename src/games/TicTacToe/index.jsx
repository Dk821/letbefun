import { useEffect, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useGameData, useSound } from '../../hooks/index.js'

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
const result = (b) => {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], line: [a, c, d] }
  return b.every(Boolean) ? { w: 'draw', line: [] } : null
}
const minimax = (b, aiTurn, depth) => {
  const r = result(b)
  if (r) return r.w === 'O' ? 10 - depth : r.w === 'X' ? depth - 10 : 0
  const scores = b.map((v, i) => {
    if (v) return null
    const n = [...b]
    n[i] = aiTurn ? 'O' : 'X'
    return minimax(n, !aiTurn, depth + 1)
  }).filter((s) => s != null)
  return aiTurn ? Math.max(...scores) : Math.min(...scores)
}
const aiMove = (b, hard) => {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i != null)
  if (!hard) return free[Math.floor(Math.random() * free.length)]
  let best = -Infinity, pick = free[0]
  for (const i of free) {
    const n = [...b]
    n[i] = 'O'
    const s = minimax(n, false, 1)
    if (s > best) { best = s; pick = i }
  }
  return pick
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [hard, setHard] = useState(true)
  const [busy, setBusy] = useState(false)
  const [tally, setTally] = useGameData('tic-tac-toe', 'tally', { w: 0, l: 0, d: 0 }, (v) => v && typeof v.w === 'number')
  const timer = useRef()
  const play = useSound()
  useEffect(() => () => clearTimeout(timer.current), [])
  const res = result(board)

  const record = (r) => {
    setTally((t) => ({ ...t, [r.w === 'X' ? 'w' : r.w === 'O' ? 'l' : 'd']: t[r.w === 'X' ? 'w' : r.w === 'O' ? 'l' : 'd'] + 1 }))
    play(r.w === 'X' ? 'win' : r.w === 'O' ? 'bad' : 'pop')
  }
  const click = (i) => {
    if (board[i] || res || busy) return
    const b = [...board]
    b[i] = 'X'
    setBoard(b)
    play('pop')
    const r = result(b)
    if (r) return record(r)
    setBusy(true)
    timer.current = setTimeout(() => {
      const n = [...b]
      n[aiMove(b, hard)] = 'O'
      setBoard(n)
      setBusy(false)
      const r2 = result(n)
      if (r2) record(r2)
    }, 350)
  }
  const reset = () => { clearTimeout(timer.current); setBoard(Array(9).fill(null)); setBusy(false) }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Wins" value={tally.w} />
        <Stat label="Draws" value={tally.d} />
        <Stat label="Losses" value={tally.l} />
      </div>
      <div className="mb-3 flex gap-2">
        <button className="chip" aria-pressed={!hard} onClick={() => { setHard(false); reset() }}>Easy</button>
        <button className="chip" aria-pressed={hard} onClick={() => { setHard(true); reset() }}>Unbeatable</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button key={i} onClick={() => click(i)} aria-label={`cell ${i + 1} ${v || 'empty'}`}
            className="no-select grid aspect-square place-items-center rounded-2xl border-2 border-ink font-display text-6xl font-extrabold"
            style={{ background: res?.line.includes(i) ? 'color-mix(in srgb, var(--game) 30%, var(--card))' : 'var(--card)', color: v === 'X' ? 'var(--game)' : 'var(--ink)' }}>
            {v}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">
        {res ? (res.w === 'draw' ? "It's a draw" : res.w === 'X' ? 'You win!' : 'AI wins') : busy ? 'AI is thinking…' : 'Your turn (X)'}
      </p>
      {res && <div className="mt-2 text-center"><button className="btn btn-primary" onClick={reset}>Play again</button></div>}
    </div>
  )
}
