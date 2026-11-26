import { PLAYER, WORLD_H } from '../data/constants.js'
import { PLAYER_SHOT_SPEED, RAPID_BOOST, WEAPONS } from '../data/weapons.js'
import { burst, explode, ring } from './particles.js'
import { clamp, rand } from './pool.js'
import { dot, glow, hull, sprite } from './sprites.js'

export const createPlayer = ({ lives = 3, weapon = 0 } = {}) => ({
  x: 90, y: WORLD_H / 2, vx: 0, vy: 0,
  hp: PLAYER.maxHp, lives, weapon,
  alive: true, respawn: 0, invincible: PLAYER.spawnInvincible, flash: 0,
  cooldown: 0, barrel: 1,
  shield: 0, rapid: 0, multi: 0,
})

function shoot(g) {
  const p = g.player
  const w = WEAPONS[p.weapon]
  p.cooldown = w.cooldown * (p.rapid > 0 ? RAPID_BOOST : 1)
  if (w.alternate) p.barrel *= -1
  for (const s of w.shots) {
    const x = p.x + 24
    const y = p.y + s.dy + (w.alternate ? w.alternate * p.barrel : 0)
    g.playerShots.spawn({
      x, y, px: x, py: y, r: 4, damage: s.damage, color: w.color,
      vx: Math.cos(s.angle) * PLAYER_SHOT_SPEED, vy: Math.sin(s.angle) * PLAYER_SHOT_SPEED,
    })
  }
  g.emit('laser')
}

export function updatePlayer(g, dt) {
  const p = g.player
  if (!p.alive) {
    if (p.lives <= 0) return
    p.respawn -= dt
    if (p.respawn <= 0) {
      Object.assign(p, { alive: true, hp: PLAYER.maxHp, x: 90, y: WORLD_H / 2, invincible: PLAYER.spawnInvincible, cooldown: 0 })
      ring(g, p.x, p.y, '#22d3ee', 60)
    }
    return
  }
  for (const key of ['invincible', 'flash', 'cooldown', 'shield', 'rapid', 'multi']) p[key] = Math.max(0, p[key] - dt)

  const i = g.input
  let dx = (i.right ? 1 : 0) - (i.left ? 1 : 0) + i.ax
  let dy = (i.down ? 1 : 0) - (i.up ? 1 : 0) + i.ay
  const len = Math.hypot(dx, dy)
  if (len > 1) {
    dx /= len
    dy /= len
  }
  const ease = Math.min(1, dt * 18)
  p.vx += (dx * PLAYER.speed - p.vx) * ease
  p.vy += (dy * PLAYER.speed - p.vy) * ease
  p.x = clamp(p.x + p.vx * dt, 28, g.w - 40)
  p.y = clamp(p.y + p.vy * dt, 20, WORLD_H - 20)

  if (Math.random() < dt * 40) {
    g.particles.spawn({ x: p.x - 26, y: p.y + rand(-3, 3), vx: rand(-220, -140), vy: rand(-12, 12), life: 0.28, max: 0.28, size: 4, color: '#22d3ee' })
  }
  if ((i.fire || i.touchFire) && p.cooldown <= 0) shoot(g)
}

/** Applies damage unless the ship is shielded or still invincible. Returns true if it hurt. */
export function damagePlayer(g, amount) {
  const p = g.player
  if (!p.alive || p.invincible > 0 || p.shield > 0 || g.ending) return false
  p.hp -= amount
  p.flash = 0.35
  g.shake(0.3)
  burst(g, p.x, p.y, '#f87171', 12, 180)
  if (p.hp > 0) {
    p.invincible = PLAYER.hitInvincible
    g.emit('damage')
    return true
  }
  p.hp = 0
  p.alive = false
  p.lives--
  p.respawn = PLAYER.respawnDelay
  p.weapon = Math.max(g.baseWeapon, p.weapon - 1)
  p.shield = p.rapid = p.multi = 0
  g.enemyShots.clear()
  explode(g, p.x, p.y, '#22d3ee', 2.4)
  g.shake(0.6)
  g.emit('explosion')
  return true
}

function paintShip(g) {
  hull(g, [[26, 0], [8, -6], [-4, -8], [-18, -19], [-14, -6], [-22, -5], [-22, 5], [-14, 6], [-18, 19], [-4, 8], [8, 6]], '#7dd3fc', '#1e3a8a', '#22d3ee')
  hull(g, [[16, 0], [4, -4], [-6, 0], [4, 4]], '#ecfeff', '#38bdf8', '#a5f3fc', 6)
  dot(g, -13, -15, 2, '#a855f7')
  dot(g, -13, 15, 2, '#a855f7')
}

export function drawPlayer(ctx, g) {
  const p = g.player
  if (!p.alive) return
  ctx.globalCompositeOperation = 'lighter'
  glow(ctx, '#3b82f6', p.x - 25, p.y, 12 + Math.sin(g.clock * 40) * 3)
  ctx.globalCompositeOperation = 'source-over'
  // Blink while invincible.
  ctx.globalAlpha = p.invincible > 0 && Math.sin(g.clock * 32) < 0 ? 0.35 : 1
  sprite(ctx, 'player', 70, 60, paintShip, p.x, p.y)
  ctx.globalAlpha = 1
  if (p.flash > 0) {
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = p.flash * 2
    glow(ctx, '#ef4444', p.x, p.y, 40)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
  // The shield blinks during its last two seconds.
  if (p.shield > 0 && (p.shield > 2 || Math.sin(g.clock * 20) > 0)) {
    ctx.strokeStyle = '#7dd3fc'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, 33 + Math.sin(g.clock * 8) * 1.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(56,189,248,.12)'
    ctx.fill()
  }
}
