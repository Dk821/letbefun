import { useEffect, useMemo, useRef, useState } from 'react'
import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { useIdbCollection, useSound } from '../../hooks/index.js'
import { ALL_RESULTS, BASE, keyOf, knownEmoji } from './recipes.js'
import { combine } from './engine.js'

const CHIP_W = 150

export default function InfiniteCraft() {
  const discovered = useIdbCollection('craft-discovered')
  const customDb = useIdbCollection('craft-recipes')
  const [items, setItems] = useState([]) // workspace instances {id,name,emoji,x,y}
  const [sel, setSel] = useState(null)
  const [msg, setMsg] = useState('Drag an element onto another to combine them.')
  const [form, setForm] = useState({ a: '', b: '', r: '', e: '✨' })
  const [filter, setFilter] = useState('')
  const [elementsOpen, setElementsOpen] = useState(true)
  const area = useRef(null)
  const drag = useRef(null)
  const nextId = useRef(1)
  const play = useSound()

  const known = useMemo(() => {
    const m = new Map(BASE.map((b) => [b.name, b.emoji]))
    discovered.items.forEach(({ key, value }) => m.set(key, value.emoji))
    return m
  }, [discovered.items])
  const custom = useMemo(() => new Map(customDb.items.map(({ value }) => [value.k, { name: value.r, emoji: value.e }])), [customDb.items])

  const list = [...known.entries()].filter(([n]) => n.toLowerCase().includes(filter.toLowerCase()))
  const total = ALL_RESULTS.size + BASE.length

  function addItem(name, emoji, at) {
    const r = area.current?.getBoundingClientRect()
    const w = r?.width ?? 600
    const x = at?.x ?? Math.min(w - CHIP_W, 20 + Math.random() * Math.max(10, w - CHIP_W - 40))
    const y = at?.y ?? 20 + Math.random() * 220
    setItems((it) => [...it, { id: nextId.current++, name, emoji, x, y }])
  }

  function tryCombine(a, b) {
    const res = combine(a.name, b.name, custom)
    if (!res) {
      play('bad')
      setMsg(`${a.name} + ${b.name}: nothing happens.`)
      return false
    }
    const isNew = !known.has(res.name)
    if (isNew) discovered.put(res.name, { emoji: res.emoji })
    setItems((it) => [...it.filter((x) => x.id !== a.id && x.id !== b.id), { id: nextId.current++, name: res.name, emoji: res.emoji, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }])
    play(isNew ? 'win' : 'good')
    setMsg(isNew ? `✨ New discovery: ${res.emoji} ${res.name}!` : `${a.name} + ${b.name} = ${res.emoji} ${res.name}`)
    return true
  }

  function onDown(e, it) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: it.id, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, moved: false }
  }
  function onMove(e) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    if (d.moved) setItems((its) => its.map((x) => (x.id === d.id ? { ...x, x: d.ox + dx, y: d.oy + dy } : x)))
  }
  function onUp(e, it) {
    const d = drag.current
    drag.current = null
    if (!d) return
    const r = area.current.getBoundingClientRect()
    if (!d.moved) {
      // click-to-select flow
      if (!sel) setSel(it.id)
      else if (sel === it.id) setSel(null)
      else {
        const other = items.find((x) => x.id === sel)
        setSel(null)
        if (other) tryCombine(other, it)
      }
      return
    }
    const cur = { ...it, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }
    // dropped outside → remove
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      setItems((its) => its.filter((x) => x.id !== it.id))
      return
    }
    const hit = items.find((o) => o.id !== it.id && Math.abs(o.x - cur.x) < CHIP_W * 0.8 && Math.abs(o.y - cur.y) < 44)
    if (hit) tryCombine(hit, cur)
    setSel(null)
  }

  useEffect(() => {
    const clear = (e) => {
      if (e.key !== 'Escape') return
      setSel(null)
      setElementsOpen(false)
    }
    window.addEventListener('keydown', clear)
    return () => window.removeEventListener('keydown', clear)
  }, [])

  async function addRecipe(e) {
    e.preventDefault()
    const { a, b, r, e: em } = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]))
    if (!a || !b || !r) return setMsg('Fill in both ingredients and the result.')
    if (![a, b].every((n) => known.has(n))) return setMsg('Both ingredients must be elements you have discovered.')
    const k = keyOf(a, b)
    await customDb.put(k, { k, r: r.slice(0, 24), e: em || knownEmoji(r) || '✨' })
    await discovered.put(r.slice(0, 24), { emoji: em || '✨' })
    setForm({ a: '', b: '', r: '', e: '✨' })
    setMsg(`Recipe saved: ${a} + ${b} = ${r}.`)
  }

  const discoveredCount = [...known.keys()].filter((n) => ALL_RESULTS.has(n) || BASE.some((b) => b.name === n)).length

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="order-2 lg:order-1">
        <div
          ref={area}
          className="card relative h-[26rem] touch-none overflow-hidden sm:h-[32rem]"
          style={{ backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          aria-label="Workspace"
        >
          {items.length === 0 && <p className="absolute inset-0 grid place-items-center px-6 text-center text-muted">Tap an element above to add it here.</p>}
          {items.map((it) => (
            <button
              key={it.id}
              onPointerDown={(e) => onDown(e, it)}
              onPointerMove={onMove}
              onPointerUp={(e) => onUp(e, it)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!sel) setSel(it.id)
                  else if (sel === it.id) setSel(null)
                  else {
                    const other = items.find((x) => x.id === sel)
                    setSel(null)
                    if (other) tryCombine(other, it)
                  }
                } else if (e.key === 'Delete' || e.key === 'Backspace') setItems((its) => its.filter((x) => x.id !== it.id))
              }}
              aria-pressed={sel === it.id}
              className="no-select absolute flex cursor-grab items-center gap-2 rounded-2xl border-2 bg-card px-2 py-1.5 text-sm font-semibold active:cursor-grabbing"
              style={{ left: it.x, top: it.y, maxWidth: 180, borderColor: sel === it.id ? 'var(--game)' : 'var(--ink)', boxShadow: sel === it.id ? '0 0 0 3px color-mix(in srgb, var(--game) 35%, transparent)' : undefined, touchAction: 'none' }}
            >
              <span className="alchemy-icon" aria-hidden>{it.emoji}</span>
              <span className="min-w-0 truncate">{it.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm" role="status" aria-live="polite">{msg}</p>
          <div className="flex gap-2">
            <button className="btn btn-sm" onClick={() => setItems([])}><Trash2 size={14} aria-hidden /> Clear workspace</button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">Drag an element outside the workspace (or press Delete while focused) to remove it. Click two elements in a row to combine them.</p>

        <details className="card mt-5 p-4">
          <summary className="cursor-pointer font-semibold">Add your own recipe</summary>
          <form onSubmit={addRecipe} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_4rem_auto]">
            <input className="field" list="known-els" placeholder="Ingredient A" aria-label="Ingredient A" value={form.a} onChange={(e) => setForm({ ...form, a: e.target.value })} />
            <input className="field" list="known-els" placeholder="Ingredient B" aria-label="Ingredient B" value={form.b} onChange={(e) => setForm({ ...form, b: e.target.value })} />
            <input className="field" placeholder="Result" aria-label="Result name" maxLength={24} value={form.r} onChange={(e) => setForm({ ...form, r: e.target.value })} />
            <input className="field text-center" aria-label="Result emoji" maxLength={4} value={form.e} onChange={(e) => setForm({ ...form, e: e.target.value })} />
            <button className="btn btn-primary" type="submit"><Plus size={14} aria-hidden /> Save</button>
          </form>
          <datalist id="known-els">{[...known.keys()].map((n) => <option key={n} value={n} />)}</datalist>
          {customDb.items.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {customDb.items.map(({ key, value }) => (
                <li key={key} className="chip">{key.replace('|', ' + ')} = {value.e} {value.r}
                  <button aria-label="Delete recipe" onClick={() => customDb.remove(key)}>×</button>
                </li>
              ))}
            </ul>
          )}
        </details>
      </div>

      <aside className="card order-1 flex max-h-[34rem] flex-col p-3 lg:order-2" aria-label="Discovered elements">
        <div className="px-1 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 id="elements-title" className="text-lg font-bold">Elements</h2>
              <p className="text-xs text-muted">{discoveredCount} of {total} dataset elements found</p>
            </div>
            <button className="btn btn-sm btn-ghost lg:hidden" onClick={() => setElementsOpen((open) => !open)} aria-expanded={elementsOpen} aria-controls="elements-grid">
              <LayoutGrid size={14} aria-hidden /> {elementsOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft" aria-hidden><div className="h-full bg-game" style={{ width: `${(discoveredCount / total) * 100}%` }} /></div>
        </div>
        <div id="elements-grid" className={`${elementsOpen ? 'block' : 'hidden'} min-h-0 flex-1 lg:block`}>
          <input className="field mb-2 !py-1.5 text-sm" placeholder="Filter…" aria-label="Filter elements" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <ul className="grid max-h-[16rem] min-h-0 grid-cols-5 content-start gap-2 overflow-y-auto p-1 sm:max-h-[20rem] sm:grid-cols-6 lg:max-h-none lg:grid-cols-3">
            {list.map(([n, em]) => (
              <li key={n} className="min-w-0">
                <button
                  className="flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl border border-line bg-soft/50 p-2 text-center transition hover:border-game hover:bg-soft"
                  title={n}
                  onClick={() => { addItem(n, em); play('pop') }}
                >
                  <span className="alchemy-icon" aria-hidden>{em}</span>
                  <span className="w-full truncate text-xs font-medium">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
