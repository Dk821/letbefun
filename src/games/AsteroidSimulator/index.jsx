import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Rocket } from 'lucide-react'
import { ErrorBoundary, Stat } from '../../components/ui.jsx'
import { useSound } from '../../hooks/index.js'
import { cityComparison, formatNum, MATERIALS, simulate } from './physics.js'
import { drawTexture, isLand } from './planet.js'

// Three.js is only downloaded when this game opens.
const Globe3D = lazy(() => import('./Globe3D.jsx'))

const PRESETS = [
  { name: 'Car-sized (Chelyabinsk-like)', d: 20, v: 19, m: 'stony' },
  { name: 'Tunguska-class', d: 60, v: 15, m: 'stony' },
  { name: 'City-killer 300 m', d: 300, v: 20, m: 'stony' },
  { name: 'Mountain 2 km', d: 2000, v: 20, m: 'stony' },
  { name: 'Extinction-class 10 km', d: 10000, v: 20, m: 'stony' },
]

const sizeFromSlider = (t) => Math.round(Math.pow(10, 1 + (t / 100) * 3)) // 10 m … 10 km
const sliderFromSize = (d) => Math.round(((Math.log10(d) - 1) / 3) * 100)

export default function AsteroidSimulator() {
  const [size, setSize] = useState(100)
  const [t, setT] = useState(sliderFromSize(100))
  const [speed, setSpeed] = useState(20)
  const [angle, setAngle] = useState(45)
  const [material, setMaterial] = useState('stony')
  const [loc, setLoc] = useState({ lat: 20, lon: 10 })
  const [launch, setLaunch] = useState(null)
  const [result, setResult] = useState(null)
  const [fallback, setFallback] = useState(false)
  const play = useSound()
  const land = useMemo(() => isLand(loc.lat, loc.lon), [loc])

  const setDiameter = (d) => { setSize(d); setT(sliderFromSize(d)) }
  function run() {
    const r = simulate({ diameter: size, speed, angle, material, land })
    setResult(null)
    setLaunch({ id: Date.now(), light: r.lightKm, severe: r.severeKm, r })
    play('tick')
    if (fallback) { setResult(r); play('bad') }
  }
  const pick = ({ lat, lon }) => setLoc({ lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 })

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="relative aspect-square max-h-[34rem] w-full overflow-hidden rounded-3xl border-2 border-ink bg-[#070a1a] sm:aspect-[4/3]">
          {fallback ? (
            <FlatMap loc={loc} onPick={pick} launch={launch} />
          ) : (
            <ErrorBoundary fallback={<Fallback onUse={() => setFallback(true)} />}>
              <Suspense fallback={<p className="grid h-full place-items-center text-white/70">Loading 3D globe…</p>}>
                <Globe3D lat={loc.lat} lon={loc.lon} launch={launch} onPick={pick} onFail={() => setFallback(true)} onImpact={() => { setResult(launch.r); play('bad') }} />
              </Suspense>
            </ErrorBoundary>
          )}
          <p className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
            Target: {loc.lat.toFixed(1)}°, {loc.lon.toFixed(1)}° · {land ? 'land' : 'ocean'} · click the globe to aim
          </p>
        </div>
        <p className="mt-2 text-xs text-muted">This stylized planet “Terra” is procedurally generated — not Earth. Orange ring: light damage radius; red ring: severe blast radius.</p>
      </div>

      <div className="space-y-4">
        <div className="card space-y-3 p-4">
          <div className="flex flex-wrap gap-1.5" aria-label="Presets">
            {PRESETS.map((p) => (
              <button key={p.name} className="chip text-xs" onClick={() => { setDiameter(p.d); setSpeed(p.v); setMaterial(p.m) }}>{p.name}</button>
            ))}
          </div>
          <label className="block text-sm font-semibold">
            Diameter: <span className="font-mono">{size >= 1000 ? `${(size / 1000).toFixed(1)} km` : `${size} m`}</span>
            <input type="range" min="0" max="100" value={t} onChange={(e) => { setT(+e.target.value); setSize(sizeFromSlider(+e.target.value)) }} />
          </label>
          <label className="block text-sm font-semibold">
            Speed: <span className="font-mono">{speed} km/s</span>
            <input type="range" min="11" max="72" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            Impact angle: <span className="font-mono">{angle}°</span>
            <input type="range" min="10" max="90" value={angle} onChange={(e) => setAngle(+e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            Material
            <select className="field mt-1" value={material} onChange={(e) => setMaterial(e.target.value)}>
              {Object.entries(MATERIALS).map(([k, m]) => <option key={k} value={k}>{m.label} ({m.density} kg/m³)</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-semibold">Latitude
              <input className="field mt-1 font-mono" type="number" min="-90" max="90" step="0.1" value={loc.lat} onChange={(e) => setLoc((l) => ({ ...l, lat: Math.max(-90, Math.min(90, +e.target.value || 0)) }))} />
            </label>
            <label className="text-sm font-semibold">Longitude
              <input className="field mt-1 font-mono" type="number" min="-180" max="180" step="0.1" value={loc.lon} onChange={(e) => setLoc((l) => ({ ...l, lon: Math.max(-180, Math.min(180, +e.target.value || 0)) }))} />
            </label>
          </div>
          <button className="btn btn-primary w-full !py-3" onClick={run}><Rocket size={16} aria-hidden /> Launch asteroid</button>
        </div>
      </div>

      <div className="lg:col-span-2" aria-live="polite">
        {result ? <Results r={result} /> : launch && !fallback ? <p className="text-muted">Incoming…</p> : <p className="text-muted">Choose your settings and press Launch to see the simulated aftermath.</p>}
      </div>
    </div>
  )
}

function Results({ r }) {
  return (
    <div className="card p-5">
      <h2 id="impact-result-title" className="text-xl font-bold">{r.airburst ? 'It exploded in the air.' : r.ocean ? 'Ocean impact.' : 'Ground impact.'}</h2>
      <p className="text-sm text-muted">
        {r.airburst ? 'Too small and fragile to survive the atmosphere intact; most energy is released as an airburst, so no crater forms.' : r.ocean ? 'The rock plunges into the sea. Expect a seabed crater and tsunami hazard (not simulated here).' : 'A crater forms in the ground and ejecta rains down.'}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Energy" value={`${formatNum(r.mt)} Mt TNT`} hint={`≈ ${formatNum(r.hiroshimas)} Hiroshima bombs`} />
        <Stat label="Mass" value={`${formatNum(r.massKg / 1000)} t`} />
        <Stat label="Crater width" value={r.craterKm ? `${r.craterKm.toFixed(r.craterKm < 10 ? 1 : 0)} km` : 'none'} />
        <Stat label="Quake (equiv.)" value={`M ${r.magnitude.toFixed(1)}`} />
        <Stat label="Severe blast radius" value={`${formatNum(r.severeKm)} km`} hint="≈5 psi" />
        <Stat label="Light damage radius" value={`${formatNum(r.lightKm)} km`} hint="≈1 psi, shattered windows" />
        <Stat label="Thermal burn radius" value={`${formatNum(r.burnKm)} km`} />
        <Stat label="Typical frequency" value={`~1 per ${formatNum(r.everyYears)} yr`} hint="for this size, roughly" />
      </div>
      <p className="mt-4 text-sm">Light-damage zone area: <b>{formatNum(r.area)} km²</b> — {cityComparison(r.area)}.</p>
      {r.global && <p className="mt-2 rounded-xl bg-soft p-3 text-sm">At this scale, effects would be global — climate disruption and mass extinction.</p>}
      <p className="mt-4 text-xs text-muted">Educational and approximate: a simplified model with order-of-magnitude accuracy, a fictional planet, and no population or terrain data. It is not a prediction or a hazard assessment.</p>
    </div>
  )
}

function Fallback({ onUse }) {
  useEffect(() => {
    onUse()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

/** 2D fallback when WebGL is unavailable. */
function FlatMap({ loc, onPick, launch }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    c.width = 720; c.height = 360
    drawTexture(c)
  }, [])
  const x = ((loc.lon + 180) / 360) * 100
  const y = ((90 - loc.lat) / 180) * 100
  return (
    <div className="relative grid h-full place-items-center">
      <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
        <canvas ref={ref} className="h-full w-full cursor-crosshair" role="img" aria-label="Flat map. Click to choose an impact location."
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            onPick({ lon: ((e.clientX - r.left) / r.width) * 360 - 180, lat: 90 - ((e.clientY - r.top) / r.height) * 180 })
          }} />
        <span className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3b30] ring-4 ring-white/60" style={{ left: `${x}%`, top: `${y}%` }} />
        {launch && (
          <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ff3b30] bg-[#ff3b30]/20" style={{ left: `${x}%`, top: `${y}%`, width: `${Math.max(1, (launch.severe / 111 / 360) * 100 * 2)}%`, aspectRatio: '1' }} />
        )}
      </div>
      <p className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">3D unavailable on this device — using a flat map.</p>
    </div>
  )
}
