import { LogOut, Menu, RotateCcw, Trophy } from 'lucide-react'
import { Stat } from '../../../components/ui.jsx'
import { DIFFICULTIES, MODES } from '../data/constants.js'
import Overlay from './Overlay.jsx'

/** Game over and victory screen. */
export default function GameOverScreen({ result, best, isRecord, onRestart, onMenu, onExit }) {
  return (
    <Overlay label={result.victory ? 'Victory' : 'Game over'} focusDelay={700}>
      {result.victory && <Trophy size={40} className="mx-auto text-yellow-300" aria-hidden />}
      <h2 className={`text-3xl font-black tracking-widest sm:text-4xl ${result.victory ? 'text-emerald-300' : 'text-rose-400'}`}>
        {result.victory ? 'VICTORY' : 'GAME OVER'}
      </h2>
      <p className="mt-1 text-xs text-muted">{MODES[result.mode].label} · {DIFFICULTIES[result.difficulty].label}</p>
      {isRecord && <p className="mt-1 font-bold text-yellow-300">New high score!</p>}
      <div className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
        <Stat label="Final score" value={result.score.toLocaleString()} />
        <Stat label="Best score" value={best.toLocaleString()} />
        <Stat label="Enemies destroyed" value={result.kills} />
        <Stat label="Survival time" value={`${Math.floor(result.time)}s`} />
        <Stat label="Bosses defeated" value={result.bosses} />
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
