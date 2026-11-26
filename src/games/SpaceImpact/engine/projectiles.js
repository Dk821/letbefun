import { createPool } from './pool.js'
import { WORLD_H } from '../data/constants.js'
import { burst } from './particles.js'
import { glow } from './sprites.js'

const SHOT = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, ay: 0, r: 4, damage: 10, color: '#22d3ee', kind: 'laser', fuse: 0 }

export const createShots = (size) => createPool(size, SHOT)

const ENEMY_COLORS = { orb: '#f472b6', plasma: '#fb7185', bomb: '#fbbf24', shard: '#fde047' }

export function enemyShot(g, x, y, vx, vy, { kind = 'orb', r = 5, damage = 20, ay = 0, fuse = 0 } = {}) {
  return g.enemyShots.spawn({ x, y, px: x, py: y, vx, vy, ay, r, kind, fuse, damage: damage * g.diff.damage, color: ENEMY_COLORS[kind] })
}

/** Fires `speed` pixels per second towards the player. */
export function aimedShot(g, x, y, speed, opts, offset = 0) {
  const a = Math.atan2(g.player.y - y, g.player.x - x) + offset
  return enemyShot(g, x, y, Math.cos(a) * speed, Math.sin(a) * speed, opts)
}

function detonate(g, b) {
  b.active = false
  burst(g, b.x, b.y, b.color, 8, 140)
  g.emit('pop')
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    enemyShot(g, b.x, b.y, Math.cos(a) * 170, Math.sin(a) * 170, { kind: 'shard', r: 4, damage: 15 })
  }
}

export function updateShots(g, pool, dt) {
  for (const b of pool.items) {
    if (!b.active) continue
    b.px = b.x
    b.py = b.y
    b.vy += b.ay * dt
    b.x += b.vx * dt
    b.y += b.vy * dt
    if (b.fuse > 0) {
      b.fuse -= dt
      if (b.fuse <= 0) {
        detonate(g, b)
        continue
      }
    }
    if (b.x < -30 || b.x > g.w + 30 || b.y < -30 || b.y > WORLD_H + 30) b.active = false
  }
}

export function drawShots(ctx, g) {
  ctx.globalCompositeOperation = 'lighter'
  for (const b of g.playerShots.items) {
    if (!b.active) continue
    ctx.save()
    ctx.translate(b.x, b.y)
    ctx.rotate(Math.atan2(b.vy, b.vx))
    ctx.scale(3.2, 0.8)
    glow(ctx, b.color, 0, 0, 7)
    ctx.restore()
  }
  for (const b of g.enemyShots.items) {
    if (!b.active) continue
    const pulse = b.kind === 'bomb' || b.kind === 'plasma' ? 1 + Math.sin(g.clock * 18) * 0.18 : 1
    glow(ctx, b.color, b.x, b.y, b.r * 2.2 * pulse)
  }
  ctx.globalCompositeOperation = 'source-over'
}
