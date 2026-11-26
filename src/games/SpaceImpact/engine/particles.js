import { createPool, rand } from './pool.js'
import { glow } from './sprites.js'

export const createParticles = () =>
  createPool(420, { x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 3, color: '#ffffff', kind: 'spark', text: '' })

export function burst(g, x, y, color, count, speed = 200, size = 5) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2)
    const v = rand(speed * 0.2, speed)
    const life = rand(0.25, 0.7)
    g.particles.spawn({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: rand(size * 0.5, size * 1.4), color })
  }
}

export function ring(g, x, y, color, size) {
  g.particles.spawn({ x, y, life: 0.45, max: 0.45, size, color, kind: 'ring' })
}

export function popup(g, x, y, text, color = '#e0f2fe') {
  g.particles.spawn({ x, y, vy: -40, life: 0.9, max: 0.9, color, text, kind: 'text' })
}

export function explode(g, x, y, color, scale = 1) {
  burst(g, x, y, color, Math.round(14 * scale), 190 * Math.sqrt(scale), 6 * Math.sqrt(scale))
  burst(g, x, y, '#fb923c', Math.round(8 * scale), 130, 7)
  ring(g, x, y, color, 34 * scale)
}

export function updateParticles(g, dt) {
  for (const p of g.particles.items) {
    if (!p.active) continue
    p.life -= dt
    if (p.life <= 0) {
      p.active = false
      continue
    }
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.kind === 'spark') {
      const drag = Math.max(0, 1 - 2.5 * dt)
      p.vx *= drag
      p.vy *= drag
    }
  }
}

export function drawParticles(ctx, g) {
  for (const p of g.particles.items) {
    if (!p.active) continue
    const k = p.life / p.max
    ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.4))
    if (p.kind === 'spark') {
      ctx.globalCompositeOperation = 'lighter'
      glow(ctx, p.color, p.x, p.y, p.size * (0.4 + k))
      ctx.globalCompositeOperation = 'source-over'
    } else if (p.kind === 'ring') {
      ctx.strokeStyle = p.color
      ctx.lineWidth = 1 + 4 * k
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (1.4 - k), 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = p.color
      ctx.font = '700 16px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(p.text, p.x, p.y)
    }
  }
  ctx.globalAlpha = 1
}
