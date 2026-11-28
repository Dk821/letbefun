import { motion } from 'framer-motion'
import { BrickWall, Gauge, Grid3x3, Play, Repeat, Trophy } from 'lucide-react'
import { SIZES, SPEEDS, WALLS } from './logic.js'

const WALL_ICONS = { solid: BrickWall, wrap: Repeat }

/** One row of large selectable tiles. */
function Group({ icon: Icon, label, list, value, onChange, columns, children }) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        <Icon size={15} className="text-game" aria-hidden /> {label}
      </legend>
      <div className={`grid gap-2 ${columns}`}>
        {Object.entries(list).map(([key, item]) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
            className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2.5 text-center transition active:scale-95 ${
              value === key ? 'border-game bg-game/15 shadow-[0_8px_24px_-12px_var(--game)]' : 'border-line bg-soft/50 hover:border-muted'
            }`}
          >
            {children(item, key)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const Title = ({ children }) => <span className="text-sm font-bold leading-tight">{children}</span>
const Hint = ({ children }) => <span className="text-[11px] leading-tight text-muted">{children}</span>

/** Options screen shown before a game. */
export default function Menu({ options, best, onChange, onPlay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-md overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-gradient-to-br from-game/25 to-transparent px-5 py-4">
        <div>
          <h2 className="text-2xl font-black">Game options</h2>
          <p className="text-sm text-muted">Set up your run</p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-4 py-2 text-center" title="Best score for the selected options">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <Trophy size={12} className="text-yellow-500" aria-hidden /> Best
          </p>
          <p className="font-mono text-2xl font-bold leading-tight">{best ?? '—'}</p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <Group icon={Gauge} label="Speed" list={SPEEDS} value={options.speed} onChange={onChange('speed')} columns="grid-cols-3">
          {(speed, key) => (
            <>
              <span className="flex items-end gap-0.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`w-1.5 rounded-sm ${i <= Object.keys(SPEEDS).indexOf(key) ? 'bg-game' : 'bg-line'}`} style={{ height: 6 + i * 4 }} />
                ))}
              </span>
              <Title>{speed.label}</Title>
              <Hint>{speed.hint}</Hint>
            </>
          )}
        </Group>

        <Group icon={Grid3x3} label="Board size" list={SIZES} value={options.size} onChange={onChange('size')} columns="grid-cols-3">
          {(size) => (
            <>
              <Title>{size.label}</Title>
              <Hint>{size.n} × {size.n}</Hint>
            </>
          )}
        </Group>

        <Group icon={BrickWall} label="Walls" list={WALLS} value={options.walls} onChange={onChange('walls')} columns="grid-cols-2">
          {(wall, key) => {
            const Icon = WALL_ICONS[key]
            return (
              <>
                <Icon size={20} className="text-game" aria-hidden />
                <Title>{wall.label}</Title>
                <Hint>{wall.hint}</Hint>
              </>
            )
          }}
        </Group>

        <button type="button" className="btn btn-primary w-full !py-3 !text-base font-bold" onClick={onPlay} autoFocus>
          <Play size={18} className="fill-current" aria-hidden /> Play
        </button>
        <p className="text-center text-xs text-muted">
          <span className="pointer-coarse:hidden">Arrow keys or WASD to move · Space or P to pause</span>
          <span className="hidden pointer-coarse:inline">Swipe the board or use the arrow buttons</span>
        </p>
      </div>
    </motion.div>
  )
}
