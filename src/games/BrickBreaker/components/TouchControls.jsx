import { ChevronLeft, ChevronRight, Crosshair, Rocket } from 'lucide-react'

/** A button that stays "on" for as long as it is held. */
function HoldButton({ input, flag, onPress, label, className = '', children }) {
  const release = () => {
    input[flag] = false
  }
  return (
    <button
      type="button"
      aria-label={label}
      className={`btn pointer-events-auto !min-h-14 min-w-16 touch-none !border-cyan-400/40 bg-card/80 active:bg-cyan-400/25 short:!min-h-12 ${className}`}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture?.(e.pointerId)
        input[flag] = true
        onPress?.()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onClick={(e) => e.detail === 0 && onPress?.()} // keyboard or switch access
    >
      {children}
    </button>
  )
}

/** On-screen buttons for touch devices. In landscape they sit in the corners, clear of the playfield. */
export default function TouchControls({ input, arrows, laser }) {
  const Icon = laser ? Crosshair : Rocket
  return (
    <div className="no-select mt-2 flex shrink-0 items-center justify-center gap-3 short:pointer-events-none short:absolute short:inset-x-2 short:bottom-2 short:z-[5] short:mt-0">
      {arrows && (
        <HoldButton input={input} flag="left" label="Move left" className="flex-1 short:flex-none">
          <ChevronLeft size={28} aria-hidden />
        </HoldButton>
      )}
      <HoldButton
        input={input}
        flag="fireButton"
        label={laser ? 'Fire laser' : 'Launch ball'}
        onPress={() => { input.launch = true }}
        className="w-full max-w-xs font-black uppercase tracking-widest short:order-last short:ml-auto short:w-auto"
      >
        <Icon size={18} aria-hidden /> {laser ? 'Fire' : 'Launch'}
      </HoldButton>
      {arrows && (
        <HoldButton input={input} flag="right" label="Move right" className="flex-1 short:flex-none">
          <ChevronRight size={28} aria-hidden />
        </HoldButton>
      )}
    </div>
  )
}
