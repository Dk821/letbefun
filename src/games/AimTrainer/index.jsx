import { useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const TOTAL = 20
const pos = () => ({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 80 })

export default function AimTrainer() {
  const [state, setState] = useState('idle')
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [target, setTarget] = useState(pos)
  const [result, setResult] = useState(null)
  const [best, submit] = useBestScore('aim-trainer', 'best', 'low')
  const t0 = useRef(0)
  const play = useSound()

  const start = () => { setHits(0); setMisses(0); setResult(null); setTarget(pos()); t0.current = performance.now(); setState('run') }
  const hit = (e) => {
    e.stopPropagation()
    const n = hits + 1
    setHits(n)
    play('pop')
    if (n >= TOTAL) {
      const ms = Math.round(performance.now() - t0.current)
      setResult(ms)
      submit(ms)
      setState('over')
      play('win')
    } else setTarget(pos())
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Targets left" value={TOTAL - hits} />
        <Stat label="Misses" value={misses} />
        <Stat label="Best time" value={best != null ? `${(best / 1000).toFixed(2)}s` : '—'} />
      </div>
      <div className="relative h-[26rem] w-full touch-none overflow-hidden rounded-3xl border-2 border-ink bg-soft"
        onPointerDown={() => state === 'run' && (setMisses((m) => m + 1), play('tick'))}>
        {state === 'run' && (
          <button onPointerDown={hit} aria-label="target" className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card"
            style={{ left: `${target.x}%`, top: `${target.y}%`, background: 'radial-gradient(circle, #fff 0 12%, var(--game) 13% 40%, #fff 41% 55%, var(--game) 56%)' }} />
        )}
        {state !== 'run' && (
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-3xl font-extrabold">{state === 'over' ? `${(result / 1000).toFixed(2)}s · ${Math.round(result / TOTAL)} ms/target` : 'Hit 20 targets fast'}</p>
              <button className="btn btn-primary mt-4" onClick={start}>{state === 'over' ? 'Try again' : 'Start'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
