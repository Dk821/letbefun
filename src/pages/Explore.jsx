import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { CATEGORIES, GAMES } from '../data/games.meta.js'
import { GameCard } from '../components/ui.jsx'
import { PAGES } from '../data/seo.js'
import { useSeo } from '../hooks/index.js'

const SORTS = {
  newest: ['Newest', (a, b) => b.added.localeCompare(a.added)],
  az: ['A–Z', (a, b) => a.title.localeCompare(b.title)],
  short: ['Shortest', (a, b) => a.minutes - b.minutes],
}

export default function Explore() {
  useSeo(PAGES.explore)
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || 'All'
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'newest'

  const update = (k, v) => {
    const next = new URLSearchParams(params)
    if (!v || v === 'All' || (k === 'sort' && v === 'newest')) next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return GAMES.filter((g) => (category === 'All' || g.category === category) && (!needle || `${g.title} ${g.tagline} ${g.category}`.toLowerCase().includes(needle))).sort(SORTS[sort][1])
  }, [q, category, sort])

  return (
    <div className="pt-10">
      <h1 id="explore-title" className="text-4xl font-extrabold sm:text-5xl">Explore</h1>
      <p className="mt-2 text-muted">{GAMES.length} experiments and counting.</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search games</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className="field !pl-9" type="search" placeholder="Search games…" value={q} onChange={(e) => update('q', e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort
          <select className="field !w-auto" value={sort} onChange={(e) => update('sort', e.target.value)}>
            {Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => update('category', c)}>{c}</button>
        ))}
      </div>

      <p className="sr-only" role="status">{list.length} games found</p>
      <h2 id="explore-games" className="sr-only">Games</h2>
      {list.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {list.map((g, i) => <GameCard key={g.slug} game={g} index={i} />)}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center text-muted">
          Nothing matches “{q}”. <button className="font-semibold text-accent underline" onClick={() => setParams({})}>Clear filters</button>
        </div>
      )}
    </div>
  )
}
