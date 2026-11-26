import { PLAYER } from '../data/constants.js'
import { WEAPONS } from '../data/weapons.js'
import { circlesHit } from './collision.js'
import { burst, popup } from './particles.js'
import { compact, rand } from './pool.js'
import { dot, glow, polygon, sprite } from './sprites.js'

export const POWERUPS = {
  health: { label: '+HEALTH', color: '#4ade80', weight: 3 },
  weapon: { label: 'WEAPON UP', color: '#c084fc', weight: 3 },
  shield: { label: 'SHIELD', color: '#38bdf8', weight: 2 },
  rapid: { label: 'RAPID FIRE', color: '#facc15', weight: 2 },
  multi: { label: 'SCORE ×2', color: '#fb7185', weight: 2 },
}
export const DURATIONS = { shield: 7, rapid: 8, multi: 10 }
const PICKUP_R = 15

function pickType() {
  const entries = Object.entries(POWERUPS)
  let n = rand(0, entries.reduce((s, [, p]) => s + p.weight, 0))
  for (const [type, p] of entries) {
    n -= p.weight
    if (n <= 0) return type
  }
  return 'health'
}

export function dropPowerup(g, x, y, type = pickType()) {
  g.powerups.push({ x, y, baseY: y, type, t: rand(0, 6) })
}

export function applyPowerup(g, type) {
  const p = g.player
  // Survival scores time only, so maxed pickups give no bonus there.
  const bonus = () => g.mode !== 'survival' && g.addScore(250, p.x, p.y - 40)
  if (type === 'health') {
    if (p.hp >= PLAYER.maxHp) bonus()
    p.hp = Math.min(PLAYER.maxHp, p.hp + 40)
  } else if (type === 'weapon') {
    if (p.weapon >= WEAPONS.length - 1) bonus()
    else p.weapon++
  } else {
    p[type] = DURATIONS[type]
  }
  popup(g, p.x + 20, p.y - 24, POWERUPS[type].label, POWERUPS[type].color)
  burst(g, p.x, p.y, POWERUPS[type].color, 14, 160)
  g.emit('powerup')
}

export function updatePowerups(g, dt) {
  const p = g.player
  for (const u of g.powerups) {
    u.t += dt
    u.x -= 85 * dt
    u.y = u.baseY + Math.sin(u.t * 3) * 14
    if (p.alive && circlesHit(u.x, u.y, PICKUP_R, p.x, p.y, PLAYER.r + 6)) {
      u.dead = true
      applyPowerup(g, u.type)
    } else if (u.x < -30) u.dead = true
  }
  compact(g.powerups)
}

// One distinct icon per power-up.
const ICONS = {
  health: (c) => {
    c.fillRect(-2.5, -8, 5, 16)
    c.fillRect(-8, -2.5, 16, 5)
  },
  weapon: (c) => {
    polygon(c, [[0, -9], [8, -1], [3, -1], [0, -4], [-3, -1], [-8, -1]], '#fff')
    polygon(c, [[0, 0], [8, 8], [3, 8], [0, 5], [-3, 8], [-8, 8]], '#fff')
  },
  shield: (c) => polygon(c, [[0, -9], [8, -5], [6, 4], [0, 9], [-6, 4], [-8, -5]], '#fff'),
  rapid: (c) => polygon(c, [[2, -10], [-7, 2], [-1, 2], [-3, 10], [7, -3], [1, -3]], '#fff'),
  multi: (c) => {
    c.font = '900 13px sans-serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillText('×2', 0, 1)
  },
}

export function drawPowerups(ctx, g) {
  for (const u of g.powerups) {
    const { color } = POWERUPS[u.type]
    ctx.globalAlpha = 0.55 + Math.sin(u.t * 6) * 0.2
    glow(ctx, color, u.x, u.y, 28)
    ctx.globalAlpha = 1
    sprite(ctx, `power:${u.type}`, 44, 44, (c) => {
      dot(c, 0, 0, PICKUP_R, '#0b1026', 0)
      c.strokeStyle = color
      c.lineWidth = 2.5
      c.shadowColor = color
      c.shadowBlur = 10
      c.beginPath()
      c.arc(0, 0, PICKUP_R, 0, Math.PI * 2)
      c.stroke()
      c.shadowBlur = 0
      c.fillStyle = '#fff'
      ICONS[u.type](c)
    }, u.x, u.y)
  }
}
