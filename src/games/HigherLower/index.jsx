import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'

const SUITS = ['♠', '♥', '♦', '♣']
const FACE = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
const card = () => ({ v: 1 + Math.floor(Math.random() * 13), s: SUITS[Math.floor(Math.random() * 4)] })
const Card = ({ c, hidden }) => (
  <div className="grid h-52 w-36 place-items-center rounded-2xl border-2 border-ink bg-card font-display text-6xl font-extrabold shadow-lg"
    style={{ color: hidden ? 'var(--muted)' : c.s === '♥' || c.s === '♦' ? '#dc2626' : 'var(--ink)' }}>
    {hidden ? '?' : <span>{FACE[c.v] || c.v}<span className="block text-center text-4xl">{c.s}</span></span>}
  </div>
)

export default function HigherLower() {
  const [cur, setCur] = useState(card)
  const [next, setNext] = useState(null)
  const [streak, setStreak] = useState(0)
  const [over, setOver] = useState(false)
  const [msg, setMsg] = useState('Will the next card be higher or lower?')
  const [best, submit] = useBestScore('higher-lower')
  const play = useSound()

  const guess = (higher) => {
    if (over || next) return
    const n = card()
    setNext(n)
    const tie = n.v === cur.v
    const ok = tie || (higher ? n.v > cur.v : n.v < cur.v)
    if (!ok) {
      setOver(true)
      submit(streak)
      setMsg(`Wrong! Streak ended at ${streak}`)
      return play('bad')
    }
    play('good')
    if (!tie) setStreak(streak + 1)
    setMsg(tie ? 'A tie — safe!' : 'Correct!')
    setTimeout(() => { setCur(n); setNext(null) }, 900)
  }
  const reset = () => { setCur(card()); setNext(null); setStreak(0); setOver(false); setMsg('Will the next card be higher or lower?') }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-4 grid grid-cols-2 gap-3 text-left">
        <Stat label="Streak" value={streak} />
        <Stat label="Best streak" value={best ?? '—'} />
      </div>
      <div className="flex justify-center gap-6"><Card c={cur} /><Card c={next} hidden={!next} /></div>
      <p className="mt-5 font-display text-xl font-bold" aria-live="polite">{msg}</p>
      <div className="mt-4 flex justify-center gap-3">
        {over ? <button className="btn btn-primary" onClick={reset}>Play again</button> : (
          <>
            <button className="btn btn-primary" disabled={!!next} onClick={() => guess(true)}><ArrowUp size={16} aria-hidden /> Higher</button>
            <button className="btn" disabled={!!next} onClick={() => guess(false)}><ArrowDown size={16} aria-hidden /> Lower</button>
          </>
        )}
      </div>
    </div>
  )
}
