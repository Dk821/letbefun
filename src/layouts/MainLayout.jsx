import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Moon, Sun, Settings } from 'lucide-react'
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
            <NavLink to="/favorites" className={navCls}>Favorites</NavLink>
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
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>letbe<span className="brand-fun">.fun</span> — made with curiosity. Everything stays in your browser.</p>
            <p>Made by <a href="https://madgen.space" target="_blank" rel="noopener noreferrer" className="hover:text-ink">madgen.space</a> · <a href="https://madgen.space" target="_blank" rel="noopener noreferrer" className="hover:text-ink">Contact</a></p>
          </div>
          <nav aria-label="Footer" className="flex gap-4">
            <Link to="/about" className="hover:text-ink">About</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            {/* TODO: Add Terms link only if a Terms page exists. */}
            <Link to="/settings" className="hover:text-ink">Settings</Link>
          </nav>
        </div>
      </footer>
    </MotionConfig>
  )
}
