import { useState } from 'react'
import { Flag } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useInterval, useSound } from '../../hooks/index.js'

const W = 9, H = 9, M = 10
const COLORS = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#111827', '#6b7280']
const blank = () => Array.from({ length: W * H }, () => ({ mine: false, open: false, flag: false, n: 0 }))
const nb = (i) => {
  const x = i % W, y = Math.floor(i / W), out = []
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue
    const X = x + dx, Y = y + dy
    if (X >= 0 && Y >= 0 && X < W && Y < H) out.push(Y * W + X)
  }
  return out
}
const plant = (cells, safe) => {
  const c = cells.map((x) => ({ ...x }))
  const avoid = new Set([safe, ...nb(safe)])
  let placed = 0
  while (placed < M) {
    const i = Math.floor(Math.random() * W * H)
    if (avoid.has(i) || c[i].mine) continue
    c[i].mine = true
    placed++
  }
  c.forEach((cell, i) => { cell.n = nb(i).filter((j) => c[j].mine).length })
  return c
}

export default function Minesweeper() {
  const [cells, setCells] = useState(blank)
  const [planted, setPlanted] = useState(false)
  const [status, setStatus] = useState('play')
  const [flagMode, setFlagMode] = useState(false)
  const [time, setTime] = useState(0)
  const [best, submit] = useBestScore('minesweeper', 'best', 'low')
  const play = useSound()

  useInterval(() => setTime((t) => t + 1), 1000, planted && status === 'play')

  const reset = () => { setCells(blank()); setPlanted(false); setStatus('play'); setTime(0) }
  const flagsLeft = M - cells.filter((c) => c.flag).length

  const toggleFlag = (i) => {
    if (status !== 'play' || cells[i].open) return
    setCells((cs) => cs.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)))
  }
  const open = (i) => {
    if (status !== 'play') return
    if (flagMode) return toggleFlag(i)
    let c = planted ? cells.map((x) => ({ ...x })) : plant(cells, i)
    if (!planted) setPlanted(true)
    if (c[i].flag || c[i].open) return
    if (c[i].mine) {
      c.forEach((x) => x.mine && (x.open = true))
      setCells(c)
      setStatus('lost')
      return play('bad')
    }
    const stack = [i]
    while (stack.length) {
      const j = stack.pop()
      if (c[j].open || c[j].flag) continue
      c[j].open = true
      if (c[j].n === 0) stack.push(...nb(j))
    }
    setCells(c)
    if (c.every((x) => x.mine || x.open)) {
      setStatus('won')
      submit(time)
      play('win')
    } else play('pop')
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Mines left" value={flagsLeft} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best != null ? `${best}s` : '—'} />
      </div>
      <div className="mb-3 flex gap-2">
        <button className="btn btn-sm" onClick={reset}>New game</button>
        <button className={`btn btn-sm ${flagMode ? 'btn-primary' : ''}`} aria-pressed={flagMode} onClick={() => setFlagMode((f) => !f)}>
          <Flag size={14} aria-hidden /> Flag mode
        </button>
      </div>
      <div className="grid gap-1 rounded-2xl border-2 border-ink bg-soft p-2" style={{ gridTemplateColumns: `repeat(${W}, 1fr)` }} onContextMenu={(e) => e.preventDefault()}>
        {cells.map((c, i) => (
          <button
            key={i}
            aria-label={c.open ? (c.mine ? 'mine' : `${c.n} nearby`) : c.flag ? 'flagged' : 'hidden'}
            onClick={() => open(i)}
            onContextMenu={(e) => { e.preventDefault(); toggleFlag(i) }}
            className="no-select grid aspect-square place-items-center rounded-md text-lg font-extrabold"
            style={{ background: c.open ? (c.mine ? '#fecaca' : 'var(--card)') : 'color-mix(in srgb, var(--ink) 14%, var(--soft))', color: COLORS[c.n] }}
          >
            {c.open ? (c.mine ? '💣' : c.n || '') : c.flag ? '🚩' : ''}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">
        {status === 'won' ? '🎉 Cleared!' : status === 'lost' ? '💥 Boom!' : ''}
      </p>
      <p className="mt-1 text-sm text-muted">Right-click (or use Flag mode) to mark mines. Your first click is always safe.</p>
    </div>
  )
}
