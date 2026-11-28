import { SHIELD_Y, WORLD_H, WORLD_W } from '../data/constants.js'

const MAX = 240
const glows = new Map()

/** Pre-rendered soft dot. Far cheaper than shadowBlur on phones. */
export function glowSprite(color) {
  let sprite = glows.get(color)
  if (!sprite) {
    sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const c = sprite.getContext('2d')
    const gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, color)
    gradient.addColorStop(0.35, `${color}88`)
    gradient.addColorStop(1, `${color}00`)
    c.fillStyle = gradient
    c.fillRect(0, 0, 64, 64)
    glows.set(color, sprite)
  }
  return sprite
}

/** Sparks, shock rings and floating score text. `scale` thins the sparks out for reduced motion. */
export function createParticles(scale = 1) {
  // Fixed ring buffer: no allocation while playing.
  const pool = Array.from({ length: MAX }, () => ({ life: 0 }))
  const texts = []
  const rings = []
  let next = 0

  return {
    burst(x, y, color, count = 10, speed = 160) {
      for (let i = 0; i < Math.ceil(count * scale); i++) {
        const a = Math.random() * Math.PI * 2
        const v = speed * (0.3 + Math.random() * 0.7)
        const p = pool[next]
        next = (next + 1) % MAX
        p.x = x
        p.y = y
        p.vx = Math.cos(a) * v
        p.vy = Math.sin(a) * v
        p.life = p.max = 0.35 + Math.random() * 0.45
        p.size = 2 + Math.random() * 3
        p.color = color
      }
    },
    ring(x, y, color, radius = 60) {
      rings.push({ x, y, color, radius, t: 0 })
    },
    text(x, y, value, color = '#e0f2fe', size = 14) {
      if (texts.length > 14) texts.shift()
      texts.push({ x, y, value, color, size, t: 0 })
    },
    clear() {
      for (const p of pool) p.life = 0
      texts.length = 0
      rings.length = 0
    },
    update(dt) {
      for (const p of pool) {
        if (p.life <= 0) continue
        p.life -= dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 260 * dt
      }
      for (let i = texts.length - 1; i >= 0; i--) {
        texts[i].t += dt
        texts[i].y -= 30 * dt
        if (texts[i].t > 0.9) texts.splice(i, 1)
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].t += dt
        if (rings[i].t > 0.35) rings.splice(i, 1)
      }
    },
    draw(ctx) {
      for (const p of pool) {
        if (p.life <= 0) continue
        ctx.globalAlpha = Math.min(1, p.life / p.max)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
      for (const r of rings) {
        const k = r.t / 0.35
        ctx.globalAlpha = 1 - k
        ctx.strokeStyle = r.color
        ctx.lineWidth = 4 * (1 - k) + 1
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius * k, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const t of texts) {
        ctx.globalAlpha = Math.min(1, (0.9 - t.t) * 2.5)
        ctx.fillStyle = t.color
        ctx.font = `800 ${t.size}px Nunito, sans-serif`
        ctx.fillText(t.value, t.x, t.y)
      }
      ctx.globalAlpha = 1
    },
  }
}

/** Navy backdrop with drifting stars. The gradients are cached at the canvas size, so each frame is a plain copy. */
export function createBackground(still = false) {
  const stars = Array.from({ length: 60 }, () => ({
    x: Math.random() * WORLD_W,
    y: Math.random() * WORLD_H,
    size: Math.random() < 0.15 ? 2.2 : 1.2,
    speed: 3 + Math.random() * 12,
    phase: Math.random() * 6,
  }))
  let backdrop = null
  let clock = 0

  function paint(width, height) {
    backdrop = document.createElement('canvas')
    backdrop.width = width
    backdrop.height = height
    const c = backdrop.getContext('2d', { alpha: false })
    c.scale(width / WORLD_W, height / WORLD_H)
    c.fillStyle = '#050714'
    c.fillRect(0, 0, WORLD_W, WORLD_H)
    for (const [x, y, r, color] of [[80, 140, 340, 'rgba(124,58,237,0.20)'], [520, 520, 380, 'rgba(14,165,233,0.14)'], [280, 760, 300, 'rgba(236,72,153,0.10)']]) {
      const glow = c.createRadialGradient(x, y, 0, x, y, r)
      glow.addColorStop(0, color)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = glow
      c.fillRect(0, 0, WORLD_W, WORLD_H)
    }
  }

  return {
    update(dt) {
      if (still) return
      clock += dt
      for (const s of stars) {
        s.y += s.speed * dt
        if (s.y > WORLD_H) s.y = 0
      }
    },
    draw(ctx) {
      const { width, height } = ctx.canvas
      if (backdrop?.width !== width || backdrop.height !== height) paint(width, height)
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(backdrop, 0, 0)
      ctx.restore()
      ctx.fillStyle = '#c7d2fe'
      for (const s of stars) {
        ctx.globalAlpha = 0.3 + Math.sin(clock * 2 + s.phase) * 0.2
        ctx.fillRect(s.x, s.y, s.size, s.size)
      }
      ctx.globalAlpha = 1
    },
  }
}

export function drawShield(ctx, clock) {
  ctx.fillStyle = 'rgba(34,211,238,0.22)'
  ctx.fillRect(0, SHIELD_Y - 4, WORLD_W, 10)
  ctx.fillStyle = '#67e8f9'
  ctx.globalAlpha = 0.7 + Math.sin(clock * 8) * 0.3
  ctx.fillRect(0, SHIELD_Y, WORLD_W, 3)
  ctx.globalAlpha = 1
}
