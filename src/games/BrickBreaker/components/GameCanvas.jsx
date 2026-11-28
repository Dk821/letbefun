import { useEffect, useRef, useState } from 'react'
import { WORLD_H, WORLD_W } from '../data/constants.js'

const HUD_INTERVAL = 0.1
const SAMPLE_FRAMES = 90
const SLOW_FRAME = 1 / 45
const TAP_MS = 300
const TAP_PX = 12
const DRAG_GAIN = 1.25

/** Owns the canvas, its sizing, the requestAnimationFrame loop and pointer input. */
export default function GameCanvas({ engine, paused, playing, control, onHud }) {
  const box = useRef(null)
  const canvas = useRef(null)
  const live = useRef({})
  live.current = { paused, playing, control, onHud }
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = canvas.current
    const ctx = el.getContext('2d', { alpha: false })
    let scale = 1
    let raf = 0
    let last = performance.now()
    let sinceHud = 0
    let snapshot = ''
    let maxDpr = 2
    let frames = 0
    let spent = 0
    if (import.meta.env.DEV) el.engine = engine // for debugging in development only

    const draw = () => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      engine.draw(ctx)
    }
    const fit = () => {
      const { width, height } = box.current.getBoundingClientRect()
      if (!width || !height) return
      const k = Math.min(width / WORLD_W, height / WORLD_H)
      const css = { w: Math.floor(WORLD_W * k), h: Math.floor(WORLD_H * k) }
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      el.width = Math.round(css.w * dpr)
      el.height = Math.round(css.h * dpr)
      scale = el.width / WORLD_W
      setSize(css)
      draw()
    }
    const loop = (now) => {
      const dt = (now - last) / 1000
      last = now
      // Slow devices: render fewer pixels. Long gaps (hidden tab) are not counted.
      if (live.current.playing && dt < 0.25 && maxDpr > 1) {
        spent += dt
        if (++frames === SAMPLE_FRAMES) {
          if (spent / frames > SLOW_FRAME) {
            maxDpr = maxDpr > 1.5 ? 1.5 : 1
            fit()
          }
          frames = 0
          spent = 0
        }
      }
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

  // Mouse: the paddle follows the cursor, also when it leaves the canvas. Touch: depends on the control method.
  useEffect(() => {
    const area = box.current
    const { input } = engine
    let touch = null // the finger that is steering

    const worldX = (clientX) => {
      const r = canvas.current.getBoundingClientRect()
      return r.width ? ((clientX - r.left) / r.width) * WORLD_W : WORLD_W / 2
    }
    const onDown = (e) => {
      if (!live.current.playing) return
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return
        input.targetX = worldX(e.clientX)
        input.launch = true
        input.fireTouch = true
        return
      }
      e.preventDefault()
      if (touch) return
      touch = { id: e.pointerId, x: e.clientX, startX: e.clientX, startY: e.clientY, at: e.timeStamp, moved: false }
      area.setPointerCapture?.(e.pointerId)
      input.fireTouch = true // the laser keeps firing while a finger steers
      if (live.current.control === 'follow') input.targetX = worldX(e.clientX)
    }
    const onMove = (e) => {
      if (!live.current.playing) return
      if (e.pointerType === 'mouse') {
        input.targetX = worldX(e.clientX)
        return
      }
      if (!touch || touch.id !== e.pointerId) return
      if (Math.hypot(e.clientX - touch.startX, e.clientY - touch.startY) > TAP_PX) touch.moved = true
      if (live.current.control === 'follow') input.targetX = worldX(e.clientX)
      else if (live.current.control === 'drag') {
        const width = canvas.current.getBoundingClientRect().width || WORLD_W
        input.nudge += ((e.clientX - touch.x) / width) * WORLD_W * DRAG_GAIN
      }
      touch.x = e.clientX
    }
    const onUp = (e) => {
      if (e.pointerType === 'mouse') {
        input.fireTouch = false
        return
      }
      if (!touch || touch.id !== e.pointerId) return
      if (e.type === 'pointerup' && !touch.moved && e.timeStamp - touch.at < TAP_MS && live.current.playing) input.launch = true
      touch = null
      input.fireTouch = false
    }

    area.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      area.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [engine])

  return (
    <div ref={box} className="relative min-h-0 flex-1 touch-none">
      <div className="absolute inset-0 grid place-items-center">
        <canvas
          ref={canvas}
          className="block touch-none rounded-xl border border-violet-400/30 shadow-[0_0_44px_-12px_#8b5cf6]"
          style={{ width: size.w, height: size.h, cursor: playing ? 'none' : 'auto' }}
          role="img"
          aria-label="Brick Breaker game field"
        />
      </div>
    </div>
  )
}
