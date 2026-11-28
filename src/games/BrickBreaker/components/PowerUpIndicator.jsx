import { Crosshair, Flame, Maximize2, Minimize2, Shield, Snail } from 'lucide-react'
import { POWERUPS } from '../data/powerupTypes.js'

// Only lasting effects appear here; Multi Ball and Extra Life are instant.
const ICONS = { expand: Maximize2, shrink: Minimize2, laser: Crosshair, slow: Snail, fire: Flame, shield: Shield }

export default function PowerUpIndicator({ effects }) {
  return (
    <ul className="flex h-6 items-center justify-end gap-1 overflow-hidden" aria-label="Active power-ups">
      {effects.map(({ key, left }) => {
        const Icon = ICONS[key]
        const { label, color } = POWERUPS[key]
        return (
          <li
            key={key}
            title={label}
            className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 text-[11px] font-semibold leading-5 ${left > 0 && left <= 3 ? 'animate-pulse' : ''}`}
            style={{ color, borderColor: `${color}80`, background: `${color}1a` }}
          >
            <Icon size={12} aria-hidden />
            <span className="max-sm:sr-only">{label}</span>
            {left > 0 && <span className="font-mono">{left}s</span>}
          </li>
        )
      })}
    </ul>
  )
}
