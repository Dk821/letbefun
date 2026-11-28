import { motion } from 'framer-motion'
import { Play, Trophy } from 'lucide-react'
import { CONTROL_METHODS, DIFFICULTIES } from '../data/constants.js'
import { LEVELS } from '../data/levels.js'
import Overlay from './Overlay.jsx'

const CONTROLS = [
  ['Move', ['Mouse', '← →', 'A D'], 'Drag on screen'],
  ['Launch / Shoot', ['Space', 'Click'], 'Tap or button'],
  ['Pause', ['Esc'], 'Pause button'],
]

const EMBLEM = ['#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#22d3ee', '#a855f7', '#ec4899']

function Picker({ label, options, value, onChange }) {
  return (
    <fieldset className="mt-3 short:mt-2">
      <legend className="mx-auto text-[10px] font-bold uppercase tracking-[0.3em] text-muted">{label}</legend>
      <div className="mx-auto mt-1.5 grid max-w-sm grid-cols-3 gap-2">
        {Object.entries(options).map(([key, option]) => (
          <button
            key={key}
            type="button"
            className={`min-h-10 cursor-pointer rounded-lg border-[1.5px] px-1 text-xs font-bold uppercase tracking-wider transition ${value === key ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/20 to-violet-500/25 text-cyan-200 shadow-[0_0_18px_-4px_#22d3ee]' : 'border-line text-muted hover:border-muted hover:text-ink'}`}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted short:sr-only" aria-live="polite">{options[value].hint}</p>
    </fieldset>
  )
}

export default function StartScreen({ difficulty, control, best, stats, onDifficulty, onControl, onPlay }) {
  return (
    <Overlay label="Brick Breaker start screen">
      <div className="mx-auto flex w-fit items-end gap-1 short:hidden" aria-hidden>
        {EMBLEM.map((color, i) => (
          <motion.span
            key={i}
            className="block h-3 w-7 rounded-[4px]"
            style={{ background: color, boxShadow: `0 0 12px ${color}` }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <h2 className="mt-3 text-4xl font-black italic leading-none tracking-[0.08em] sm:text-5xl short:mt-0 short:text-3xl">
        <span className="text-white drop-shadow-[0_0_12px_#22d3ee]">BRICK</span>{' '}
        <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 bg-clip-text pr-2 text-transparent">BREAKER</span>
      </h2>
      <p className="mt-2 text-sm text-muted">Break every brick, catch power-ups and keep the ball alive.</p>

      <Picker label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={onDifficulty} />
      <Picker label="Touch control" options={CONTROL_METHODS} value={control} onChange={onControl} />

      <button type="button" className="btn btn-primary mx-auto mt-4 !flex w-full max-w-sm !py-3 !text-lg font-black uppercase tracking-[0.25em] short:mt-3 short:!py-2" onClick={onPlay} data-autofocus>
        <Play size={18} className="fill-current" aria-hidden /> Play
      </button>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
        <p className="flex items-center gap-2">
          <Trophy size={15} className="text-yellow-300" aria-hidden />
          <span className="text-muted">Best score</span>
          <strong className="font-mono text-lg text-yellow-300">{best.toLocaleString()}</strong>
        </p>
        <p><span className="text-muted">Levels</span> <strong className="font-mono">{LEVELS.length}</strong></p>
      </div>

      {stats.played > 0 && (
        <dl className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {[
            ['Games', stats.played],
            ['Top level', stats.highestLevel],
            ['Bricks', stats.bricks],
            ['Power-ups', stats.powerups],
            ['Time', `${Math.floor(stats.time / 60)}m`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-soft/60 px-1 py-1">
              <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-mono text-sm font-bold">{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      )}

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
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
