import { Component, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Share2, Check, Loader2, Play, Clock } from 'lucide-react'
import { favoritesStore, toggleFavorite, useStore } from '../services/storage/index.js'

export function Loader({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-24 text-muted">
      <Loader2 className="animate-spin" size={18} aria-hidden /> {label}
    </div>
  )
}

export class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        this.props.fallback || (
          <div className="card p-6 text-center" role="alert">
            <p className="font-display text-xl font-bold">Something went sideways.</p>
            <p className="mt-1 text-sm text-muted">This experiment hit an error. Your saved data is safe.</p>
            <button className="btn mt-4" onClick={() => this.setState({ error: null })}>Try again</button>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export function FavoriteButton({ slug, className = '' }) {
  const favs = useStore(favoritesStore)
  const on = favs.includes(slug)
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm ${className}`}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(slug)
      }}
    >
      <Heart size={15} fill={on ? 'currentColor' : 'none'} className={on ? 'text-accent' : ''} aria-hidden />
      <span className="hidden sm:inline">{on ? 'Saved' : 'Save'}</span>
    </button>
  )
}

export function ShareButton({ title, text, path }) {
  const [done, setDone] = useState(false)
  async function share() {
    const url = window.location.origin + path
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch (e) {
      if (e?.name === 'AbortError') return
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      } catch {
        return
      }
    }
    setDone(true)
    setTimeout(() => setDone(false), 1800)
  }
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={share}>
      {done ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
      <span aria-live="polite">{done ? 'Link copied' : 'Share'}</span>
    </button>
  )
}

export function GameCard({ game, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="h-full"
      style={{ '--game': game.color }}
    >
      <Link
        to={`/games/${game.slug}`}
        className="feat-card group flex h-full flex-col overflow-hidden rounded-[1.6rem]"
        aria-label={`${game.title}: ${game.tagline}`}
      >
        <div className="feat-banner relative grid h-28 place-items-center sm:h-40 overflow-hidden">
          <span className="feat-emoji text-5xl sm:text-7xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden>{game.emoji}</span>
          <span className="game-chip feat-chip absolute left-2 top-2 sm:left-4 sm:top-4">{game.category}</span>
          <span className="feat-time absolute right-4 top-4 inline-flex max-sm:hidden items-center gap-1.5"><Clock size={13} aria-hidden /> {game.minutes} min</span>
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <h3 className="text-base font-extrabold leading-tight sm:text-xl">{game.title}</h3>
          <p className="mt-1.5 flex-1 text-[0.8rem] text-muted sm:text-[0.92rem]">{game.tagline}</p>
          <span className="feat-cta mt-3 sm:mt-5 inline-flex items-center justify-center gap-2 self-stretch"><Play size={14} className="fill-current" aria-hidden /> Play now</span>
        </div>
      </Link>
    </motion.div>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-line bg-soft/60 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="font-mono text-lg font-medium leading-tight" aria-live="polite">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  )
}

export function Section({ title, action, children }) {
  return (
    <section className="mt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
