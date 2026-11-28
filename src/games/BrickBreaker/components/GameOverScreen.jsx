import { LogOut, Menu, RotateCcw, Trophy } from 'lucide-react'
import { Stat } from '../../../components/ui.jsx'
import { DIFFICULTIES, MODES } from '../data/constants.js'
import Overlay from './Overlay.jsx'

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Game over, time up and victory screen. */
export default function GameOverScreen({ result, best, isRecord, onRestart, onMenu, onExit }) {
  const timeUp = result.mode === 'timeAttack'
  const title = result.victory ? 'VICTORY' : timeUp ? "TIME'S UP" : 'GAME OVER'
  return (
    <Overlay label={title} focusDelay={700}>
      {result.victory && <Trophy size={40} className="mx-auto text-yellow-300" aria-hidden />}
      <h2 className={`text-3xl font-black tracking-widest sm:text-4xl ${result.victory ? 'text-emerald-300' : timeUp ? 'text-cyan-300' : 'text-rose-400'}`}>{title}</h2>
      <p className="mt-1 text-xs text-muted">{MODES[result.mode].label} · {DIFFICULTIES[result.difficulty].label}</p>
      {isRecord && <p className="mt-1 font-bold text-yellow-300">New high score!</p>}
      <div className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
        <Stat label="Final score" value={result.score.toLocaleString()} />
        <Stat label="Best score" value={best.toLocaleString()} />
        <Stat label={result.mode === 'classic' ? 'Levels completed' : result.mode === 'endless' ? 'Waves cleared' : 'Boards cleared'} value={result.cleared} />
        <Stat label="Bricks destroyed" value={result.bricks} />
        <Stat label="Play time" value={clock(result.time)} />
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={onRestart} data-autofocus>
          <RotateCcw size={16} aria-hidden /> {result.victory ? 'Play again' : 'Restart'}
        </button>
        <button type="button" className="btn" onClick={onMenu}><Menu size={16} aria-hidden /> Main menu</button>
        <button type="button" className="btn btn-ghost" onClick={onExit}><LogOut size={16} aria-hidden /> Back to game page</button>
      </div>
    </Overlay>
  )
}
