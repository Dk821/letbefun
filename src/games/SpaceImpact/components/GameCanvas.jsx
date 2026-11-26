import { useEffect, useRef, useState } from 'react'
import { WORLD_H, WORLD_MAX_W, WORLD_MIN_W } from '../data/constants.js'

const HUD_INTERVAL = 0.1

/** Owns the canvas, its sizing and the requestAnimationFrame loop. */
export default function GameCanvas({ engine, paused, onHud, children }) {
  const box = useRef(null)
  const canvas = useRef(null)
  const live = useRef({ paused, onHud })
  live.current = { paused, onHud }
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d', { alpha: false })
    let scale = 1
    let raf = 0
    let last = performance.now()
    let sinceHud = 0
    let snapshot = ''
    if (import.meta.env.DEV) el.engine = engine // for debugging in development only

    const draw = () => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      engine.draw(ctx)
    }
    const fit = () => {
      const { width, height } = box.current.getBoundingClientRect()
      if (!width || !height) return
      engine.resize(Math.round((width / height) * WORLD_H))
      const worldW = Math.max(WORLD_MIN_W, Math.min(WORLD_MAX_W, engine.state.w))
      const k = Math.min(width / worldW, height / WORLD_H)
      const css = { w: Math.floor(worldW * k), h: Math.floor(WORLD_H * k) }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = Math.round(css.w * dpr)
      el.height = Math.round(css.h * dpr)
      scale = el.width / worldW
      setSize(css)
      draw()
    }
    const loop = (now) => {
      const dt = (now - last) / 1000
      last = now
      if (!live.current.paused) {
        engine.update(dt)
        draw()
        sinceHud += dt
        if (sinceHud >= HUD_INTERVAL) {
          sinceHud = 0
          // Only re-render React when a visible value actually changed.
          const hud = engine.hud()
          const next = JSON.stringify(hud)
          if (next !== snapshot) {
            snapshot = next
            live.current.onHud(hud)
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box.current)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [engine])

  return (
    <div ref={box} className="relative min-h-0 flex-1">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative" style={{ width: size.w, height: size.h }}>
          <canvas
            ref={canvas}
            className="block h-full w-full touch-none rounded-xl border border-cyan-400/30 shadow-[0_0_40px_-12px_#22d3ee]"
            role="img"
            aria-label="Space Impact game field"
          />
          {children}
        </div>
      </div>
    </div>
  )
}
