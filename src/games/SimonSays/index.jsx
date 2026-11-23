import { useEffect, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const PADS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6']
const rand = () => Math.floor(Math.random() * 4)

export default function SimonSays() {
  const [seq, setSeq] = useState([])
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | show | input | wait | over
  const [lit, setLit] = useState(-1)
  const [best, submit] = useBestScore('simon-says')
  const timers = useRef([])
  const play = useSound()
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const show = (s) => {
    setPhase('show')
    setStep(0)
    const gap = Math.max(280, 600 - s.length * 25)
    s.forEach((p, i) => {
      later(() => { setLit(p); play('pop') }, i * gap + 400)
      later(() => setLit(-1), i * gap + 400 + gap * 0.6)
    })
    later(() => setPhase('input'), s.length * gap + 400)
  }
  const start = () => { const s = [rand()]; setSeq(s); show(s) }

  const press = (p) => {
    if (phase !== 'input') return
    setLit(p)
    later(() => setLit(-1), 160)
    if (p !== seq[step]) {
      setPhase('over')
      submit(seq.length - 1)
      return play('bad')
    }
    play('pop')
    if (step + 1 === seq.length) {
      const s = [...seq, rand()]
      setSeq(s)
      setPhase('wait')
      play('good')
      later(() => show(s), 800)
    } else setStep(step + 1)
  }

  const round = phase === 'over' ? seq.length - 1 : seq.length
  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Stat label="Round" value={phase === 'idle' ? 0 : round} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-3xl border-2 border-ink bg-soft p-3">
        {PADS.map((c, i) => (
          <button key={i} onPointerDown={() => press(i)} aria-label={`pad ${i + 1}`}
            className="no-select aspect-square rounded-2xl transition-all"
            style={{ background: c, opacity: lit === i ? 1 : 0.45, transform: lit === i ? 'scale(1.03)' : 'none', boxShadow: lit === i ? `0 0 40px ${c}` : 'none' }} />
        ))}
      </div>
      <p className="mt-3 text-center font-display text-xl font-bold" aria-live="polite">
        {phase === 'show' ? 'Watch…' : phase === 'input' ? 'Your turn' : phase === 'over' ? `Wrong! You reached round ${round}` : phase === 'wait' ? 'Nice!' : 'Repeat the pattern'}
      </p>
      {(phase === 'idle' || phase === 'over') && (
        <div className="mt-2 text-center"><button className="btn btn-primary" onClick={start}>{phase === 'over' ? 'Try again' : 'Start'}</button></div>
      )}
    </div>
  )
}
