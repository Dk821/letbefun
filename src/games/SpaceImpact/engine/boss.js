import { PLAYER, WORLD_H } from '../data/constants.js'
import { BOSS_BASE, BOSS_TYPES } from '../data/enemyTypes.js'
import { circleRectHit, circlesHit } from './collision.js'
import { burst, explode, popup } from './particles.js'
import { clamp, rand } from './pool.js'
import { damagePlayer } from './player.js'
import { dropPowerup } from './powerups.js'
import { aimedShot, enemyShot } from './projectiles.js'
import { dot, glow, hull, sprite } from './sprites.js'

const BEAM_WARN = 1.1
const BEAM_LIVE = 0.8
const BEAM_H = 46

export function spawnBoss(g, tier) {
  const def = BOSS_TYPES[tier % BOSS_TYPES.length]
  const hp = BOSS_BASE.hp * (1 + tier * BOSS_BASE.hpPerTier) * g.diff.boss
  g.boss = {
    ...def, tier, hp, maxHp: hp, r: BOSS_BASE.r, x: g.w + 100, y: WORLD_H / 2, t: 0, flash: 0,
    entering: true, step: 0, cooldown: 1.2, volley: 0, volleyTimer: 0, attack: null, beam: 0, charge: null,
  }
  popup(g, g.w / 2, 90, `${def.name.toUpperCase()} APPROACHES`, '#fda4af')
  g.emit('boss')
  return g.boss
}

const homeX = (g) => g.w - 110
/** Later bosses and harder difficulties attack more often; a wounded boss is angrier. */
const tempo = (g, b) => (0.75 + g.diff.boss * 0.25) * (1 + b.tier * 0.12) * (b.hp < b.maxHp / 2 ? 1.3 : 1)

export function damageBoss(g, amount) {
  const b = g.boss
  if (!b || b.entering) return
  b.hp -= amount
  b.flash = 0.06
  g.emit('hit')
  if (b.hp > 0) return
  for (let i = 0; i < 5; i++) explode(g, b.x + rand(-50, 50), b.y + rand(-50, 50), b.color, 1.8)
  g.boss = null
  g.bossKills++
  g.kills++
  g.enemyShots.clear()
  g.addScore(g.mode === 'survival' ? 0 : BOSS_BASE.score * (1 + b.tier * 0.5), b.x, b.y)
  dropPowerup(g, b.x, b.y - 30, 'weapon')
  dropPowerup(g, b.x, b.y + 30, 'health')
  g.shake(0.9)
  g.emit('explosion')
  g.onBossDefeated()
}

const SHOT = { kind: 'orb', r: 6, damage: BOSS_BASE.damage }

const ATTACKS = {
  // Three quick shots at the player.
  aimed: (g, b) => {
    b.volley = 3 + Math.min(b.tier, 3)
    b.volleyTimer = 0
  },
  fan: (g, b) => {
    const n = 5 + Math.min(b.tier, 4)
    for (let i = 0; i < n; i++) aimedShot(g, b.x - b.r, b.y, 250 * g.diff.speed, SHOT, (i - (n - 1) / 2) * 0.2)
  },
  ring: (g, b) => {
    const n = 14 + Math.min(b.tier, 4) * 2
    const turn = rand(0, 1)
    for (let i = 0; i < n; i++) {
      const a = ((i + turn) / n) * Math.PI * 2
      enemyShot(g, b.x, b.y, Math.cos(a) * 190 * g.diff.speed, Math.sin(a) * 190 * g.diff.speed, SHOT)
    }
  },
  beam: (g, b) => {
    b.beam = BEAM_WARN + BEAM_LIVE
  },
  charge: (g, b) => {
    b.charge = { stage: 'warn', t: 0.7 }
  },
}

function updateCharge(g, b, dt) {
  const c = b.charge
  if (c.stage === 'warn') {
    c.t -= dt
    b.x = homeX(g) + rand(-4, 4)
    if (c.t <= 0) c.stage = 'dash'
  } else if (c.stage === 'dash') {
    b.x -= 620 * dt
    if (b.x <= Math.max(150, g.w * 0.28)) c.stage = 'return'
  } else {
    b.x += 300 * dt
    if (b.x >= homeX(g)) {
      b.x = homeX(g)
      b.charge = null
    }
  }
}

export function updateBoss(g, dt) {
  const b = g.boss
  if (!b) return
  b.t += dt
  b.flash = Math.max(0, b.flash - dt)
  if (b.entering) {
    b.x -= 140 * dt
    if (b.x <= homeX(g)) {
      b.x = homeX(g)
      b.entering = false
    }
    return
  }
  const speed = tempo(g, b)

  if (b.charge) updateCharge(g, b, dt)
  else {
    b.x = homeX(g)
    if (b.beam <= 0) {
      // Each boss type moves differently: slow sweep, figure-of-eight weave, or hunting.
      const kind = b.tier % BOSS_TYPES.length
      const target = kind === 2 && g.player.alive ? g.player.y : WORLD_H / 2 + Math.sin(b.t * (kind ? 1.5 : 0.8)) * (WORLD_H / 2 - 90)
      b.y += clamp(target - b.y, -130 * speed * dt, 130 * speed * dt)
      if (kind === 1) b.x = homeX(g) + Math.sin(b.t * 3) * 35
    }
  }

  if (b.volley > 0) {
    b.volleyTimer -= dt
    if (b.volleyTimer <= 0) {
      b.volley--
      b.volleyTimer = 0.18
      aimedShot(g, b.x - b.r, b.y, 340 * g.diff.speed, SHOT)
    }
  }

  if (b.beam > 0) {
    b.beam -= dt
    const p = g.player
    if (b.beam <= BEAM_LIVE && b.beam > 0 && p.alive && circleRectHit(p.x, p.y, PLAYER.r, 0, b.y - BEAM_H / 2, b.x - b.r, BEAM_H)) {
      damagePlayer(g, 35 * g.diff.damage)
    }
  } else if (!b.charge && b.volley <= 0) {
    b.cooldown -= dt * speed
    if (b.cooldown <= 0) {
      b.attack = b.patterns[b.step++ % b.patterns.length]
      b.cooldown = 1.5
      ATTACKS[b.attack](g, b)
    }
  }

  const p = g.player
  if (p.alive && circlesHit(b.x, b.y, b.r * 0.82, p.x, p.y, PLAYER.r)) damagePlayer(g, 40 * g.diff.damage)
  if (b.flash > 0 && Math.random() < 0.3) burst(g, b.x - b.r * 0.6, b.y + rand(-30, 30), '#ffffff', 2, 90, 3)
}

function paintBoss(c, color) {
  hull(c, [[-64, 0], [-44, -16], [-20, -22], [-6, -50], [28, -66], [22, -38], [54, -44], [40, -16], [62, -8], [62, 8], [40, 16], [54, 44], [22, 38], [28, 66], [-6, 50], [-20, 22], [-44, 16]], '#334155', '#0b1026', color, 18)
  hull(c, [[-40, 0], [-14, -16], [22, -22], [40, 0], [22, 22], [-14, 16]], color, '#1e1b4b', color, 8)
  for (const y of [-44, 44]) dot(c, 10, y, 5, color, 14)
  dot(c, -46, 0, 5, '#fff', 12)
}

export function drawBoss(ctx, g) {
  const b = g.boss
  if (!b) return
  if (b.beam > 0) {
    const live = b.beam <= BEAM_LIVE
    const width = b.x - b.r
    if (live) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = `${b.color}99`
      ctx.fillRect(0, b.y - BEAM_H / 2, width, BEAM_H)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, b.y - 7, width, 14)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      // Warning band before the beam fires.
      ctx.fillStyle = `rgba(248,113,113,${0.12 + Math.abs(Math.sin(g.clock * 14)) * 0.18})`
      ctx.fillRect(0, b.y - BEAM_H / 2, width, BEAM_H)
    }
  }
  const pulse = b.charge?.stage === 'warn' ? 1.6 : 1
  ctx.globalCompositeOperation = 'lighter'
  glow(ctx, b.color, b.x - 8, b.y, (26 + Math.sin(g.clock * 6) * 5) * pulse)
  ctx.globalCompositeOperation = 'source-over'
  const art = (c) => paintBoss(c, b.color)
  sprite(ctx, `boss:${b.color}`, 180, 180, art, b.x, b.y)
  if (b.flash > 0) {
    ctx.globalCompositeOperation = 'lighter'
    sprite(ctx, `boss:${b.color}`, 180, 180, art, b.x, b.y)
    ctx.globalCompositeOperation = 'source-over'
  }
  ctx.globalCompositeOperation = 'lighter'
  glow(ctx, '#ffffff', b.x - 16, b.y, 10)
  ctx.globalCompositeOperation = 'source-over'
}
