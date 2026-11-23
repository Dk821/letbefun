import { useMemo } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useGameData } from '../../hooks/index.js'
import { ITEMS, FORTUNE, money } from './items.js'

export default function SpendMoney() {
  const [qty, setQty] = useGameData('spend-the-fortune', 'qty', {}, (v) => v && typeof v === 'object' && !Array.isArray(v))

  const spent = useMemo(() => ITEMS.reduce((s, it) => s + (qty[it.id] || 0) * it.price, 0), [qty])
  const balance = FORTUNE - spent
  const receipt = ITEMS.filter((i) => qty[i.id] > 0)

  const maxFor = (it) => Math.floor((balance + (qty[it.id] || 0) * it.price) / it.price)
  const set = (it, n) => {
    const v = Math.max(0, Math.min(maxFor(it), Math.floor(Number.isFinite(n) ? n : 0)))
    setQty((q) => {
      const next = { ...q, [it.id]: v }
      if (!v) delete next[it.id]
      return next
    })
  }

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-4 border-y-2 border-ink px-4 py-3 text-center text-white" style={{ background: 'color-mix(in srgb, var(--game) 62%, #000)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest">Your fictional fortune</p>
        <p className="font-display text-3xl font-extrabold sm:text-5xl" aria-live="polite">{money(balance)}</p>
        <div className="mx-auto mt-1 h-1.5 max-w-md overflow-hidden rounded-full bg-black/25" aria-hidden>
          <div className="h-full bg-white" style={{ width: `${(balance / FORTUNE) * 100}%` }} />
        </div>
        {balance === 0 && <p className="mt-1 font-semibold" role="status">🎉 You spent every last dollar. Impressive and slightly worrying.</p>}
      </div>

      <h2 className="sr-only">Things to buy</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => {
          const n = qty[it.id] || 0
          return (
            <div key={it.id} className="card flex flex-col items-center p-4 text-center">
              <span className="text-5xl" aria-hidden>{it.emoji}</span>
              <h3 className="mt-1 text-lg font-bold">{it.name}</h3>
              <p className="font-mono text-sm text-muted">{money(it.price)}</p>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn btn-sm" disabled={n === 0} onClick={() => set(it, n - 1)} aria-label={`Sell one ${it.name}`}><Minus size={14} /></button>
                <label>
                  <span className="sr-only">Quantity of {it.name}</span>
                  <input
                    className="field !w-24 !px-2 !py-1 text-center font-mono"
                    inputMode="numeric"
                    value={n}
                    onChange={(e) => set(it, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                  />
                </label>
                <button className="btn btn-sm btn-primary" disabled={maxFor(it) <= n} onClick={() => set(it, n + 1)} aria-label={`Buy one ${it.name}`}><Plus size={14} /></button>
              </div>
              <button className="mt-2 text-xs text-muted underline hover:text-ink disabled:opacity-40" disabled={maxFor(it) <= n} onClick={() => set(it, maxFor(it))}>
                Buy max ({maxFor(it).toLocaleString()})
              </button>
            </div>
          )
        })}
      </div>

      <section className="card mx-auto mt-8 max-w-md p-5 font-mono text-sm" aria-label="Receipt">
        <h2 className="mb-2 text-center font-display text-xl font-bold">Your receipt</h2>
        {receipt.length === 0 && <p className="text-center text-muted">Nothing purchased yet.</p>}
        {receipt.map((it) => (
          <div key={it.id} className="flex justify-between border-b border-dashed border-line py-1">
            <span>{it.name} × {qty[it.id].toLocaleString()}</span>
            <span>{money(qty[it.id] * it.price)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between font-bold"><span>Total</span><span>{money(spent)}</span></div>
        <div className="flex justify-between text-muted"><span>Remaining</span><span>{money(balance)}</span></div>
        <button className="btn btn-sm mx-auto mt-4 flex" onClick={() => setQty({})}><RotateCcw size={14} aria-hidden /> Reset spending</button>
      </section>
      <p className="mt-4 text-center text-xs text-muted">Prices are rounded, approximate and for fun.</p>
    </div>
  )
}
