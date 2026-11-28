import { BALL_R } from '../data/constants.js'
import { glowSprite } from './particles.js'

const TRAIL = 10

export const createBall = (x, y, dx = 0, dy = -1, stuck = false) => ({ x, y, dx, dy, r: BALL_R, stuck, offset: 0, trail: [] })

export function recordTrail(ball) {
  ball.trail.push(ball.x, ball.y)
  if (ball.trail.length > TRAIL * 2) ball.trail.splice(0, 2)
}

export function drawBalls(ctx, balls, fire) {
  const glow = glowSprite(fire ? '#fb923c' : '#67e8f9')
  for (const b of balls) {
    const n = b.trail.length / 2
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < n; i++) {
      const k = (i + 1) / n
      const size = b.r * (fire ? 4.4 : 3) * k
      ctx.globalAlpha = k * (fire ? 0.55 : 0.32)
      ctx.drawImage(glow, b.trail[i * 2] - size / 2, b.trail[i * 2 + 1] - size / 2, size, size)
    }
    ctx.globalAlpha = 1
    ctx.drawImage(glow, b.x - b.r * 3, b.y - b.r * 3, b.r * 6, b.r * 6)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = fire ? '#fff7ed' : '#f0fdff'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  }
}
