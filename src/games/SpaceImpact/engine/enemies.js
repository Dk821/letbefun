import { WORLD_H } from '../data/constants.js'
import { ENEMY_TYPES } from '../data/enemyTypes.js'
import { explode, burst } from './particles.js'
import { clamp, compact, rand } from './pool.js'
import { aimedShot, enemyShot } from './projectiles.js'
import { dropPowerup } from './powerups.js'
import { dot, hull, sprite } from './sprites.js'

export function spawnEnemy(g, type, y, xOffset = 0) {
  const def = ENEMY_TYPES[type]
  // Bombers patrol the top or bottom lane and drop bombs towards the middle.
  const lane = Math.random() < 0.5 ? rand(40, 110) : rand(WORLD_H - 110, WORLD_H - 40)
  const baseY = type === 'bomber' ? lane : (y ?? rand(def.r + 14, WORLD_H - def.r - 14))
  const hp = def.hp * g.diff.hp * (1 + (g.ramp - 1) * 0.4)
  const e = {
    type, x: g.w + def.r + xOffset, y: baseY, baseY, r: def.r, hp, flash: 0, t: rand(0, 6),
    speed: def.speed * g.diff.speed * (1 + (g.ramp - 1) * 0.3) * rand(0.9, 1.1),
    cooldown: rand(0.5, 1.4),
  }
  g.enemies.push(e)
  return e
}

export function pickEnemyType(wave) {
  const open = Object.entries(ENEMY_TYPES).filter(([, d]) => wave >= d.from)
  let n = rand(0, open.reduce((s, [, d]) => s + d.weight, 0))
  for (const [type, d] of open) {
    n -= d.weight
    if (n <= 0) return type
  }
  return 'basic'
}

export function damageEnemy(g, e, amount) {
  if (e.dead) return
  e.hp -= amount
  e.flash = 0.08
  if (e.hp > 0) {
    burst(g, e.x, e.y, '#e0f2fe', 3, 100, 3)
    g.emit('hit')
    return
  }
  const def = ENEMY_TYPES[e.type]
  e.dead = true
  g.kills++
  explode(g, e.x, e.y, def.color, e.r / 18)
  g.addScore(g.mode === 'survival' ? 0 : def.score, e.x, e.y)
  g.shake(e.type === 'heavy' ? 0.25 : 0.08)
  g.emit('explosion')
  if (Math.random() < def.drop) dropPowerup(g, e.x, e.y)
}

function attack(g, e, def) {
  const { shot } = def
  if (shot.kind === 'bomb') {
    const dir = e.y < WORLD_H / 2 ? 1 : -1
    enemyShot(g, e.x, e.y + dir * e.r, -rand(60, 160), dir * shot.speed, { ...shot, ay: dir * 90, fuse: rand(1.5, 2.2) })
  } else if (e.type === 'heavy') {
    aimedShot(g, e.x - e.r, e.y, shot.speed * g.diff.speed, shot)
  } else {
    enemyShot(g, e.x - e.r, e.y, -shot.speed * g.diff.speed, 0, shot)
  }
}

export function updateEnemies(g, dt) {
  for (const e of g.enemies) {
    if (e.dead) continue
    const def = ENEMY_TYPES[e.type]
    e.t += dt
    e.flash = Math.max(0, e.flash - dt)
    e.x -= e.speed * dt
    if (e.type === 'fast') e.y = clamp(e.baseY + Math.sin(e.t * 4.5) * 65, e.r, WORLD_H - e.r)
    else if (e.type === 'basic') e.y = e.baseY + Math.sin(e.t * 1.8) * 22
    else if (e.type === 'heavy' && g.player.alive) e.y += clamp(g.player.y - e.y, -30, 30) * dt

    if (def.shot) {
      e.cooldown -= dt
      // Only fire while on screen and still ahead of the player.
      if (e.cooldown <= 0 && e.x < g.w - 20 && (def.shot.kind === 'bomb' || e.x > g.player.x + 90)) {
        e.cooldown = (def.fire * rand(0.8, 1.25)) / (g.diff.fire * (1 + (g.ramp - 1) * 0.35))
        attack(g, e, def)
      }
    }
    if (e.x < -e.r - 40) e.dead = true
  }
  compact(g.enemies)
}

// All enemy ships face left.
const ART = {
  basic: (c) => {
    hull(c, [[-20, 0], [-6, -7], [4, -17], [16, -15], [10, -5], [18, 0], [10, 5], [16, 15], [4, 17], [-6, 7]], '#c084fc', '#3b0764', '#d8b4fe')
    dot(c, -5, 0, 4, '#f0abfc')
  },
  fast: (c) => {
    hull(c, [[-19, 0], [14, -12], [6, -3], [13, 0], [6, 3], [14, 12]], '#67e8f9', '#0e7490', '#a5f3fc')
    dot(c, -3, 0, 2.5, '#fff')
  },
  heavy: (c) => {
    hull(c, [[-32, -6], [-18, -22], [4, -22], [12, -30], [30, -24], [24, -10], [32, 0], [24, 10], [30, 24], [12, 30], [4, 22], [-18, 22], [-32, 6], [-22, 0]], '#fb7185', '#4c0519', '#fda4af', 12)
    hull(c, [[-14, -10], [10, -12], [18, 0], [10, 12], [-14, 10]], '#9f1239', '#27020c', '#fb7185', 4)
    dot(c, 0, 0, 6, '#fecdd3')
  },
  bomber: (c) => {
    hull(c, [[-26, 0], [-14, -12], [0, -14], [10, -24], [22, -20], [18, -8], [26, 0], [18, 8], [22, 20], [10, 24], [0, 14], [-14, 12]], '#fcd34d', '#78350f', '#fde68a')
    dot(c, -10, 0, 4, '#fff7ed')
    dot(c, 6, -8, 3, '#ef4444')
    dot(c, 6, 8, 3, '#ef4444')
  },
}

export function drawEnemies(ctx, g) {
  for (const e of g.enemies) {
    const size = e.r * 2 + 30
    ctx.save()
    ctx.translate(e.x, e.y)
    ctx.rotate(Math.sin(e.t * 3) * 0.06)
    sprite(ctx, `enemy:${e.type}`, size, size, ART[e.type], 0, 0)
    if (e.flash > 0) {
      ctx.globalCompositeOperation = 'lighter'
      sprite(ctx, `enemy:${e.type}`, size, size, ART[e.type], 0, 0)
      sprite(ctx, `enemy:${e.type}`, size, size, ART[e.type], 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
    if (e.type === 'heavy') {
      const max = ENEMY_TYPES.heavy.hp * g.diff.hp * (1 + (g.ramp - 1) * 0.4)
      ctx.fillStyle = 'rgba(255,255,255,.18)'
      ctx.fillRect(e.x - 24, e.y - e.r - 12, 48, 4)
      ctx.fillStyle = '#fb7185'
      ctx.fillRect(e.x - 24, e.y - e.r - 12, 48 * Math.min(1, e.hp / max), 4)
    }
  }
}
