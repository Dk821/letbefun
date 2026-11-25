import { useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useSound } from '../../hooks/index.js'

const SIDES = [4, 6, 8, 10, 12, 20]
const roll = (s) => 1 + Math.floor(Math.random() * s)

export default function DiceAndCoin() {
  const [sides, setSides] = useState(6)
  const [count, setCount] = useState(2)
  const [dice, setDice] = useState([])
  const [coin, setCoin] = useState(null)
  const [tally, setTally] = useState({ H: 0, T: 0 })
  const [log, setLog] = useState([])
  const [spin, setSpin] = useState(0)
  const play = useSound()

  const rollDice = () => {
    const d = Array.from({ length: count }, () => roll(sides))
    setDice(d)
    setLog((l) => [`${count}d${sides}: ${d.join(' + ')} = ${d.reduce((a, b) => a + b, 0)}`, ...l].slice(0, 8))
    play('pop')
  }
  const flip = () => {
    const r = Math.random() < 0.5 ? 'H' : 'T'
    setCoin(r)
    setSpin((s) => s + 1)
    setTally((t) => ({ ...t, [r]: t[r] + 1 }))
    setLog((l) => [`Coin: ${r === 'H' ? 'Heads' : 'Tails'}`, ...l].slice(0, 8))
    play('good')
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      <section className="card p-5">
        <h2 id="dice-title" className="text-xl font-bold">Dice</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIDES.map((s) => <button key={s} className="chip" aria-pressed={sides === s} onClick={() => setSides(s)}>d{s}</button>)}
        </div>
        <label className="mt-3 flex items-center gap-3 text-sm text-muted">Dice: <b className="text-ink">{count}</b>
          <input type="range" min="1" max="6" value={count} onChange={(e) => setCount(+e.target.value)} aria-label="Number of dice" />
        </label>
        <div className="mt-4 flex min-h-20 flex-wrap gap-2">
          {dice.map((d, i) => (
            <span key={i} className="grid size-16 place-items-center rounded-xl border-2 border-ink bg-soft font-display text-2xl font-extrabold">{d}</span>
          ))}
        </div>
        <p className="mt-2 font-display text-lg font-bold">{dice.length ? `Total: ${dice.reduce((a, b) => a + b, 0)}` : ''}</p>
        <button className="btn btn-primary mt-3" onClick={rollDice}>🎲 Roll</button>
      </section>
      <section className="card p-5">
        <h2 id="coin-title" className="text-xl font-bold">Coin</h2>
        <div className="my-4 grid place-items-center">
          <div className="grid size-32 place-items-center rounded-full border-4 border-ink text-5xl font-extrabold"
            style={{ background: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b)', transform: `rotateY(${spin * 720}deg)`, transition: 'transform .6s' }}>
            {coin ? (coin === 'H' ? '👑' : '⭐') : '?'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3"><Stat label="Heads" value={tally.H} /><Stat label="Tails" value={tally.T} /></div>
        <button className="btn btn-primary mt-3" onClick={flip}>🪙 Flip</button>
      </section>
      {log.length > 0 && (
        <ul className="card space-y-1 p-4 text-sm text-muted md:col-span-2" aria-label="History">
          {log.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      )}
    </div>
  )
}
