// Parallax space backdrop: gradient, nebulae, a distant planet and three star layers.
import { WORLD_H, WORLD_MAX_W } from '../data/constants.js'
import { rand } from './pool.js'
import { offscreen } from './sprites.js'

const LAYERS = [
  { count: 90, speed: 14, size: 1, color: '#64748b' },
  { count: 55, speed: 40, size: 1.6, color: '#a5b4fc' },
  { count: 24, speed: 105, size: 2.4, color: '#e0f2fe' },
]
const SPAN = WORLD_MAX_W + 40

export function createBackground() {
  return {
    scroll: 0,
    layers: LAYERS.map((l) => ({ ...l, stars: Array.from({ length: l.count }, () => ({ x: rand(0, SPAN), y: rand(0, WORLD_H), twinkle: rand(0, 6) })) })),
    sky: null,
  }
}

export function updateBackground(bg, dt, boost = 1) {
  bg.scroll += dt * boost
  for (const layer of bg.layers) {
    for (const s of layer.stars) {
      s.x -= layer.speed * boost * dt
      if (s.x < -10) {
        s.x += SPAN
        s.y = rand(0, WORLD_H)
      }
    }
  }
}

function paintSky() {
  const c = offscreen(WORLD_MAX_W, WORLD_H)
  const g = c.getContext('2d')
  const base = g.createLinearGradient(0, 0, 0, WORLD_H)
  base.addColorStop(0, '#02030a')
  base.addColorStop(0.5, '#070b22')
  base.addColorStop(1, '#03040f')
  g.fillStyle = base
  g.fillRect(0, 0, c.width, c.height)
  for (const [x, y, r, color] of [[180, 120, 260, '#312e8155'], [620, 440, 300, '#4c1d9544'], [940, 160, 240, '#0e749040']]) {
    const n = g.createRadialGradient(x, y, 0, x, y, r)
    n.addColorStop(0, color)
    n.addColorStop(1, '#00000000')
    g.fillStyle = n
    g.fillRect(0, 0, c.width, c.height)
  }
  return c
}

export function drawBackground(ctx, bg, w) {
  bg.sky ||= paintSky()
  ctx.drawImage(bg.sky, 0, 0, w, WORLD_H, 0, 0, w, WORLD_H)

  const px = w + 160 - ((bg.scroll * 7) % (w + 340))
  const planet = ctx.createRadialGradient(px - 26, 372, 6, px, 400, 74)
  planet.addColorStop(0, '#4f46e5')
  planet.addColorStop(1, '#0b1030')
  ctx.fillStyle = planet
  ctx.beginPath()
  ctx.arc(px, 400, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(103,232,249,.28)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(px, 400, 112, 20, -0.35, 0, Math.PI * 2)
  ctx.stroke()

  bg.layers.forEach((layer, i) => {
    ctx.fillStyle = layer.color
    for (const s of layer.stars) {
      if (s.x > w) continue
      ctx.globalAlpha = 0.65 + Math.sin(bg.scroll * 3 + s.twinkle) * 0.35
      ctx.fillRect(s.x, s.y, i === 2 ? layer.size * 5 : layer.size, i === 2 ? 1.4 : layer.size)
    }
  })
  ctx.globalAlpha = 1
}
