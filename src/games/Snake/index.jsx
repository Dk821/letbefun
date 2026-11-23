import { useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { Stat } from '../../components/ui.jsx'
import { useBestScore, useInterval, useKey, useSound } from '../../hooks/index.js'

const N = 18
const START = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }]
const DIRS = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }
const spawn = (s) => {
  let p
  do p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }
  while (s.some((c) => c.x === p.x && c.y === p.y))
  return p
}

export default function Snake() {
  const [snake, setSnake] = useState(START)
  const [food, setFood] = useState({ x: 13, y: 9 })
  const [state, setState] = useState('idle')
  const dir = useRef([1, 0])
  const queued = useRef([1, 0])
  const [best, submit] = useBestScore('snake')
  const play = useSound()
  const score = snake.length - 3

  const turn = (d) => {
    if (d[0] === -dir.current[0] && d[1] === -dir.current[1]) return
    queued.current = d
    if (state === 'idle') setState('run')
  }
  const reset = () => {
    setSnake(START)
    setFood({ x: 13, y: 9 })
    dir.current = [1, 0]
    queued.current = [1, 0]
    setState('idle')
  }
  useKey((e) => {
    const d = DIRS[e.key] || DIRS[e.key.toLowerCase()]
    if (d && state !== 'over') {
      e.preventDefault()
      turn(d)
    }
  }, [state])

  useInterval(() => {
    dir.current = queued.current
    const h = { x: snake[0].x + dir.current[0], y: snake[0].y + dir.current[1] }
    const eat = h.x === food.x && h.y === food.y
    const body = eat ? snake : snake.slice(0, -1)
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || body.some((c) => c.x === h.x && c.y === h.y)) {
      setState('over')
      submit(score)
      play('bad')
      return
    }
    const ns = [h, ...body]
    setSnake(ns)
    if (eat) {
      setFood(spawn(ns))
      play('good')
    }
  }, Math.max(60, 140 - score * 3), state === 'run')

  const cells = new Map()
  snake.forEach((c, i) => cells.set(c.y * N + c.x, i))
  const pad = (d, Icon, label) => (
    <button className="btn grid size-14 place-items-center !p-0" aria-label={label} onClick={() => turn(d)}><Icon size={22} /></button>
  )

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Stat label="Score" value={score} />
        <Stat label="Best" value={best ?? '—'} />
      </div>
      <div className="relative">
        <div className="grid w-full touch-none overflow-hidden rounded-2xl border-2 border-ink" style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, aspectRatio: '1', background: 'var(--soft)' }}>
          {Array.from({ length: N * N }, (_, i) => {
            const idx = cells.get(i)
            const isFood = food.y * N + food.x === i
            return <div key={i} style={{ background: idx === 0 ? '#15803d' : idx != null ? '#4ade80' : isFood ? '#ef4444' : 'transparent', borderRadius: isFood ? '50%' : 3, margin: 1 }} />
          })}
        </div>
        {state !== 'run' && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-bg/70 text-center">
            <div>
              <p className="font-display text-3xl font-extrabold">{state === 'over' ? `Game over · ${score}` : 'Ready?'}</p>
              <p className="mt-1 text-muted">{state === 'over' ? '' : 'Press an arrow key to start'}</p>
              {state === 'over' && <button className="btn btn-primary mt-4" onClick={reset}>Play again</button>}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 grid w-fit grid-cols-3 gap-2 sm:hidden" style={{ margin: '1rem auto 0' }}>
        <span />{pad([0, -1], ArrowUp, 'Up')}<span />
        {pad([-1, 0], ArrowLeft, 'Left')}{pad([0, 1], ArrowDown, 'Down')}{pad([1, 0], ArrowRight, 'Right')}
      </div>
    </div>
  )
}
