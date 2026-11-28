import { Heart, Pause } from 'lucide-react'
import { MODES } from '../data/constants.js'
import { LEVELS } from '../data/levels.js'
import PowerUpIndicator from './PowerUpIndicator.jsx'

const Item = ({ label, children }) => (
  <div className="min-w-0">
    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted short:text-[9px] short:leading-3">{label}</div>
    <div className="truncate font-mono text-sm font-bold leading-tight sm:text-lg short:!text-sm">{children}</div>
  </div>
)

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function GameHUD({ hud, best, onPause }) {
  const { mode } = hud
  const progress = hud.total ? Math.min(100, Math.round((1 - hud.left / hud.total) * 100)) : 0
  const stage = mode === 'classic' ? `Level ${hud.level} of ${LEVELS.length}` : mode === 'endless' ? `Wave ${hud.level} · row in ${hud.nextRow}s` : `Board ${hud.level}`

  return (
    <div className="mx-auto mb-2 w-full max-w-3xl shrink-0 rounded-xl border border-line bg-card/80 px-3 py-1.5 short:mb-1 short:flex short:items-center short:gap-4 short:py-0.5">
      <div className="flex items-center justify-between gap-2 sm:gap-4 short:flex-[3]">
        <Item label="Score">{hud.score.toLocaleString()}</Item>
        <Item label="Best">{Math.max(best, hud.score).toLocaleString()}</Item>
        <Item label={mode === 'endless' ? 'Wave' : 'Level'}>
          {hud.level}
          {/* The row below repeats this on very narrow screens. */}
          {mode === 'classic' && <span className="max-[400px]:hidden">/{LEVELS.length}</span>}
        </Item>
        {mode === 'timeAttack' ? (
          <Item label="Time"><span className={hud.timeLeft <= 10 ? 'text-rose-400' : 'text-cyan-300'}>{clock(hud.timeLeft)}</span></Item>
        ) : (
          <Item label="Lives">
            <span className="flex items-center gap-1" aria-label={`${hud.lives} lives left`}>
              <Heart size={13} className="fill-rose-500 text-rose-500" aria-hidden />{hud.lives}
            </span>
          </Item>
        )}
        <Item label="Bricks">{hud.left}</Item>
        <Item label="Multi">
          <span className={hud.multiplier >= MODES[mode].maxMultiplier ? 'text-yellow-300' : hud.multiplier > 1 ? 'text-pink-300' : ''}>×{hud.multiplier}</span>
        </Item>
        <button type="button" className="btn btn-sm shrink-0 max-sm:!px-3" onClick={onPause} aria-label="Pause game">
          <Pause size={14} aria-hidden /> <span className="max-sm:sr-only">Pause</span>
        </button>
      </div>
      <div className="mt-1 flex items-center gap-2 short:mt-0 short:flex-[2]">
        <span className="shrink-0 text-[11px] font-semibold text-muted">{stage}</span>
        <div className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-soft" role="meter" aria-label="Bricks cleared" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <PowerUpIndicator effects={hud.effects} />
      </div>
    </div>
  )
}
