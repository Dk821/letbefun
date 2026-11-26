import { useEffect, useRef } from 'react'
import { Crosshair } from 'lucide-react'

const RADIUS = 46
const DEAD_ZONE = 0.12

/** Analog joystick and hold-to-fire button. Writes straight into the engine input (no re-renders). */
export default function MobileControls({ input }) {
  const knob = useRef(null)
  const stick = useRef(null) // active joystick pointer id

  const move = (e) => {
    if (stick.current !== e.pointerId) return
    const r = e.currentTarget.getBoundingClientRect()
    let x = (e.clientX - r.left - r.width / 2) / RADIUS
    let y = (e.clientY - r.top - r.height / 2) / RADIUS
    const len = Math.hypot(x, y)
    if (len > 1) {
      x /= len
      y /= len
    }
    knob.current.style.transform = `translate(${x * RADIUS}px, ${y * RADIUS}px)`
    input.ax = len < DEAD_ZONE ? 0 : x
    input.ay = len < DEAD_ZONE ? 0 : y
  }
  const release = (e) => {
    if (stick.current !== e.pointerId) return
    stick.current = null
    input.ax = input.ay = 0
    knob.current.style.transform = ''
  }
  const grab = (e) => {
    stick.current = e.pointerId
    e.currentTarget.setPointerCapture?.(e.pointerId)
    move(e)
  }
  const fire = (on) => (e) => {
    if (on) e.currentTarget.setPointerCapture?.(e.pointerId)
    input.touchFire = on
  }

  useEffect(() => () => {
    input.ax = input.ay = 0
    input.touchFire = false
  }, [input])

  return (
    <div className="no-select flex shrink-0 touch-none items-center justify-between px-3 py-2 landscape:pointer-events-none landscape:absolute landscape:inset-x-0 landscape:bottom-1 landscape:z-[5]">
      <div
        className="pointer-events-auto relative grid size-32 touch-none place-items-center rounded-full border-2 border-cyan-400/40 bg-cyan-400/10 landscape:size-28"
        role="application"
        aria-label="Movement joystick"
        onPointerDown={grab}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <div ref={knob} className="pointer-events-none size-14 rounded-full border border-white/40 bg-cyan-400/70 shadow-[0_0_20px_#22d3ee]" />
      </div>
      <button
        type="button"
        className="pointer-events-auto grid size-24 touch-none place-items-center rounded-full border-2 border-fuchsia-300/60 bg-fuchsia-500/30 text-white shadow-[0_0_24px_-4px_#d946ef] active:bg-fuchsia-500/70"
        aria-label="Fire"
        onPointerDown={fire(true)}
        onPointerUp={fire(false)}
        onPointerCancel={fire(false)}
        onLostPointerCapture={fire(false)}
      >
        <span className="pointer-events-none grid place-items-center text-xs font-bold uppercase"><Crosshair size={30} aria-hidden />Fire</span>
      </button>
    </div>
  )
}
