// Snake rules, free of React so they are easy to follow and test.

export const SPEEDS = {
  slow: { label: 'Slow', hint: 'Relaxed', start: 180, min: 100 },
  normal: { label: 'Normal', hint: 'Classic', start: 140, min: 70 },
  fast: { label: 'Fast', hint: 'Quick reflexes', start: 100, min: 55 },
}
export const SIZES = { small: { label: 'Small', n: 12 }, medium: { label: 'Medium', n: 18 }, large: { label: 'Large', n: 24 } }
export const WALLS = { solid: { label: 'Solid walls', hint: 'Edges are deadly' }, wrap: { label: 'Wrap around', hint: 'Cross to the other side' } }
export const DEFAULTS = { speed: 'normal', size: 'medium', walls: 'solid' }
export const COLORS = { head: '#16a34a', body: '#4ade80' }

export const BONUS_EVERY = 5 // apples between stars
export const BONUS_POINTS = 3
const BONUS_TICKS = 45

/** The original settings keep the original storage key, so earlier best scores carry over. */
export function bestKey({ speed, size, walls }) {
  return speed === 'normal' && size === 'medium' && walls === 'solid' ? 'best' : `best-${speed}-${size}-${walls}`
}

export const tickMs = ({ speed }, eaten) => Math.max(SPEEDS[speed].min, SPEEDS[speed].start - eaten * 3)

const same = (a, b) => Boolean(a && b) && a.x === b.x && a.y === b.y

/** A random empty cell, or null when the board is full. */
function freeCell(n, taken, random) {
  const used = new Set(taken.filter(Boolean).map((c) => c.y * n + c.x))
  const free = []
  for (let i = 0; i < n * n; i++) if (!used.has(i)) free.push(i)
  if (!free.length) return null
  const i = free[Math.floor(random() * free.length)]
  return { x: i % n, y: Math.floor(i / n) }
}

export function newGame({ size }, random = Math.random) {
  const { n } = SIZES[size]
  const mid = Math.floor(n / 2)
  const head = Math.floor(n / 2)
  const snake = [0, 1, 2].map((i) => ({ x: head - i, y: mid }))
  return { n, snake, dir: [1, 0], turns: [], food: freeCell(n, snake, random), bonus: null, score: 0, eaten: 0, won: false, dead: false }
}

/** Queues a turn. Two can wait, so quick corner moves are not lost. Reversing is ignored. */
export function queueTurn(game, d) {
  const last = game.turns.at(-1) ?? game.dir
  const useless = (d[0] === last[0] && d[1] === last[1]) || (d[0] === -last[0] && d[1] === -last[1])
  return useless || game.turns.length >= 2 ? game : { ...game, turns: [...game.turns, d] }
}

/** Advances one tick. */
export function step(game, options, random = Math.random) {
  const { n, snake, food } = game
  const [dir = game.dir, ...turns] = game.turns
  let x = snake[0].x + dir[0]
  let y = snake[0].y + dir[1]
  if (options.walls === 'wrap') {
    x = (x + n) % n
    y = (y + n) % n
  }
  const head = { x, y }
  const ate = same(head, food)
  // The tail moves out of the way unless the snake grows this tick.
  const body = ate ? snake : snake.slice(0, -1)
  if (x < 0 || y < 0 || x >= n || y >= n || body.some((c) => same(c, head))) return { ...game, dir, turns, dead: true }

  const next = { ...game, dir, turns, snake: [head, ...body] }
  if (game.bonus) {
    if (same(head, game.bonus)) {
      next.score += BONUS_POINTS
      next.bonus = null
    } else {
      next.bonus = game.bonus.left > 1 ? { ...game.bonus, left: game.bonus.left - 1 } : null
    }
  }
  if (ate) {
    next.score += 1
    next.eaten += 1
    next.food = freeCell(n, [...next.snake, next.bonus], random)
    if (!next.bonus && next.eaten % BONUS_EVERY === 0) {
      const cell = freeCell(n, [...next.snake, next.food], random)
      // Larger boards give more time to cross.
      const left = Math.max(BONUS_TICKS, n * 3)
      next.bonus = cell && { ...cell, left, total: left }
    }
    next.won = !next.food && !next.bonus
  }
  // The last free cell can be taken by a star; bring the apple back once there is room.
  if (!next.food && !next.won) next.food = freeCell(n, [...next.snake, next.bonus], random)
  return next
}
