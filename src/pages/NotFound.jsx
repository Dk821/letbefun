import { Link } from 'react-router-dom'
import { GAMES } from '../data/games.meta.js'
import { useSeo } from '../hooks/index.js'

export default function NotFound({ missingGame }) {
  useSeo({ title: 'Page not found', description: 'This page wandered off.', path: '/404' })
  const pick = GAMES[Math.floor(Math.random() * GAMES.length)]
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-7xl" aria-hidden>🛸</p>
      <h1 id="not-found-title" className="mt-4 text-4xl font-extrabold">{missingGame ? 'That game isn’t in the box' : 'Lost in space'}</h1>
      <p className="mt-3 text-muted">
        {missingGame ? <>We couldn’t find “{missingGame}”. Maybe it hasn’t been invented yet.</> : 'The page you wanted drifted away.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/explore" className="btn btn-primary">Browse games</Link>
        <Link to={`/games/${pick.slug}`} className="btn">Surprise me {pick.emoji}</Link>
      </div>
    </div>
  )
}
