import { useEffect, useRef, useState } from 'react'
import { useBestScore } from '../../hooks/index.js'
import { FACTS, MAX_DEPTH, ZONES, colorAt } from './data.js'

const HEIGHT = 20000 // px of scrollable ocean
const px = (d) => (d / MAX_DEPTH) * HEIGHT

export default function DeepSea() {
  const box = useRef(null)
  const [depth, setDepth] = useState(0)
  const [maxDepth, submitMax] = useBestScore('deep-sea', 'deepest', 'high')
  const raf = useRef(0)

  useEffect(() => {
    const el = box.current
    const onScroll = () => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const p = el.scrollTop / (el.scrollHeight - el.clientHeight)
        setDepth(Math.round(p * MAX_DEPTH))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (depth > (maxDepth ?? 0)) submitMax(depth)
  }, [depth]) // eslint-disable-line react-hooks/exhaustive-deps

  const zone = ZONES.filter((z) => depth >= z.from).at(-1)
  const light = Math.max(0, 1 - depth / 1000)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-3xl border-2 border-ink">
        <div
          ref={box}
          className="h-[70vh] min-h-[420px] overflow-y-auto"
          tabIndex={0}
          role="region"
          aria-label="Ocean depth scroller. Scroll or use arrow keys to descend."
        >
          <div className="relative" style={{ height: HEIGHT + 600, background: `linear-gradient(to bottom, ${colorAt(0)}, ${colorAt(200)} 2%, ${colorAt(1000)} 9%, ${colorAt(4000)} 37%, ${colorAt(MAX_DEPTH)} 100%)` }}>
            {/* surface sky + waves */}
            <svg className="absolute left-0 top-0 w-full" viewBox="0 0 800 120" preserveAspectRatio="none" height="120" aria-hidden>
              <rect width="800" height="60" fill="#bde3ff" />
              <circle cx="660" cy="30" r="22" fill="#ffd966" />
              <path d="M0 60 Q 50 45 100 60 T 200 60 T 300 60 T 400 60 T 500 60 T 600 60 T 700 60 T 800 60 V120 H0Z" fill="#2a8fd6" opacity=".9" />
            </svg>

            {/* creatures */}
            {FACTS.map((f, i) => (
              <div key={f.title} className="absolute left-0 w-full" style={{ top: px(f.depth) + 120 }}>
                <div className={`mx-auto flex max-w-xl items-center gap-4 px-4 ${i % 2 ? 'flex-row-reverse text-right' : ''}`}>
                  <span className="text-6xl drop-shadow sm:text-7xl" style={{ animation: 'bob 4s ease-in-out infinite', animationDelay: `${i * 0.4}s` }} aria-hidden>{f.emoji}</span>
                  <div className="rounded-2xl bg-black/35 p-3 text-white backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{f.depth.toLocaleString()} m</p>
                    <h2 className="text-lg font-bold">{f.title}</h2>
                    <p className="text-sm opacity-90">{f.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* marine snow / bubbles (CSS only, cheap) */}
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="absolute rounded-full bg-white/30" aria-hidden style={{ left: `${(i * 37) % 100}%`, top: `${(i * 913) % HEIGHT + 150}px`, width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3, animation: `bob ${3 + (i % 4)}s ease-in-out infinite` }} />
            ))}
            <p className="absolute bottom-6 w-full text-center text-sm text-white/70">You reached the bottom of the Challenger Deep. Pressure here: ~1,100 atmospheres.</p>
          </div>
        </div>

        {/* darkness overlay + HUD */}
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 40%, transparent ${20 + light * 60}%, rgba(0,0,0,${0.55 * (1 - light)}) 100%)` }} aria-hidden />
        <div className="pointer-events-none absolute right-3 top-3 rounded-xl bg-black/50 px-3 py-2 text-right font-mono text-white">
          <div className="text-2xl font-medium" aria-live="off">{depth.toLocaleString()} m</div>
          <div className="text-xs opacity-80">{zone.name}</div>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 h-40 w-2 overflow-hidden rounded-full bg-white/25" aria-hidden>
          <div className="w-full rounded-full bg-white" style={{ height: `${(depth / MAX_DEPTH) * 100}%` }} />
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-line bg-card p-4 text-sm" role="status">
        <b>{zone.name}</b> — {zone.text} <span className="text-muted">Deepest this device: {(maxDepth ?? 0).toLocaleString()} m.</span>
      </div>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
