import { Link } from 'react-router-dom'
import { GAMES, getMeta } from '../data/games.meta.js'
import { GameCard } from '../components/ui.jsx'
import { favoritesStore, recentStore, useStore } from '../services/storage/index.js'
import { useSeo } from '../hooks/index.js'

export default function Collection({ kind }) {
  const favs = useStore(favoritesStore)
  const recent = useStore(recentStore)
  const isFav = kind === 'favorites'
  useSeo({
    title: isFav ? 'Favorites' : 'Recently played',
    description: isFav ? 'Games you saved on this device.' : 'Games you played recently on this device.',
    path: isFav ? '/favorites' : '/recent',
  })
  const games = (isFav ? favs : recent.map((r) => r.slug)).map(getMeta).filter(Boolean)
  return (
    <div className="pt-10">
      <h1 id="collection-title" className="text-4xl font-extrabold sm:text-5xl">{isFav ? 'Favorites' : 'Recently played'}</h1>
      <p className="mt-2 text-muted">Stored only on this device — never uploaded.</p>
      {games.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {games.map((g, i) => <GameCard key={g.slug} game={g} index={i} />)}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>{isFav ? '🤍' : '🕰️'}</p>
          <p className="mt-2 text-muted">{isFav ? 'No favorites yet. Tap “Save” on any game page.' : 'Nothing played yet.'}</p>
          <Link to="/explore" className="btn btn-primary mt-4">Browse {GAMES.length} games</Link>
        </div>
      )}
    </div>
  )
}
