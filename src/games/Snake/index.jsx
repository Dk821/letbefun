import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Settings2 } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useGameData, useInterval, useKey, useSound } from '../../hooks/index.js'
import Board from './Board.jsx'
import Menu from './Menu.jsx'
import { BONUS_POINTS, COLORS, DEFAULTS, SIZES, SPEEDS, WALLS, bestKey, newGame, queueTurn, step, tickMs } from './logic.js'

const KEYS = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }
const SWIPE = 18 // pixels
const CHOICES = { speed: SPEEDS, size: SIZES, walls: WALLS }
const isOptions = (v) => Boolean(v) && Object.entries(CHOICES).every(([key, list]) => Object.hasOwn(list, v[key]))

export default function Snake() {
  const [options, setOptions] = useGameData('snake', 'options', DEFAULTS, isOptions)
  const [best, submit] = useBestScore('snake', bestKey(options))
  const [status, setStatus] = useState('menu') // menu | ready | run | paused | over
  const [game, setGame] = useState(() => newGame(options))
  const [record, setRecord] = useState(false)
  const play = useSound()
  const swipe = useRef(null)
  const inGame = status !== 'menu'

  const set = (key) => (value) => {
    play('tick')
    setOptions((o) => ({ ...o, [key]: value }))
  }
  const start = () => {
    setGame(newGame(options))
    setRecord(false)
    setStatus('ready')
  }
  const pause = useCallback(() => setStatus((s) => (s === 'run' ? 'paused' : s)), [])
  const resume = () => setStatus('run')

  const turn = (d) => {
    if (status === 'menu' || status === 'over') return
    // Reversing into the body is not a valid first move.
    if (status === 'ready' && d[0] === -game.dir[0] && d[1] === -game.dir[1]) return
    setGame((g) => queueTurn(g, d))
    if (status !== 'run') setStatus('run')
  }

  useKey((e) => {
    if (!inGame || e.ctrlKey || e.metaKey || e.altKey) return
    const d = KEYS[e.key.toLowerCase()]
    if (d && status !== 'over') {
      e.preventDefault()
      turn(d)
    } else if ((e.code === 'Space' || e.key.toLowerCase() === 'p') && (status === 'run' || status === 'paused')) {
      // A focused button already reacts to Space.
      if (e.code === 'Space' && e.target.tagName === 'BUTTON') return
      e.preventDefault()
      if (!e.repeat) (status === 'run' ? pause : resume)()
    }
  }, [status, game])

  useEffect(() => {
    const onHidden = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('blur', pause)
    return () => {
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('blur', pause)
    }
  }, [pause])

  useInterval(() => {
    const next = step(game, options)
    setGame(next)
    if (next.dead || next.won) {
      setStatus('over')
      setRecord(next.score > 0 && next.score > (best ?? 0))
      submit(next.score)
      play(next.won ? 'win' : 'bad')
    } else if (next.score > game.score) {
      play(next.score - game.score >= BONUS_POINTS ? 'win' : 'good')
    }
  }, tickMs(options, game.eaten), status === 'run')

  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e) => {
    const from = swipe.current
    if (!from) return
    const dx = e.clientX - from.x
    const dy = e.clientY - from.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE) return
    swipe.current = { x: e.clientX, y: e.clientY } // one long swipe can turn several times
    turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)])
  }
  const endSwipe = () => {
    swipe.current = null
  }

  if (status === 'menu') return <Menu options={options} best={best} onChange={set} onPlay={start} />

  const pad = (d, Icon, label, place) => (
    <button
      type="button"
      className={`btn grid size-14 touch-manipulation place-items-center !rounded-2xl !p-0 short:size-11 ${place}`}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        turn(d)
      }}
      onClick={(e) => e.detail === 0 && turn(d)} // keyboard activation
    >
      <Icon size={22} aria-hidden />
    </button>
  )

  return (
    // The board is sized to the screen height. In landscape the controls move beside it.
    <div className="mx-auto grid w-full max-w-[var(--board)] gap-3 [--board:min(36rem,max(16rem,calc(100dvh_-_15rem)))] short:max-w-none short:grid-cols-[var(--board)_minmax(0,16rem)] short:grid-rows-[auto_auto_1fr] short:justify-center short:[--board:calc(100dvh_-_5.5rem)]">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 short:col-start-2 short:row-start-1">
        <Stat label="Score" value={game.score} />
        <Stat label="Best" value={Math.max(best ?? 0, game.score)} />
        <Stat label="Length" value={game.snake.length} />
      </div>

      <div className="relative short:col-start-1 short:row-span-3 short:row-start-1">
        <div
          className="no-select aspect-square w-full touch-none overflow-hidden rounded-2xl bg-soft"
          style={{
            border: `3px ${options.walls === 'wrap' ? 'dashed' : 'solid'} ${COLORS.head}`,
            boxShadow: `0 12px 40px -18px ${COLORS.head}`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endSwipe}
          onPointerCancel={endSwipe}
          onPointerLeave={endSwipe}
        >
          <Board game={game} dead={status === 'over' && game.dead} />
        </div>

        {status === 'ready' && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit max-w-[90%] rounded-full border border-line bg-card/90 px-4 py-1.5 text-center text-sm font-semibold short:text-xs">
            Swipe or press an arrow key to start
          </p>
        )}
        {(status === 'paused' || status === 'over') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center overflow-auto rounded-2xl bg-bg/75 p-3 text-center backdrop-blur-[2px]">
            <div>
              <p className="font-display text-3xl font-extrabold" aria-live="polite">
                {status === 'paused' ? 'Paused' : game.won ? 'You filled the board!' : 'Game over'}
              </p>
              {status === 'over' && (
                <>
                  <p className="mt-1 font-mono text-4xl font-bold">{game.score}</p>
                  <p className="mt-1 text-sm text-muted">{record ? '🏆 New best score!' : `Best ${best ?? 0}`}</p>
                </>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" className="btn btn-primary" onClick={status === 'paused' ? resume : start} autoFocus>
                  {status === 'paused' ? <><Play size={16} aria-hidden /> Resume</> : <><RotateCcw size={16} aria-hidden /> Play again</>}
                </button>
                <button type="button" className="btn" onClick={() => setStatus('menu')}>
                  <Settings2 size={16} aria-hidden /> Options
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 short:col-start-2">
        <p className="text-sm text-muted">{SPEEDS[options.speed].label} · {WALLS[options.walls].label}</p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-sm" onClick={status === 'paused' ? resume : pause} disabled={status !== 'run' && status !== 'paused'}>
            {status === 'paused' ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            {status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => setStatus('menu')}>
            <Settings2 size={14} aria-hidden /> Options
          </button>
        </div>
      </div>

      <div className="mx-auto hidden w-fit grid-cols-3 gap-2 self-start pointer-coarse:grid short:col-start-2">
        {pad([0, -1], ArrowUp, 'Up', 'col-start-2')}
        {pad([-1, 0], ArrowLeft, 'Left', 'col-start-1')}
        {pad([0, 1], ArrowDown, 'Down', '')}
        {pad([1, 0], ArrowRight, 'Right', '')}
      </div>
    </div>
  )
}
