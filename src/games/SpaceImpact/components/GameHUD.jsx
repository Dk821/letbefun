import { Heart, Pause } from 'lucide-react'
import { BOSS_RUSH_COUNT, MODES } from '../data/constants.js'

const Item = ({ label, children, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted short:text-[9px] short:leading-3">{label}</div>
    <div className="truncate font-mono text-sm font-bold leading-tight sm:text-lg short:!text-sm">{children}</div>
  </div>
)

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const BUFFS = [
  ['shield', 'Shield', 'text-sky-300 border-sky-400/50'],
  ['rapid', 'Rapid', 'text-yellow-300 border-yellow-400/50'],
  ['multi', 'Score ×2', 'text-rose-300 border-rose-400/50'],
]

export default function GameHUD({ hud, best, mode, onPause }) {
  const low = hud.hp <= 30
  return (
    <div className="mb-2 shrink-0 rounded-xl border border-line bg-card/80 px-3 py-1.5 short:mb-1 short:flex short:items-center short:gap-4 short:py-0.5">
      <div className="flex items-center gap-3 sm:gap-6 short:flex-[3] short:gap-4">
        <Item label="Score">{hud.score.toLocaleString()}</Item>
        <Item label="Best">{Math.max(best, hud.score).toLocaleString()}</Item>
        <Item label={mode === 'boss' ? 'Boss' : 'Wave'}>{mode === 'boss' ? `${hud.wave}/${BOSS_RUSH_COUNT}` : hud.wave}</Item>
        <Item label="Time" className={mode === 'survival' ? '' : 'max-sm:hidden'}>{clock(hud.time)}</Item>
        <Item label="Weapon" className="ml-auto text-right">
          <span className="text-cyan-300">{hud.weapon}</span>
        </Item>
        <button type="button" className="btn btn-sm shrink-0" onClick={onPause} aria-label="Pause game">
          <Pause size={14} aria-hidden /> <span className="max-sm:sr-only">Pause</span>
        </button>
      </div>
      <div className="mt-1 flex items-center gap-3 short:mt-0 short:flex-[2] short:gap-2">
        <div className="flex gap-0.5" role="img" aria-label={`${hud.lives} lives left`}>
          {Array.from({ length: MODES[mode].lives }, (_, i) => (
            <Heart key={i} size={15} className={i < hud.lives ? 'fill-rose-500 text-rose-500' : 'text-line'} aria-hidden />
          ))}
        </div>
        <div className="h-2.5 max-w-60 flex-1 overflow-hidden rounded-full bg-soft" role="meter" aria-label="Health" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hud.hp}>
          <div className={`h-full rounded-full transition-[width] ${low ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`} style={{ width: `${hud.hp}%` }} />
        </div>
        <span className={`w-10 font-mono text-xs ${low ? 'text-rose-400' : 'text-muted'}`}>{hud.hp}%</span>
        <div className="ml-auto flex h-5 gap-1 overflow-hidden">
          {BUFFS.map(([key, label, cls]) => hud[key] > 0 && (
            <span key={key} className={`whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold ${cls}`}>{label} {hud[key]}s</span>
          ))}
        </div>
      </div>
    </div>
  )
}
