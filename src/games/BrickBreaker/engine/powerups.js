import { PICKUP_SPEED, WORLD_H } from '../data/constants.js'
import { POWERUPS } from '../data/powerupTypes.js'
import { rectsOverlap } from './collision.js'

const W = 36
const H = 20

export const createPickup = (type, x, y) => ({ type, x, y, t: 0 })

/** Moves falling capsules and calls `onCollect` for each one the paddle touches. */
export function updatePickups(pickups, paddle, dt, onCollect) {
  // Iterate over a copy: collecting may change the game's lists.
  for (const p of [...pickups]) {
    p.t += dt
    p.y += PICKUP_SPEED * dt
    const caught = rectsOverlap(p.x - W / 2, p.y - H / 2, W, H, paddle.x - paddle.w / 2, paddle.y, paddle.w, paddle.h)
    if (!caught && p.y <= WORLD_H + H) continue
    pickups.splice(pickups.indexOf(p), 1)
    if (caught) onCollect(p)
  }
}

// Icons are drawn in a 14 x 14 box centred on (0, 0).
const GLYPHS = {
  expand: (c) => { c.moveTo(-7, 0); c.lineTo(7, 0); c.moveTo(-3, -4); c.lineTo(-7, 0); c.lineTo(-3, 4); c.moveTo(3, -4); c.lineTo(7, 0); c.lineTo(3, 4) },
  shrink: (c) => { c.moveTo(-7, -4); c.lineTo(-2, 0); c.lineTo(-7, 4); c.moveTo(7, -4); c.lineTo(2, 0); c.lineTo(7, 4) },
  multi: (c) => { for (const [x, y] of [[0, -3], [-5, 3], [5, 3]]) { c.moveTo(x + 2, y); c.arc(x, y, 2, 0, Math.PI * 2) } },
  laser: (c) => { for (const x of [-4, 4]) { c.moveTo(x, 6); c.lineTo(x, -6); c.moveTo(x - 2.5, -3); c.lineTo(x, -6); c.lineTo(x + 2.5, -3) } },
  slow: (c) => { c.arc(0, 0, 6, 0, Math.PI * 2); c.moveTo(0, -3.5); c.lineTo(0, 0); c.lineTo(3, 1.5) },
  fire: (c) => { c.moveTo(0, -7); c.bezierCurveTo(7, -1, 6, 6, 0, 6); c.bezierCurveTo(-6, 6, -6, 0, -2, -2); c.bezierCurveTo(-1, 1, 2, -1, 0, -7) },
  life: (c) => { c.moveTo(0, 6); c.bezierCurveTo(-10, -1, -4, -9, 0, -3); c.bezierCurveTo(4, -9, 10, -1, 0, 6) },
  shield: (c) => { c.moveTo(0, -7); c.lineTo(6, -4); c.quadraticCurveTo(6, 3, 0, 7); c.quadraticCurveTo(-6, 3, -6, -4); c.closePath() },
}

export function drawPickups(ctx, pickups) {
  for (const p of pickups) {
    const { color } = POWERUPS[p.type]
    ctx.save()
    ctx.translate(p.x, p.y)
    const pulse = 1 + Math.sin(p.t * 8) * 0.06
    ctx.scale(pulse, pulse)
    ctx.globalAlpha = 0.28
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(-W / 2 - 4, -H / 2 - 4, W + 8, H + 8, H)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.fillStyle = '#0b1026'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(-W / 2, -H / 2, W, H, H / 2)
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    GLYPHS[p.type](ctx)
    ctx.stroke()
    ctx.restore()
  }
}
