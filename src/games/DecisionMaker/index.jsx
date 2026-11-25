import { useEffect, useRef, useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { useIdbCollection, useSound } from '../../hooks/index.js'

const DEFAULTS = ['Pizza', 'Tacos', 'Sushi']

export default function DecisionMaker() {
  const [options, setOptions] = useState(DEFAULTS)
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(-1)
  const [winner, setWinner] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [name, setName] = useState('')
  const [history, setHistory] = useState([])
  const saved = useIdbCollection('decision-lists')
  const timer = useRef(null)
  const play = useSound()
  useEffect(() => () => clearTimeout(timer.current), [])

  const add = (e) => {
    e.preventDefault()
    const v = draft.trim().slice(0, 40)
    if (!v || options.some((o) => o.toLowerCase() === v.toLowerCase()) || options.length >= 20) return
    setOptions([...options, v])
    setDraft('')
    setWinner(null)
  }

  function spin() {
    if (spinning || options.length < 2) return
    setSpinning(true)
    setWinner(null)
    const target = Math.floor(Math.random() * options.length)
    const steps = options.length * 4 + target + 1
    let i = 0
    const tick = () => {
      const idx = i % options.length
      setActive(idx)
      play('tick')
      i++
      if (i <= steps) timer.current = setTimeout(tick, 60 + Math.pow(i / steps, 3) * 380)
      else {
        setSpinning(false)
        setWinner(options[idx])
        setHistory((h) => [options[idx], ...h].slice(0, 6))
        play('win')
      }
    }
    tick()
  }

  async function save() {
    const n = name.trim().slice(0, 30)
    if (!n || options.length < 2) return
    await saved.put(n, { options })
    setName('')
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_16rem]">
      <div>
        <form onSubmit={add} className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">New option</span>
            <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an option…" maxLength={40} />
          </label>
          <button className="btn" type="submit"><Plus size={16} aria-hidden /> Add</button>
        </form>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Options">
          {options.map((o, i) => (
            <li
              key={o}
              className="flex items-center justify-between rounded-xl border-2 px-4 py-3 font-medium transition-colors"
              style={{ borderColor: active === i ? 'var(--game)' : 'var(--line)', background: active === i ? 'color-mix(in srgb, var(--game) 25%, transparent)' : 'var(--card)' }}
            >
              {o}
              <button className="text-muted hover:text-ink" disabled={spinning} aria-label={`Remove ${o}`} onClick={() => { setOptions(options.filter((x) => x !== o)); setActive(-1); setWinner(null) }}>
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        {options.length < 2 && <p className="mt-3 text-sm text-accent">Add at least two options.</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary !px-8 !py-3 !text-base" onClick={spin} disabled={spinning || options.length < 2}>
            {spinning ? 'Spinning…' : 'Spin'}
          </button>
          <button className="btn btn-ghost" onClick={() => { setOptions([]); setWinner(null); setActive(-1) }} disabled={spinning}>Clear all</button>
        </div>
        <div aria-live="polite" className="mt-5 min-h-24">
          {winner && (
            <div className="card p-6 text-center" style={{ borderColor: 'var(--game)' }}>
              <p className="text-sm uppercase tracking-widest text-muted">The universe says</p>
              <p className="font-display text-4xl font-extrabold">{winner}</p>
            </div>
          )}
        </div>
        {history.length > 0 && <p className="text-sm text-muted">Previous: {history.slice(1).join(' · ') || '—'}</p>}
      </div>

      <aside className="card h-fit p-4" aria-label="Saved lists">
        <h2 id="saved-lists-title" className="text-lg font-bold">Saved lists</h2>
        <div className="mt-2 flex gap-2">
          <input className="field !py-1.5" placeholder="List name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} aria-label="List name" />
          <button className="btn btn-sm" onClick={save} aria-label="Save current list"><Save size={14} /></button>
        </div>
        <ul className="mt-3 space-y-1">
          {saved.ready && saved.items.length === 0 && <li className="text-sm text-muted">Nothing saved yet.</li>}
          {saved.items.map(({ key, value }) => (
            <li key={key} className="flex items-center justify-between gap-2">
              <button className="truncate text-left text-sm font-medium hover:text-game" onClick={() => { setOptions(value.options); setWinner(null) }}>
                {key} <span className="text-muted">({value.options.length})</span>
              </button>
              <button className="text-muted hover:text-ink" aria-label={`Delete list ${key}`} onClick={() => saved.remove(key)}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
