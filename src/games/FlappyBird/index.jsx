import { useEffect, useRef, useState } from 'react'
import { useBestScore, useKey, useSound } from '../../hooks/index.js'

const W = 320, H = 480, G = 0.45, FLAP = -7.2, GAP = 130, PW = 52, BX = 80

const fresh = () => ({ y: H / 2, v: 0, pipes: [], t: 0, score: 0, state: 'idle' })

function draw(ctx, s) {
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#7dd3fc')
  sky.addColorStop(1, '#e0f2fe')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#22c55e'
  for (const p of s.pipes) {
    ctx.fillRect(p.x, 0, PW, p.top)
    ctx.fillRect(p.x, p.top + GAP, PW, H - p.top - GAP)
    ctx.fillStyle = '#15803d'
    ctx.fillRect(p.x - 4, p.top - 14, PW + 8, 14)
    ctx.fillRect(p.x - 4, p.top + GAP, PW + 8, 14)
    ctx.fillStyle = '#22c55e'
  }
  ctx.fillStyle = '#a16207'
  ctx.fillRect(0, H - 14, W, 14)
  ctx.save()
  ctx.translate(BX, s.y)
  ctx.rotate(Math.max(-0.5, Math.min(1, s.v / 10)))
  ctx.fillStyle = '#facc15'
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(6, -4, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#111'
  ctx.beginPath(); ctx.arc(7, -4, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#f97316'
  ctx.fillRect(10, 1, 9, 5)
  ctx.restore()
}

export default function FlappyBird() {
  const canvas = useRef(null)
  const box = useRef(null)
  const [size, setSize] = useState({ w: W, h: H })
  const game = useRef(fresh())
  const [ui, setUi] = useState({ state: 'idle', score: 0 })
  const [best, submit] = useBestScore('flappy-bird')
  const play = useSound()

  const flap = () => {
    const s = game.current
    if (s.state === 'over') {
      game.current = fresh()
      return setUi({ state: 'idle', score: 0 })
    }
    if (s.state === 'idle') {
      s.state = 'run'
      setUi({ state: 'run', score: 0 })
    }
    s.v = FLAP
    play('tick')
  }
  useKey((e) => {
    if (e.code === 'Space' || e.key === 'ArrowUp') {
      e.preventDefault()
      flap()
    }
  }, [])

  useEffect(() => {
    const fit = () => {
      const r = box.current.getBoundingClientRect()
      const scale = Math.min(r.width / W, r.height / H)
      if (scale > 0) setSize({ w: Math.floor(W * scale), h: Math.floor(H * scale) })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    let raf
    const loop = () => {
      const s = game.current
      if (s.state === 'run') {
        s.v += G
        s.y += s.v
        s.t++
        if (s.t % 90 === 1) s.pipes.push({ x: W, top: 60 + Math.random() * (H - GAP - 120), passed: false })
        s.pipes.forEach((p) => { p.x -= 2.2 })
        s.pipes = s.pipes.filter((p) => p.x > -PW - 8)
        for (const p of s.pipes) {
          if (!p.passed && p.x + PW < BX) {
            p.passed = true
            s.score++
            setUi((u) => ({ ...u, score: s.score }))
          }
          if (BX + 12 > p.x && BX - 12 < p.x + PW && (s.y - 12 < p.top || s.y + 12 > p.top + GAP)) s.state = 'over'
        }
        if (s.y > H - 26 || s.y < 12) s.state = 'over'
        if (s.state === 'over') {
          submit(s.score)
          play('bad')
          setUi({ state: 'over', score: s.score })
        }
      }
      draw(ctx, s)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className="grid h-full min-h-[24rem] w-full place-items-center">
      <div className="relative" style={{ width: size.w, height: size.h }}>
        <canvas ref={canvas} width={W} height={H} onPointerDown={flap} className="h-full w-full touch-none rounded-2xl border-2 border-ink" aria-label="Flappy bird game" />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between" aria-live="polite">
          <div className="rounded-xl bg-black/35 px-3 py-1.5 text-white backdrop-blur">
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Score</div>
            <div className="font-mono text-xl font-bold leading-tight">{ui.score}</div>
          </div>
          <div className="rounded-xl bg-black/35 px-3 py-1.5 text-right text-white backdrop-blur">
            <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Best</div>
            <div className="font-mono text-xl font-bold leading-tight">{best ?? '—'}</div>
          </div>
        </div>
        {ui.state !== 'run' && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 text-center">
            <p className="font-display text-3xl font-extrabold text-white drop-shadow-lg">{ui.state === 'over' ? `Game over · ${ui.score}` : 'Tap to flap'}</p>
            <p className="text-white/90 drop-shadow">{ui.state === 'over' ? 'Tap to retry' : 'Space or click'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
