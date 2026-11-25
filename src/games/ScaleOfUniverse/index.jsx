import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useGameData } from '../../hooks/index.js'
import { OBJECTS, fmtLength } from './data.js'

const MIN = -35
const MAX = 27.2
const W = 800
const H = 450

export default function ScaleOfUniverse() {
  const [saved, setSaved] = useGameData('scale-of-the-universe', 'zoom', 0, (v) => typeof v === 'number')
  const [z, setZ] = useState(Math.min(MAX, Math.max(MIN, saved)))
  const box = useRef(null)

  useEffect(() => {
    const id = setTimeout(() => setSaved(z), 400)
    return () => clearTimeout(id)
  }, [z, setSaved])

  useEffect(() => {
    const el = box.current
    const onWheel = (e) => {
      e.preventDefault()
      setZ((v) => Math.min(MAX, Math.max(MIN, v + e.deltaY * 0.006)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const view = Math.pow(10, z) // metres across the viewport width
  const visible = useMemo(
    () =>
      OBJECTS.map((o, i) => ({ ...o, i, px: (o.size / view) * W })).filter((o) => o.px >= 8 && o.px <= W * 6),
    [view],
  )
  // the object closest (in log scale) to ~45% of the viewport is the "focus"
  const focus = useMemo(() => {
    let best = null
    for (const o of OBJECTS) {
      const d = Math.abs(Math.log10(o.size) - (z - 0.35))
      if (!best || d < best.d) best = { o, d }
    }
    return best.o
  }, [z])

  const step = (d) => setZ((v) => Math.min(MAX, Math.max(MIN, v + d)))

  return (
    <div className="mx-auto max-w-4xl">
      <div ref={box} className="relative overflow-hidden rounded-3xl border-2 border-ink bg-[#06081a]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`Zoom view. Screen width is about ${fmtLength(view)}. Nearest object: ${focus.name}.`}>
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={(i * 193) % W} cy={(i * 97) % H} r={i % 3 ? 0.8 : 1.4} fill="#fff" opacity=".35" />
          ))}
          {visible
            .sort((a, b) => b.px - a.px)
            .map((o) => {
              const r = o.px / 2
              const isFocus = o.name === focus.name
              const ang = ((o.i * 47) % 140) + 20 // label position varies by object
              const lx = W / 2 + Math.cos((ang * Math.PI) / 180) * r
              const ly = H / 2 + Math.sin((ang * Math.PI) / 180) * r
              const onScreen = lx > 20 && lx < W - 20 && ly > 14 && ly < H - 14
              const faded = Math.min(1, (o.px - 8) / 30)
              return (
                <g key={o.name} opacity={faded}>
                  <circle cx={W / 2} cy={H / 2} r={r} fill={o.color} fillOpacity={isFocus ? 0.35 : 0.12} stroke={o.color} strokeWidth={isFocus ? 2.5 : 1.2} />
                  {r < 150 && <text x={W / 2} y={H / 2 + Math.min(r * 0.45, 40) * 0.35} fontSize={Math.max(10, Math.min(r * 0.9, 90))} textAnchor="middle" aria-hidden>{o.emoji}</text>}
                  {onScreen && (
                    <text x={lx} y={ly + 4} fill="#fff" fontSize="13" fontWeight="600" textAnchor="middle" paintOrder="stroke" stroke="#06081a" strokeWidth="4">
                      {o.name}
                    </text>
                  )}
                </g>
              )
            })}
          <line x1="30" y1={H - 28} x2="230" y2={H - 28} stroke="#fff" strokeWidth="2" />
          <line x1="30" y1={H - 34} x2="30" y2={H - 22} stroke="#fff" strokeWidth="2" />
          <line x1="230" y1={H - 34} x2="230" y2={H - 22} stroke="#fff" strokeWidth="2" />
          <text x="130" y={H - 38} fill="#fff" fontSize="13" textAnchor="middle" fontFamily="monospace">{fmtLength((view * 200) / W)}</text>
        </svg>
        <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-black/55 px-3 py-2 text-white">
          <p className="text-xs opacity-80">Viewport width</p>
          <p className="font-mono text-lg">{fmtLength(view)}</p>
        </div>
        <div className="pointer-events-none absolute right-3 top-3 max-w-[11rem] rounded-xl bg-black/55 px-3 py-2 text-right text-white">
          <p className="text-sm font-bold">{focus.emoji} {focus.name}</p>
          <p className="font-mono text-xs opacity-80">{fmtLength(focus.size)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button className="btn btn-sm" onClick={() => step(-1)} aria-label="Zoom in"><Plus size={14} /></button>
        <label className="flex-1">
          <span className="sr-only">Zoom level (orders of magnitude)</span>
          <input type="range" min={MIN} max={MAX} step="0.01" value={z} onChange={(e) => setZ(+e.target.value)} aria-valuetext={`Screen width ${fmtLength(view)}`} />
        </label>
        <button className="btn btn-sm" onClick={() => step(1)} aria-label="Zoom out"><Minus size={14} /></button>
      </div>
      <p className="mt-1 text-xs text-muted">Scroll the wheel over the picture, drag the slider, or use arrow keys on it. Sizes are approximate typical or average values.</p>

      <h2 id="scale-jump-to" className="mb-2 mt-6 text-lg font-bold">Jump to</h2>
      <ul className="flex flex-wrap gap-2">
        {OBJECTS.map((o) => (
          <li key={o.name}>
            <button className="chip" aria-pressed={o.name === focus.name} onClick={() => setZ(Math.min(MAX, Math.max(MIN, Math.log10(o.size) + 0.35)))}>
              {o.emoji} {o.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
