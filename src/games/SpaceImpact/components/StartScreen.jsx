import { motion } from 'framer-motion'
import { Play, Trophy } from 'lucide-react'
import { DIFFICULTIES } from '../data/constants.js'
import Overlay from './Overlay.jsx'

const ACTIVE = {
  easy: 'border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_18px_-4px_#34d399]',
  normal: 'border-cyan-400 bg-cyan-400/15 text-cyan-300 shadow-[0_0_18px_-4px_#22d3ee]',
  hard: 'border-rose-400 bg-rose-400/15 text-rose-300 shadow-[0_0_18px_-4px_#fb7185]',
}

const CONTROLS = [
  ['Move', ['WASD', 'Arrows'], 'Joystick'],
  ['Shoot', ['Space'], 'Fire button'],
  ['Pause', ['Esc'], 'Pause button'],
  ['Start', ['Enter'], 'Play button'],
]

/** The player ship, drawn to match the in-game sprite. */
function ShipEmblem() {
  return (
    <motion.svg
      viewBox="-60 -28 104 56"
      className="mx-auto h-14 w-28 drop-shadow-[0_0_14px_#22d3ee] short:hidden"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="si-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="si-trail" gradientUnits="userSpaceOnUse" x1="-58" y1="0" x2="-22" y2="0">
          <stop offset="0" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M-58 -2H-24V2H-58Z M-46 -13H-22V-11H-46Z M-46 11H-22V13H-46Z" fill="url(#si-trail)" />
      <polygon points="38,0 12,-8 -2,-11 -20,-25 -15,-8 -24,-7 -24,7 -15,8 -20,25 -2,11 12,8" fill="url(#si-hull)" stroke="#22d3ee" strokeWidth="1.5" />
      <polygon points="24,0 8,-5 -6,0 8,5" fill="#ecfeff" />
    </motion.svg>
  )
}

export default function StartScreen({ difficulty, best, stats, onDifficulty, onPlay }) {
  return (
    <Overlay label="Space Impact start screen">
      <ShipEmblem />
      <h2 className="mt-1 text-4xl font-black italic leading-none tracking-[0.12em] sm:text-6xl short:text-3xl">
        <span className="block text-white drop-shadow-[0_0_12px_#22d3ee] short:inline">SPACE</span>{' '}
        <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text px-2 text-transparent short:inline">IMPACT</span>
      </h2>
      <div className="mx-auto mt-3 h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-400 to-transparent short:mt-2" aria-hidden />

      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted short:sr-only">Difficulty</p>
      <div className="mx-auto mt-1.5 grid max-w-xs grid-cols-3 gap-2" role="group" aria-label="Difficulty">
        {Object.entries(DIFFICULTIES).map(([key, d]) => (
          <button
            key={key}
            type="button"
            className={`min-h-10 cursor-pointer rounded-lg border-[1.5px] text-xs font-bold uppercase tracking-wider transition short:min-h-9 ${difficulty === key ? ACTIVE[key] : 'border-line text-muted hover:border-muted hover:text-ink'}`}
            aria-pressed={difficulty === key}
            onClick={() => onDifficulty(key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary mx-auto mt-4 !flex w-full max-w-xs !py-3 !text-lg font-black uppercase tracking-[0.25em] short:mt-3 short:!py-2" onClick={onPlay} data-autofocus>
        <Play size={18} className="fill-current" aria-hidden /> Play
      </button>

      <p className="mt-3 flex items-center justify-center gap-2 text-sm short:mt-2">
        <Trophy size={15} className="text-yellow-300" aria-hidden />
        <span className="text-muted">Best score</span>
        <strong className="font-mono text-lg text-yellow-300">{best.toLocaleString()}</strong>
      </p>

      {stats.played > 0 && (
        <dl className="mt-2 grid grid-cols-4 gap-1.5">
          {[['Games', stats.played], ['Kills', stats.destroyed], ['Longest', `${Math.floor(stats.bestTime)}s`], ['Bosses', stats.bosses]].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-soft/60 px-1 py-1">
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-mono text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3 text-xs sm:grid-cols-4">
        {CONTROLS.map(([action, keys, touch]) => (
          <div key={action}>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{action}</dt>
            <dd className="mt-1 flex flex-wrap justify-center gap-1 pointer-coarse:hidden">
              {keys.map((k) => (
                <kbd key={k} className="rounded border border-b-[3px] border-line bg-soft px-1.5 py-0.5 font-mono text-[10px]">{k}</kbd>
              ))}
            </dd>
            <dd className="mt-1 hidden font-semibold pointer-coarse:block">{touch}</dd>
          </div>
        ))}
      </dl>
    </Overlay>
  )
}
