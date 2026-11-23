import { useCallback, useEffect, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useGameData, useKey, useSound } from '../../hooks/index.js'

const SLUG = 'reaction-test'
const COPY = {
  idle: ['Click to start', 'When the panel turns green, click as fast as you can.'],
  waiting: ['Wait for green…', 'Do not click yet.'],
  ready: ['CLICK!', ''],
  early: ['Too soon!', 'You clicked before green. Click to try again.'],
}

export default function ReactionTest() {
  const [phase, setPhase] = useState('idle')
  const [last, setLast] = useState(null)
  const [best, submitBest] = useBestScore(SLUG, 'best', 'low')
  const [history, setHistory] = useGameData(SLUG, 'history', [], Array.isArray)
  const timer = useRef(null)
  const t0 = useRef(0)
  const play = useSound()

  useEffect(() => () => clearTimeout(timer.current), [])

  const begin = useCallback(() => {
    setPhase('waiting')
    timer.current = setTimeout(() => {
      t0.current = performance.now()
      setPhase('ready')
      play('tick')
    }, 1500 + Math.random() * 3500)
  }, [play])

  const press = useCallback(() => {
    if (phase === 'idle' || phase === 'early' || phase === 'result') return begin()
    if (phase === 'waiting') {
      clearTimeout(timer.current)
      setPhase('early')
      play('bad')
    } else if (phase === 'ready') {
      const ms = Math.round(performance.now() - t0.current)
      setLast(ms)
      submitBest(ms)
      setHistory((h) => [ms, ...h].slice(0, 10))
      setPhase('result')
      play('good')
    }
  }, [phase, begin, submitBest, setHistory, play])

  useKey((e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault()
      press()
    }
  }, [press])

  const recent = history.slice(0, 5)
  const avg = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : null
  const [title, sub] = phase === 'result' ? [`${last} ms`, 'Click to go again.'] : COPY[phase]
  const bg = { idle: 'var(--soft)', waiting: '#ef4444', ready: '#22c55e', early: '#f59e0b', result: 'var(--soft)' }[phase]
  const light = phase === 'waiting' || phase === 'ready' || phase === 'early'

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={press}
        className="no-select grid h-72 w-full place-items-center rounded-3xl border-2 border-ink px-6 text-center transition-colors sm:h-96"
        style={{ background: bg, color: light ? '#fff' : 'var(--ink)' }}
        aria-live="polite"
      >
        <span>
          <span className="block font-display text-5xl font-extrabold sm:text-6xl">{title}</span>
          <span className="mt-2 block opacity-90">{sub}</span>
        </span>
      </button>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Last" value={last != null ? `${last} ms` : '—'} />
        <Stat label="Avg (5)" value={avg != null ? `${avg} ms` : '—'} />
        <Stat label="Best" value={best != null ? `${best} ms` : '—'} />
      </div>
      <p className="mt-3 text-sm text-muted">Tip: press Space to react without the mouse. Average human reaction to a visual cue is about 250 ms.</p>
    </div>
  )
}
