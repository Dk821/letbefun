import { useEffect, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const DURATIONS = [5, 10, 30]

export default function ClickSpeed() {
  const [dur, setDur] = useState(5)
  const [state, setState] = useState('idle')
  const [clicks, setClicks] = useState(0)
  const [left, setLeft] = useState(5)
  const [best, submit] = useBestScore('click-speed', `best${dur}`)
  const t0 = useRef(0)
  const play = useSound()

  useEffect(() => {
    if (state !== 'run') return
    const id = setInterval(() => {
      const rem = dur - (performance.now() - t0.current) / 1000
      if (rem <= 0) {
        setLeft(0)
        setState('over')
        clearInterval(id)
      } else setLeft(rem)
    }, 50)
    return () => clearInterval(id)
  }, [state, dur])

  useEffect(() => {
    if (state === 'over') {
      submit(+(clicks / dur).toFixed(2))
      play('win')
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const click = () => {
    if (state === 'over') return
    if (state === 'idle') {
      t0.current = performance.now()
      setState('run')
    }
    setClicks((c) => c + 1)
    play('tick')
  }
  const reset = (d = dur) => { setDur(d); setLeft(d); setClicks(0); setState('idle') }
  const cps = clicks / dur

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex gap-2">
        {DURATIONS.map((d) => <button key={d} className="chip" aria-pressed={dur === d} disabled={state === 'run'} onClick={() => reset(d)}>{d}s</button>)}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Clicks" value={clicks} />
        <Stat label="Time left" value={`${left.toFixed(1)}s`} />
        <Stat label={`Best CPS (${dur}s)`} value={best ?? '—'} />
      </div>
      <button onPointerDown={click} disabled={state === 'over'} className="no-select grid h-64 w-full place-items-center rounded-3xl border-2 border-ink font-display text-4xl font-extrabold"
        style={{ background: state === 'run' ? 'color-mix(in srgb, var(--game) 35%, var(--card))' : 'var(--soft)' }}>
        {state === 'idle' ? 'Click to start' : state === 'run' ? 'CLICK!' : `${cps.toFixed(2)} CPS`}
      </button>
      {state === 'over' && <div className="mt-4 text-center"><button className="btn btn-primary" onClick={() => reset()}>Try again</button></div>}
    </div>
  )
}
