import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useGameData, useSound } from '../../hooks/index.js'

const UPGRADES = [
  { id: 'glove', name: 'Lucky Glove', emoji: '🧤', base: 15, click: 1, desc: '+1 per click' },
  { id: 'piggy', name: 'Piggy Bank', emoji: '🐷', base: 60, auto: 1, desc: '+1 coin / sec' },
  { id: 'magnet', name: 'Coin Magnet', emoji: '🧲', base: 250, click: 5, desc: '+5 per click' },
  { id: 'mine', name: 'Tiny Mine', emoji: '⛏️', base: 900, auto: 8, desc: '+8 coins / sec' },
  { id: 'bank', name: 'Neighborhood Bank', emoji: '🏦', base: 5000, auto: 50, desc: '+50 coins / sec' },
  { id: 'dragon', name: 'Friendly Dragon', emoji: '🐉', base: 30000, auto: 300, desc: '+300 coins / sec' },
]
const GROWTH = 1.15
const cost = (u, n) => Math.ceil(u.base * Math.pow(GROWTH, n))
const fmt = (n) => (n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : Math.floor(n).toLocaleString())
const valid = (v) => v && typeof v === 'object' && typeof v.coins === 'number' && typeof v.owned === 'object'
const FRESH = { coins: 0, total: 0, owned: {}, clicks: 0 }

export default function MoneyClicker() {
  const [saved, setSaved] = useGameData('money-clicker', 'save', FRESH, valid)
  const [state, setState] = useState(saved)
  const [paused, setPaused] = useState(false)
  const [pops, setPops] = useState([])
  const ref = useRef(state)
  ref.current = state
  const play = useSound()

  const perClick = 1 + UPGRADES.reduce((s, u) => s + (u.click || 0) * (state.owned[u.id] || 0), 0)
  const perSec = UPGRADES.reduce((s, u) => s + (u.auto || 0) * (state.owned[u.id] || 0), 0)

  // game loop — 10 ticks / second, not per frame
  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => {
      const rate = UPGRADES.reduce((s, u) => s + (u.auto || 0) * (ref.current.owned[u.id] || 0), 0)
      if (rate > 0) setState((s) => ({ ...s, coins: s.coins + rate / 10, total: s.total + rate / 10 }))
    }, 100)
    return () => clearInterval(id)
  }, [paused])

  // autosave every 2s + on unmount
  useEffect(() => {
    const id = setInterval(() => setSaved(ref.current), 2000)
    return () => {
      clearInterval(id)
      setSaved(ref.current)
    }
  }, [setSaved])

  function click(e) {
    if (paused) return
    play('pop')
    setState((s) => ({ ...s, coins: s.coins + perClick, total: s.total + perClick, clicks: s.clicks + 1 }))
    const id = performance.now() + Math.random()
    setPops((p) => [...p.slice(-8), { id, x: 30 + Math.random() * 40 }])
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 700)
  }

  function buy(u) {
    const n = state.owned[u.id] || 0
    const c = cost(u, n)
    if (state.coins < c) return
    play('good')
    setState((s) => ({ ...s, coins: s.coins - c, owned: { ...s.owned, [u.id]: n + 1 } }))
  }

  function reset() {
    if (window.confirm('Erase all Coin Clicker progress?')) {
      setState(FRESH)
      setSaved(FRESH)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Coins" value={fmt(state.coins)} />
        <Stat label="Per click" value={fmt(perClick)} />
        <Stat label="Per second" value={fmt(perSec)} />
        <Stat label="Lifetime" value={fmt(state.total)} />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="text-center">
          <div className="relative inline-block">
            <button
              onClick={click}
              onKeyDown={(e) => e.code === 'Space' && e.preventDefault()}
              className="no-select grid size-52 place-items-center rounded-full border-4 border-ink bg-game text-8xl shadow-[0_8px_0_var(--ink)] transition-transform active:translate-y-2 active:shadow-none sm:size-64"
              aria-label={`Click to earn ${perClick} coins`}
            >
              🪙
            </button>
            {pops.map((p) => (
              <span key={p.id} className="pointer-events-none absolute top-0 animate-[floatup_0.7s_ease-out_forwards] font-mono text-xl font-bold" style={{ left: `${p.x}%` }}>+{perClick}</span>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <button className="btn btn-sm" onClick={() => setPaused((p) => !p)}>{paused ? <Play size={14} /> : <Pause size={14} />} {paused ? 'Resume' : 'Pause'}</button>
            <button className="btn btn-sm btn-ghost" onClick={reset}>Reset save</button>
          </div>
          <p className="mt-2 text-xs text-muted">{state.clicks.toLocaleString()} clicks · saved automatically</p>
        </div>
        <ul className="space-y-2" aria-label="Upgrades">
          {UPGRADES.map((u) => {
            const n = state.owned[u.id] || 0
            const c = cost(u, n)
            const can = state.coins >= c
            return (
              <li key={u.id}>
                <button onClick={() => buy(u)} disabled={!can} className="card flex w-full items-center gap-3 p-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-game disabled:opacity-55">
                  <span className="text-3xl" aria-hidden>{u.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-bold">{u.name} <span className="font-mono text-xs text-muted">×{n}</span></span>
                    <span className="block text-xs text-muted">{u.desc}</span>
                  </span>
                  <span className="font-mono text-sm font-medium">🪙 {fmt(c)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <style>{`@keyframes floatup{from{transform:translateY(40px);opacity:1}to{transform:translateY(-30px);opacity:0}}`}</style>
    </div>
  )
}
