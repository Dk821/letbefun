import { LASER_SPEED, PADDLE_H, PADDLE_KEY_SPEED, PADDLE_Y, WORLD_W } from '../data/constants.js'
import { clamp } from './physics.js'

export const createPaddle = (width) => ({ x: WORLD_W / 2, y: PADDLE_Y, w: width, h: PADDLE_H, baseW: width, vx: 0, squash: 0 })

export function updatePaddle(paddle, input, effects, dt) {
  const width = paddle.baseW * (effects.expand > 0 ? 1.5 : effects.shrink > 0 ? 0.65 : 1)
  paddle.w += (width - paddle.w) * Math.min(1, dt * 12)

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  if (dir) {
    // Keys take over from the pointer until the pointer moves again.
    input.targetX = null
    paddle.vx += (dir * PADDLE_KEY_SPEED - paddle.vx) * Math.min(1, dt * 18)
    paddle.x += paddle.vx * dt
  } else {
    paddle.vx = 0
    if (input.nudge) input.targetX = clamp((input.targetX ?? paddle.x) + input.nudge, paddle.w / 2, WORLD_W - paddle.w / 2)
    if (input.targetX != null) paddle.x += (input.targetX - paddle.x) * Math.min(1, dt * 28)
  }
  input.nudge = 0
  paddle.x = clamp(paddle.x, paddle.w / 2, WORLD_W - paddle.w / 2)
  paddle.squash = Math.max(0, paddle.squash - dt * 6)
}

// ---- laser bolts ----
export const createBolts = (paddle) => [-1, 1].map((side) => ({ x: paddle.x + side * (paddle.w / 2 - 6), y: paddle.y - 10 }))

export const moveBolt = (bolt, dt) => {
  bolt.y -= LASER_SPEED * dt
}

export function drawBolts(ctx, bolts) {
  ctx.fillStyle = '#fb7185'
  for (const b of bolts) ctx.fillRect(b.x - 3, b.y - 8, 6, 16)
  ctx.fillStyle = '#fff1f2'
  for (const b of bolts) ctx.fillRect(b.x - 1, b.y - 8, 2, 16)
}

export function drawPaddle(ctx, paddle, effects) {
  const { x, y, w, h, squash } = paddle
  const left = x - w / 2
  const top = y + squash * 3
  const color = effects.laser > 0 ? '#f43f5e' : effects.shrink > 0 ? '#fb7185' : effects.expand > 0 ? '#34d399' : '#22d3ee'

  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  const body = ctx.createLinearGradient(left, 0, left + w, 0)
  body.addColorStop(0, color)
  body.addColorStop(0.5, '#a855f7')
  body.addColorStop(1, color)
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.roundRect(left, top, w, h, h / 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillRect(left + 8, top + 3, w - 16, 2)
  if (effects.laser > 0) {
    ctx.fillStyle = '#fecdd3'
    ctx.fillRect(left + 3, top - 7, 6, 9)
    ctx.fillRect(left + w - 9, top - 7, 6, 9)
  }
}
