import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Zap } from 'lucide-react'
import { CATEGORIES, GAMES } from '../data/games.meta.js'
import { GameCard, Section } from '../components/ui.jsx'
import { useSeo } from '../hooks/index.js'

export default function Home() {
  useSeo({
    title: '',
    description: `letbe.fun is a free box of ${GAMES.length} tiny browser games and curious experiments. No accounts, no tracking — everything stays on your device.`,
    path: '/',
  })
  const featured = GAMES.filter((g) => g.featured)
  const latest = [...GAMES].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 4)

  return (
    <>
      <section className="glow-bg grid grid-cols-[minmax(0,1fr)] items-center gap-8 pb-10 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card/60 px-4 py-2 text-xs font-bold uppercase tracking-widest">
            <Zap size={16} className="fill-[var(--brand)] text-[var(--brand)]" aria-hidden /> A small box of curious things
          </motion.p>
          <motion.h1 id="home-hero-title" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-5xl font-black leading-[1.02] sm:text-7xl">
            Tiny games for{' '}
            <span className="relative inline-block italic text-[var(--brand)]">
              idle
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden><path d="M2 7 Q 40 1 118 4" stroke="var(--brand)" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </span>{' '}
            minutes.
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            letbe.fun is a free box of {GAMES.length} tiny browser games and curious experiments. No accounts, no tracking — everything stays on your device.
          </p>
          <p className="mt-3 max-w-xl text-muted">
            From alchemy and asteroid impacts to the world’s most unreasonable password rules, each one is quick, playful, and built to run in your browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="btn btn-primary !px-6 !py-3"><Play size={16} className="fill-current" aria-hidden /> Explore all games <ArrowRight size={16} aria-hidden /></Link>
            <Link to="/games/reaction-test" className="btn !px-6 !py-3"><Zap size={16} className="fill-[var(--brand)] text-[var(--brand)]" aria-hidden /> Quick Reaction test</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="hero-art">
            <img src="/images/hero-pad-light.png" alt="A smiling 3D game controller orbited by a glowing ring" width="700" height="600" fetchpriority="high" className="hero-float w-full select-none dark:hidden" />
            <img src="/images/hero-pad.png" alt="" aria-hidden="true" width="700" height="600" className="hero-float hidden w-full select-none dark:block" />
          </div>
        </div>
      </section>

      <section className="relative mt-16" aria-labelledby="featured-h">
        <i className="deco-sq right-[30%] top-6" aria-hidden />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <span className="section-bar" aria-hidden />
            <div>
              <h2 id="featured-h" className="text-4xl font-black sm:text-5xl">Featur<span className="text-[#b45309] dark:text-[var(--brand)]">ed</span></h2>
              <p className="mt-1 text-muted">Handpicked games for your endless fun</p>
            </div>
          </div>
          <Link to="/explore" className="btn btn-outline-violet !px-5">See all <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {featured.map((g, i) => <GameCard key={g.slug} game={g} index={i} />)}
        </div>
      </section>

      <Section title="Latest experiments">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {latest.map((g, i) => <GameCard key={g.slug} game={g} index={i} />)}
        </div>
      </Section>

      <Section title="Browse by mood">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/explore?category=${encodeURIComponent(c)}`} className="chip !px-4 !py-2 text-sm hover:bg-soft">
              {c} <span className="text-muted">{GAMES.filter((g) => g.category === c).length}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
