import { Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, HelpCircle, Play, RotateCcw, X } from 'lucide-react'
import { GAMES, getMeta } from '../data/games.meta.js'
import { GAME_COMPONENTS } from '../games/registry.js'
import { ErrorBoundary, GameCard, Loader, ShareButton } from '../components/ui.jsx'
import { markPlayed } from '../services/storage/index.js'
import { useSeo } from '../hooks/index.js'
import NotFound from './NotFound.jsx'

export default function GamePage() {
  const { slug } = useParams()
  const meta = getMeta(slug)
  if (!meta) return <NotFound missingGame={slug} />
  return <GameView key={slug} meta={meta} />
}

function GameView({ meta }) {
  const Game = GAME_COMPONENTS[meta.slug]
  const [started, setStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [runKey, setRunKey] = useState(0)
  useSeo({ title: meta.title, description: `${meta.tagline} ${meta.description}`, path: `/games/${meta.slug}` })

  const startGame = () => {
    setStarted(true)
  }
  const exitGame = () => {
    setStarted(false)
    setShowHelp(false)
  }

  useEffect(() => {
    if (!started) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && exitGame()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [started])

  useEffect(() => {
    if (started) markPlayed(meta.slug)
  }, [started, meta.slug])

  const related = [
    ...GAMES.filter((g) => g.category === meta.category && g.slug !== meta.slug),
    ...GAMES.filter((g) => g.category !== meta.category && g.slug !== meta.slug),
  ].slice(0, 4)

  return (
    <div style={{ '--game': meta.color }} className="pt-6">
      <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> All games
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-2xl text-3xl" style={{ background: `color-mix(in srgb, ${meta.color} 20%, transparent)` }} aria-hidden>
            {meta.emoji}
          </span>
          <div>
            <h1 id="game-title" className="text-3xl font-extrabold sm:text-4xl">{meta.title}</h1>
            <p className="text-muted">{meta.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton title={`${meta.title} — letbe.fun`} text={meta.tagline} path={`/games/${meta.slug}`} />
        </div>
      </div>

      <div className="mt-5">
        {!started ? (
          <div className="card mx-auto max-w-2xl p-6 sm:p-8">
            <h2 id="how-to-play" className="text-xl font-bold">How to play</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              {meta.instructions.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
            <button className="btn btn-primary mt-6" onClick={startGame} autoFocus>
              <Play size={16} aria-hidden /> Start
            </button>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex h-dvh w-screen flex-col bg-bg" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }} role="dialog" aria-label={meta.title}>
            <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2 sm:px-4">
              <span className="mr-auto flex min-w-0 items-center gap-2 truncate font-bold"><span aria-hidden>{meta.emoji}</span> {meta.title}</span>
              <button className="btn btn-sm" onClick={() => setRunKey((k) => k + 1)}>
                <RotateCcw size={14} aria-hidden /> <span className="max-sm:sr-only">Restart</span>
              </button>
              <button className="btn btn-sm btn-ghost" aria-expanded={showHelp} onClick={() => setShowHelp((s) => !s)}>
                <HelpCircle size={14} aria-hidden /> <span className="max-sm:sr-only">How to play</span>
              </button>
              <button className="btn btn-sm btn-ghost" onClick={exitGame} autoFocus>
                <X size={14} aria-hidden /> <span className="max-sm:sr-only">Exit</span>
              </button>
            </div>
            {showHelp && (
              <ul className="card mx-4 mt-3 list-disc space-y-1 p-4 pl-8 text-sm text-muted">
                {meta.instructions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className="mx-auto min-h-0 w-full max-w-[96rem] flex-1 overflow-auto p-2 sm:p-4">
              <ErrorBoundary>
                <Suspense fallback={<Loader label={`Loading ${meta.title}…`} />}>
                  <Game key={runKey} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>

      <section className="mt-16" aria-labelledby="related">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="related" className="text-xl font-bold">Try these next</h2>
          <Link to="/explore" className="btn btn-sm btn-outline-violet">
            See all games <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {related.map((g, i) => (
            <div key={g.slug} className={i === 3 ? 'sm:hidden' : ''}><GameCard game={g} index={i} /></div>
          ))}
        </div>
      </section>
    </div>
  )
}
