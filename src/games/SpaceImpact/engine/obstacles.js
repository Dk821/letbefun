// Asteroids, tumbling debris, homing mines and energy gates.
import { PLAYER, WORLD_H } from '../data/constants.js'
import { circleRectHit, circlesHit } from './collision.js'
import { burst, explode } from './particles.js'
import { clamp, compact, rand } from './pool.js'
import { damagePlayer } from './player.js'
import { dropPowerup } from './powerups.js'
import { dot, glow, hull, polygon, sprite } from './sprites.js'

const GATE_W = 16
export const GATE_GAP = 190
const STATS = {
  asteroid: { damage: 30, score: 50 },
  debris: { damage: 22, score: 40 },
  mine: { damage: 35, score: 80 },
  gate: { damage: 30, score: 0 },
}

export function spawnObstacle(g, kind, props = {}) {
  const speed = g.diff.speed
  const o = { kind, x: g.w + 60, y: rand(50, WORLD_H - 50), vx: 0, vy: 0, angle: rand(0, 6), spin: rand(-1.5, 1.5), hp: 1, r: 20, shape: Math.floor(rand(0, 3)) }
  if (kind === 'asteroid') {
    o.r = rand(18, 40)
    o.vx = -rand(80, 160) * speed
    o.vy = rand(-30, 30)
    o.hp = o.r * 1.6 * g.diff.hp
  } else if (kind === 'debris') {
    o.r = 14
    o.vx = -rand(160, 240) * speed
    o.vy = rand(-45, 45)
    o.spin = rand(-5, 5)
    o.hp = 22 * g.diff.hp
  } else if (kind === 'mine') {
    o.r = 15
    o.vx = -95 * speed
    o.hp = 18 * g.diff.hp
    o.spin = 0.8
  } else if (kind === 'gate') {
    o.x = g.w + 20
    o.y = rand(GATE_GAP / 2 + 30, WORLD_H - GATE_GAP / 2 - 30) // centre of the gap
    o.vx = -125 * speed
  }
  Object.assign(o, props)
  g.obstacles.push(o)
  return o
}

/** The two solid parts of a gate as [x, y, width, height]. */
export const gateRects = (o) => [
  [o.x - GATE_W / 2, 0, GATE_W, o.y - GATE_GAP / 2],
  [o.x - GATE_W / 2, o.y + GATE_GAP / 2, GATE_W, WORLD_H - o.y - GATE_GAP / 2],
]

export function damageObstacle(g, o, amount) {
  if (o.dead || o.kind === 'gate') return
  o.hp -= amount
  if (o.hp > 0) {
    burst(g, o.x, o.y, '#cbd5e1', 3, 90, 3)
    g.emit('hit')
    return
  }
  destroyObstacle(g, o)
  g.addScore(g.mode === 'survival' ? 0 : STATS[o.kind].score, o.x, o.y)
  if (Math.random() < 0.06) dropPowerup(g, o.x, o.y)
}

function destroyObstacle(g, o) {
  o.dead = true
  explode(g, o.x, o.y, o.kind === 'mine' ? '#f87171' : '#94a3b8', o.r / 22)
  g.emit('explosion')
  // Large asteroids break into two smaller ones.
  if (o.kind === 'asteroid' && o.r > 28) {
    for (const dir of [-1, 1]) {
      spawnObstacle(g, 'asteroid', { x: o.x, y: o.y + dir * 14, r: o.r * 0.55, vx: o.vx * 1.1, vy: dir * rand(50, 100), hp: o.r * 0.7 })
    }
  }
}

export function updateObstacles(g, dt) {
  const p = g.player
  for (const o of g.obstacles) {
    if (o.dead) continue
    o.x += o.vx * dt
    o.y += o.vy * dt
    o.angle += o.spin * dt
    if (o.kind === 'mine' && p.alive) o.y += clamp(p.y - o.y, -45, 45) * dt
    if (o.kind === 'gate') {
      if (p.alive && gateRects(o).some((r) => circleRectHit(p.x, p.y, PLAYER.r, ...r))) damagePlayer(g, STATS.gate.damage * g.diff.damage)
    } else {
      if ((o.y < o.r && o.vy < 0) || (o.y > WORLD_H - o.r && o.vy > 0)) o.vy *= -1
      if (p.alive && circlesHit(o.x, o.y, o.r * 0.85, p.x, p.y, p.shield > 0 ? 32 : PLAYER.r)) {
        if (p.shield > 0 || damagePlayer(g, STATS[o.kind].damage * g.diff.damage)) destroyObstacle(g, o)
      }
    }
    if (o.x < -80) o.dead = true
  }
  compact(g.obstacles)
}

const rock = (r, shape) => Array.from({ length: 11 }, (_, i) => {
  const a = (i / 11) * Math.PI * 2
  const k = 0.82 + 0.22 * Math.abs(Math.sin(i * (2.3 + shape) + shape))
  return [Math.cos(a) * r * k, Math.sin(a) * r * k]
})

const ART = {
  asteroid: (c, shape) => {
    hull(c, rock(40, shape), '#78716c', '#1c1917', '#a8a29e', 6)
    for (const [x, y, r] of [[-12, -8, 8], [14, 6, 6], [-2, 18, 4]]) dot(c, x, y + shape * 2, r, 'rgba(0,0,0,.35)', 0)
  },
  debris: (c, shape) => {
    hull(c, [[-16, -6], [-4, -14 + shape * 3], [4, -4], [16, -8], [10, 8], [-2, 5], [-10, 13]], '#94a3b8', '#1e293b', '#cbd5e1', 6)
    polygon(c, [[-8, -4], [2, -2], [-4, 5]], '#f59e0b')
  },
  mine: (c) => {
    for (let i = 0; i < 8; i++) {
      c.rotate(Math.PI / 4)
      polygon(c, [[10, -3], [20, 0], [10, 3]], '#fca5a5')
    }
    dot(c, 0, 0, 12, '#450a0a', 10)
    dot(c, 0, 0, 5, '#ef4444', 12)
  },
}

export function drawObstacles(ctx, g) {
  for (const o of g.obstacles) {
    if (o.kind === 'gate') {
      for (const [x, y, w, h] of gateRects(o)) {
        ctx.fillStyle = 'rgba(244,63,94,.28)'
        ctx.fillRect(x, y, w, h)
        ctx.fillStyle = Math.sin(g.clock * 24) > 0 ? '#fecdd3' : '#fb7185'
        ctx.fillRect(x + w / 2 - 2, y, 4, h)
      }
      for (const y of [o.y - GATE_GAP / 2, o.y + GATE_GAP / 2]) {
        glow(ctx, '#f43f5e', o.x, y, 20)
        ctx.fillStyle = '#334155'
        ctx.fillRect(o.x - 14, y - 5, 28, 10)
      }
      continue
    }
    ctx.save()
    ctx.translate(o.x, o.y)
    ctx.rotate(o.angle)
    if (o.kind === 'asteroid') {
      ctx.scale(o.r / 40, o.r / 40)
      sprite(ctx, `asteroid:${o.shape}`, 100, 100, (c) => ART.asteroid(c, o.shape), 0, 0)
    } else if (o.kind === 'debris') sprite(ctx, `debris:${o.shape}`, 52, 52, (c) => ART.debris(c, o.shape), 0, 0)
    else sprite(ctx, 'mine', 56, 56, ART.mine, 0, 0)
    ctx.restore()
  }
}
