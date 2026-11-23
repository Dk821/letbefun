import { useCallback, useEffect, useRef, useState } from 'react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useSound } from '../../hooks/index.js'
import { scoreCircle } from './score.js'

const SIZE = 480

export default function PerfectCircle() {
  const canvas = useRef(null)
  const pts = useRef([])
  const drawing = useRef(false)
  const [result, setResult] = useState(null)
  const [best, submitBest] = useBestScore('perfect-circle', 'best', 'high')
  const play = useSound()

  const paint = useCallback((ideal) => {
    const c = canvas.current
    const ctx = c.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    ctx.clearRect(0, 0, c.width, c.height)
    const mid = c.width / 2
    ctx.fillStyle = css.getPropertyValue('--ink')
    ctx.beginPath()
    ctx.arc(mid, mid, 5, 0, Math.PI * 2)
    ctx.fill()
    if (ideal) {
      ctx.strokeStyle = '#22c55e'
      ctx.setLineDash([8, 8])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ideal.cx, ideal.cy, ideal.r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    const p = pts.current
    if (p.length > 1) {
      ctx.strokeStyle = css.getPropertyValue('--game') || '#0ea5e9'
      ctx.lineWidth = 4
      ctx.lineCap = ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(p[0].x, p[0].y)
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y)
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    const c = canvas.current
    c.width = c.height = SIZE
    paint()
  }, [paint])

  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE }
  }

  function down(e) {
    canvas.current.setPointerCapture(e.pointerId)
    drawing.current = true
    pts.current = [pos(e)]
    setResult(null)
    paint()
  }
  function move(e) {
    if (!drawing.current) return
    pts.current.push(pos(e))
    paint()
  }
  function up() {
    if (!drawing.current) return
    drawing.current = false
    const r = scoreCircle(pts.current, SIZE / 2)
    if (r.error) {
      setResult(r)
      play('bad')
      return
    }
    paint(r.ideal)
    setResult(r)
    const isNew = submitBest(r.score)
    play(isNew ? 'win' : 'good')
  }

  const verdict = (s) => (s >= 97 ? 'Are you a compass?' : s >= 90 ? 'Seriously impressive.' : s >= 75 ? 'Nice and round-ish.' : s >= 50 ? 'A loose potato.' : 'Abstract art.')
  return (
    <div className="mx-auto max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Last score" value={result && !result.error ? `${result.score.toFixed(1)}%` : '—'} />
        <Stat label="Best" value={best != null ? `${best.toFixed(1)}%` : '—'} />
      </div>
      <canvas
        ref={canvas}
        className="card mt-4 aspect-square w-full touch-none cursor-crosshair"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="img"
        aria-label="Drawing area. Draw one circle around the center dot with your pointer or finger."
      />
      <div aria-live="polite" className="mt-4 min-h-16 text-center">
        {result?.error && <p className="font-semibold text-accent">{result.error}</p>}
        {result && !result.error && (
          <>
            <p className="font-display text-4xl font-extrabold">{result.score.toFixed(1)}%</p>
            <p className="text-muted">{verdict(result.score)} Green dashes show your best-fit circle.</p>
          </>
        )}
        {!result && <p className="text-muted">Press, drag and draw a full circle. Mouse, touch and pen all work.</p>}
      </div>
      <p className="sr-only">This game requires drawing with a pointing device.</p>
    </div>
  )
}
