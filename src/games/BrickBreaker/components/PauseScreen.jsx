import { LogOut, Play, RefreshCw, RotateCcw } from 'lucide-react'
import Overlay from './Overlay.jsx'

export default function PauseScreen({ mode, onResume, onRestartLevel, onRestart, onExit }) {
  return (
    <Overlay label="Game paused">
      <h2 className="text-3xl font-black tracking-widest">PAUSED</h2>
      <p className="mt-1 text-sm text-muted">Press Escape to resume.</p>
      <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2">
        <button type="button" className="btn btn-primary" onClick={onResume} data-autofocus><Play size={16} aria-hidden /> Resume</button>
        <button type="button" className="btn" onClick={onRestartLevel}>
          <RotateCcw size={16} aria-hidden /> Restart {mode === 'endless' ? 'wave' : mode === 'timeAttack' ? 'board' : 'level'}
        </button>
        <button type="button" className="btn" onClick={onRestart}><RefreshCw size={16} aria-hidden /> Restart game</button>
        <button type="button" className="btn btn-ghost" onClick={onExit}><LogOut size={16} aria-hidden /> Exit game</button>
      </div>
    </Overlay>
  )
}
