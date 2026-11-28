import { WORLD_W } from '../data/constants.js'

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

// A ball flying almost flat would take forever to come down, so keep some vertical movement.
const MIN_VERTICAL = 0.26
const MAX_PADDLE_ANGLE = (62 * Math.PI) / 180

/** Normalises the ball direction and enforces the minimum vertical component. */
export function steady(ball) {
  const length = Math.hypot(ball.dx, ball.dy) || 1
  ball.dx /= length
  ball.dy /= length
  if (Math.abs(ball.dy) < MIN_VERTICAL) {
    ball.dy = ball.dy > 0 ? MIN_VERTICAL : -MIN_VERTICAL
    ball.dx = Math.sign(ball.dx || 1) * Math.sqrt(1 - MIN_VERTICAL ** 2)
  }
}

/** Mirrors the direction on a surface normal, only when the ball is moving into the surface. */
export function reflect(ball, nx, ny) {
  const dot = ball.dx * nx + ball.dy * ny
  if (dot >= 0) return false
  ball.dx -= 2 * dot * nx
  ball.dy -= 2 * dot * ny
  steady(ball)
  return true
}

/** The further from the paddle centre the ball lands, the sharper it leaves. */
export function aimFromPaddle(ball, paddle) {
  const angle = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1) * MAX_PADDLE_ANGLE
  ball.dx = Math.sin(angle)
  ball.dy = -Math.cos(angle)
}

export function bounceWalls(ball) {
  let hit = false
  if (ball.x < ball.r) {
    ball.x = ball.r
    hit = reflect(ball, 1, 0)
  } else if (ball.x > WORLD_W - ball.r) {
    ball.x = WORLD_W - ball.r
    hit = reflect(ball, -1, 0)
  }
  if (ball.y < ball.r) {
    ball.y = ball.r
    hit = reflect(ball, 0, 1) || hit
  }
  return hit
}

/** Ball speed rises with the level and with each paddle hit. */
export function ballSpeed({ base, level, paddleHits, slow }) {
  return base * (1 + Math.min(level - 1, 12) * 0.028) * (1 + Math.min(paddleHits, 40) * 0.005) * (slow ? 0.65 : 1)
}
