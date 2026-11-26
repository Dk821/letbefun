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
    <div className="flex min-h-full flex-col lg:h-full">
      <div className="sticky top-0 z-10 -mx-2 shrink-0 border-y-2 border-ink px-2 py-3 text-center text-white sm:-mx-4 sm:px-4 lg:static lg:mx-0 lg:border-t-0 lg:px-0" style={{ background: 'color-mix(in srgb, var(--game) 62%, #000)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest">Your fictional fortune</p>
        <p className="font-display text-3xl font-extrabold sm:text-5xl" aria-live="polite">{money(balance)}</p>
        <div className="mx-auto mt-1 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-black/25" aria-hidden>
          <div className="h-full bg-white" style={{ width: `${(balance / FORTUNE) * 100}%` }} />
        </div>
        {balance === 0 && <p className="mt-1 font-semibold" role="status">🎉 You spent every last dollar. Impressive and slightly worrying.</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 py-5 lg:flex-row lg:gap-6">
        <div className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <h2 id="spend-items-title" className="sr-only">Things to buy</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {ITEMS.map((it) => {
              const n = qty[it.id] || 0
              return (
                <div key={it.id} className="card flex min-w-0 flex-col items-center p-3 text-center sm:p-4">
                  <span className="text-4xl sm:text-5xl" aria-hidden>{it.emoji}</span>
                  <h3 id={`spend-item-${it.id}`} className="mt-1 text-lg font-bold">{it.name}</h3>
                  <p className="font-mono text-sm text-muted">{money(it.price)}</p>
                  <div className="mt-3 flex w-full min-w-0 items-center justify-center gap-2">
                    <button className="btn btn-sm shrink-0" disabled={n === 0} onClick={() => set(it, n - 1)} aria-label={`Sell one ${it.name}`}><Minus size={14} /></button>
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Quantity of {it.name}</span>
                      <input
                        className="field !px-2 !py-1 text-center font-mono"
                        inputMode="numeric"
                        value={n}
                        onChange={(e) => set(it, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                      />
                    </label>
                    <button className="btn btn-sm btn-primary shrink-0" disabled={maxFor(it) <= n} onClick={() => set(it, n + 1)} aria-label={`Buy one ${it.name}`}><Plus size={14} /></button>
                  </div>
                  <button className="mt-2 text-xs text-muted underline hover:text-ink disabled:opacity-40" disabled={maxFor(it) <= n} onClick={() => set(it, maxFor(it))}>
                    Buy max ({maxFor(it).toLocaleString()})
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <section className="card w-full shrink-0 p-5 font-mono text-sm lg:max-h-full lg:w-80 lg:overflow-y-auto 2xl:w-96" aria-label="Receipt">
          <h2 id="spend-receipt-title" className="mb-2 text-center font-display text-xl font-bold">Your receipt</h2>
          {receipt.length === 0 && <p className="text-center text-muted">Nothing purchased yet.</p>}
          {receipt.map((it) => (
            <div key={it.id} className="flex min-w-0 justify-between gap-3 border-b border-dashed border-line py-1">
              <span className="min-w-0 truncate">{it.name} × {qty[it.id].toLocaleString()}</span>
              <span className="shrink-0">{money(qty[it.id] * it.price)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between gap-3 font-bold"><span>Total</span><span className="shrink-0">{money(spent)}</span></div>
          <div className="flex justify-between gap-3 text-muted"><span>Remaining</span><span className="shrink-0">{money(balance)}</span></div>
          <button className="btn btn-sm mx-auto mt-4 flex" onClick={() => setQty({})}><RotateCcw size={14} aria-hidden /> Reset spending</button>
        </section>
      </div>
      <p className="shrink-0 pb-2 text-center text-xs text-muted">Prices are rounded, approximate and for fun.</p>
    </div>
  )
}
