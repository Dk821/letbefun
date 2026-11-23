import { useEffect, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useInterval, useSound } from '../../hooks/index.js'

const TIME = 30

export default function WhackAMole() {
  const [state, setState] = useState('idle')
  const [mole, setMole] = useState(-1)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(TIME)
  const [best, submit] = useBestScore('whack-a-mole')
  const play = useSound()

  useInterval(() => setTime((t) => t - 1), 1000, state === 'run')
  useInterval(() => setMole((m) => {
    let n
    do n = Math.floor(Math.random() * 9)
    while (n === m)
    return n
  }), Math.max(420, 850 - score * 14), state === 'run')

  useEffect(() => {
    if (state === 'run' && time <= 0) {
      setState('over')
      setMole(-1)
      submit(score)
      play('win')
    }
  }, [time, state]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setScore(0); setTime(TIME); setMole(-1); setState('run') }
  const whack = (i) => {
    if (state !== 'run') return
    if (i === mole) {
      setScore((s) => s + 1)
      setMole(-1)
      play('good')
    } else play('tick')
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Time" value={`${time}s`} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border-2 border-ink bg-soft p-3">
          {Array.from({ length: 9 }, (_, i) => (
            <button key={i} onPointerDown={() => whack(i)} aria-label={i === mole ? 'mole' : 'empty hole'}
              className="no-select grid aspect-square place-items-center overflow-hidden rounded-full text-5xl"
              style={{ background: 'color-mix(in srgb, var(--game) 35%, #3b2a14)', boxShadow: 'inset 0 -10px 0 rgba(0,0,0,.35)' }}>
              <span style={{ transform: i === mole ? 'translateY(0)' : 'translateY(120%)', transition: 'transform .12s' }}>🐹</span>
            </button>
          ))}
        </div>
        {state !== 'run' && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-bg/75 text-center">
            <div>
              <p className="font-display text-3xl font-extrabold">{state === 'over' ? `Time! ${score} whacks` : 'Whack-a-Mole'}</p>
              <button className="btn btn-primary mt-4" onClick={start}>{state === 'over' ? 'Play again' : 'Start'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
