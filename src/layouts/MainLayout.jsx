import { FOOTER_LINKS } from '../data/content.js'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUp, Moon, Sun, Settings } from 'lucide-react'
import { MotionConfig } from 'framer-motion'
import { themeStore, useStore } from '../services/storage/index.js'

function useApplyTheme() {
  const theme = useStore(themeStore)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#15140f' : '#faf7f0')
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [theme])
  return theme
}

const navCls = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-ink ${isActive ? 'bg-soft text-ink' : 'text-muted'}`

export default function MainLayout() {
  const theme = useApplyTheme()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const dark = document.documentElement.classList.contains('dark')

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-black tracking-tight" aria-label="letbe.fun home">
            <img src="/favicon.png" alt="" width="44" height="42" className="h-10 w-auto" />
            <span className="max-[460px]:hidden">letbe<span className="brand-fun">.fun</span></span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            <NavLink to="/explore" className={navCls}>Explore</NavLink>
            <NavLink to="/recent" className={`${navCls({ isActive: false })} hidden sm:inline-block`}>Recent</NavLink>
            <button
              className="grid size-9 place-items-center rounded-full text-muted hover:bg-soft"
              aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
              onClick={() => themeStore.set(dark ? 'light' : 'dark')}
              data-theme-state={theme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink to="/settings" aria-label="Settings" className="grid size-9 place-items-center rounded-full text-muted hover:bg-soft">
              <Settings size={18} />
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto min-h-[70vh] max-w-6xl px-4 pb-10">
        <Outlet />
      </main>
      <footer className="relative mt-6 overflow-hidden border-t border-line bg-card/40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(50%_100%_at_50%_0%,color-mix(in_srgb,var(--violet)_12%,transparent),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 font-display text-2xl font-black tracking-tight" aria-label="letbe.fun home">
            <img src="/favicon.png" alt="" width="44" height="42" className="h-9 w-auto" />
            <span>letbe<span className="brand-fun">.fun</span></span>
          </Link>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Small games for curious minds. No sign-up, no downloads — just open a tab and play.
          </p>
          <nav aria-label="Footer" className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {FOOTER_LINKS.map(([to, label]) => (
              <Link key={to} to={to} className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4">{label}</Link>
            ))}
            <Link to="/settings" className="text-muted transition-colors hover:text-ink hover:underline underline-offset-4">Settings</Link>
          </nav>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-6 text-xs text-muted">
            <p>© {new Date().getFullYear()} letbe.fun — made with curiosity.</p>
            <a href="https://madgen.space" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">Made by madgen.space</a>
            <button type="button" onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
              Back to top <ArrowUp size={14} aria-hidden />
            </button>
          </div>
        </div>
      </footer>
    </MotionConfig>
  )
}
